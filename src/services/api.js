import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
});

const DEMO_MODE_ENABLED = String(import.meta.env.VITE_ENABLE_DEMO_MODE ?? 'true').toLowerCase() !== 'false';
const DEMO_TOKEN = 'demo-jwt-token';
const DEMO_USERS_KEY = 'demo_users';
const DEMO_ALUMNI_KEY = 'demo_alumni';
const DEMO_COOKIES_KEY = 'demo_linkedin_cookies';

const defaultDemoUsers = [
  { id: 'u1', name: 'Dr. Meera Nair', email: 'meera.hod@alumin.edu', department: 'Computer Science', role: 'HOD', status: 'Active' },
  { id: 'u2', name: 'Prof. Arjun Rao', email: 'arjun.prof@alumin.edu', department: 'Computer Science', role: 'Professor', status: 'Active' },
  { id: 'u3', name: 'Prof. Kavya Menon', email: 'kavya.prof@alumin.edu', department: 'Information Technology', role: 'Professor', status: 'Blocked' },
];

const defaultDemoAlumni = [
  { id: 'a1', name: 'Riya Sharma', company: 'Google', passout_year: 2018 },
  { id: 'a2', name: 'Aman Verma', company: 'Microsoft', passout_year: 2017 },
  { id: 'a3', name: 'Neha Iyer', company: 'Amazon', passout_year: 2019 },
  { id: 'a4', name: 'Kunal Gupta', company: 'Infosys', passout_year: 2016 },
  { id: 'a5', name: 'Sneha Reddy', company: 'TCS', passout_year: 2020 },
];

const toPromise = (value, delay = 350) =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });

const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const ensureDemoSeed = () => {
  if (!readJson(DEMO_USERS_KEY, null)) {
    writeJson(DEMO_USERS_KEY, defaultDemoUsers);
  }
  if (!readJson(DEMO_ALUMNI_KEY, null)) {
    writeJson(DEMO_ALUMNI_KEY, defaultDemoAlumni);
  }
};

const normalizeStatus = (user) => {
  if (user.status) return user.status;
  return user.blocked || user.isBlocked ? 'Blocked' : 'Active';
};

const getDemoUsers = () => {
  ensureDemoSeed();
  return readJson(DEMO_USERS_KEY, defaultDemoUsers).map((user) => ({ ...user, status: normalizeStatus(user) }));
};

const getDemoAlumni = () => {
  ensureDemoSeed();
  return readJson(DEMO_ALUMNI_KEY, defaultDemoAlumni);
};

const isRecoverableError = (error) => {
  if (!error) return false;
  if (!error.response) return true;
  const status = error.response.status;
  return status >= 500 || status === 404 || status === 405;
};

const withDemoFallback = async (realRequest, demoFactory) => {
  if (!DEMO_MODE_ENABLED) {
    return realRequest();
  }

  try {
    return await realRequest();
  } catch (error) {
    if (isRecoverableError(error)) {
      return demoFactory();
    }
    throw error;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (response) => response.data;

export const login = (payload) =>
  withDemoFallback(
    () => api.post('/login', payload).then(unwrap),
    async () => {
      const users = getDemoUsers();
      const matchedUser = users.find((user) => user.email.toLowerCase() === String(payload?.email || '').toLowerCase());
      const user =
        matchedUser || {
          id: 'u-demo',
          name: 'Demo User',
          email: payload?.email || 'demo@alumin.edu',
          department: 'Computer Science',
          role: 'Professor',
          status: 'Active',
        };

      return toPromise({ token: DEMO_TOKEN, user });
    },
  );

export const register = (payload) =>
  withDemoFallback(
    () => api.post('/register', payload).then(unwrap),
    async () => {
      const users = getDemoUsers();
      const newUser = {
        id: `u-${Date.now()}`,
        name: payload?.email?.split('@')?.[0] || 'New User',
        email: payload?.email || 'new@alumin.edu',
        department: payload?.department || 'Computer Science',
        role: payload?.role || 'Professor',
        status: 'Active',
      };

      writeJson(DEMO_USERS_KEY, [...users, newUser]);
      return toPromise({ token: DEMO_TOKEN, user: newUser });
    },
  );

export const saveCookies = (payload) =>
  withDemoFallback(
    () => api.post('/save-cookies', payload).then(unwrap),
    async () => {
      localStorage.setItem(DEMO_COOKIES_KEY, payload?.cookies || '');
      return toPromise({ message: 'Cookies saved in demo mode.' });
    },
  );

export const extractAlumni = () =>
  withDemoFallback(
    () => api.post('/extract').then(unwrap),
    async () => {
      const alumni = getDemoAlumni();
      const generated = {
        id: `a-${Date.now()}`,
        name: 'Generated Demo Alumni',
        company: 'Demo Corp',
        passout_year: 2021,
      };
      writeJson(DEMO_ALUMNI_KEY, [generated, ...alumni]);
      return toPromise({ message: 'Demo extraction complete.' });
    },
  );

export const getAlumni = () =>
  withDemoFallback(
    () => api.get('/alumni').then(unwrap),
    async () => toPromise({ alumni: getDemoAlumni() }),
  );

export const getUsers = () =>
  withDemoFallback(
    () => api.get('/users').then(unwrap),
    async () => toPromise({ users: getDemoUsers() }),
  );

export const blockUser = (payload) =>
  withDemoFallback(
    () => api.post('/block-user', payload).then(unwrap),
    async () => {
      const users = getDemoUsers();
      const nextUsers = users.map((user) => {
        const userId = user.id || user._id || user.userId;
        if (String(userId) !== String(payload?.userId)) {
          return user;
        }
        const blocked = Boolean(payload?.blocked);
        return { ...user, status: blocked ? 'Blocked' : 'Active', blocked };
      });
      writeJson(DEMO_USERS_KEY, nextUsers);
      return toPromise({ message: 'User status updated in demo mode.' });
    },
  );

export const downloadExcel = async () => {
  return withDemoFallback(
    async () => {
      const response = await api.get('/download', { responseType: 'blob' });
      return response.data;
    },
    async () => {
      const alumni = getDemoAlumni();
      const csv = ['Name,Company,Passout Year', ...alumni.map((item) => `${item.name},${item.company},${item.passout_year || item.passoutYear || item.year || ''}`)].join('\n');
      return toPromise(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    },
  );
};

export default api;

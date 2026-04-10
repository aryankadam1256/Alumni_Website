import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const unwrap = (response) => response.data;

export const login = (payload) => api.post('/login', payload).then(unwrap);
export const register = (payload) => api.post('/register', payload).then(unwrap);
export const saveCookies = (payload) => api.post('/save-cookies', payload).then(unwrap);
export const extractAlumni = () => api.post('/extract').then(unwrap);
export const getAlumni = () => api.get('/alumni').then(unwrap);
export const getUsers = () => api.get('/users').then(unwrap);
export const blockUser = (payload) => api.post('/block-user', payload).then(unwrap);

export const downloadExcel = async () => {
  const response = await api.get('/download', { responseType: 'blob' });
  return response.data;
};

export default api;

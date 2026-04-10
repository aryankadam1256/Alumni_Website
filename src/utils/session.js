export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '='));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const resolveToken = (response) => {
  if (!response || typeof response !== 'object') {
    return null;
  }

  return response.token || response.access_token || response.jwt || response.data?.token || null;
};

export const resolveUser = (response, token) => {
  const fromResponse = response?.user || response?.data?.user || response?.profile || response?.data?.profile;
  const fromToken = decodeJwtPayload(token || resolveToken(response)) || {};
  const candidate = fromResponse || fromToken;

  if (!candidate) {
    return null;
  }

  return {
    name: candidate.name || candidate.full_name || candidate.fullName || candidate.email || '',
    email: candidate.email || candidate.username || '',
    department: candidate.department || candidate.dept || candidate.department_name || '',
    role: candidate.role || candidate.user_role || '',
    ...candidate,
  };
};

export const getStoredSession = () => {
  const token = localStorage.getItem('token');
  const storedUser = localStorage.getItem('user');
  let user = null;

  if (storedUser) {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  if (!user) {
    user = resolveUser(null, token);
  }

  return {
    token,
    user,
  };
};

export const setStoredSession = (response) => {
  const token = resolveToken(response);
  const user = resolveUser(response, token);

  if (token) {
    localStorage.setItem('token', token);
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  return {
    token,
    user,
  };
};

export const clearStoredSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

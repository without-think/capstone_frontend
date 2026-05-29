export const BASE_URL = 'http://localhost:8080';

export const buildApiUrl = (path) => `${BASE_URL}${path}`;

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem('jwt_token');
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const res = await fetch(buildApiUrl(path), {
    headers: { 'Content-Type': 'application/json', ...authHeader, ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
};

export const logout = async () => {
  try {
    await fetch(buildApiUrl('/api/auth/logout'), { method: 'POST' });
  } catch {}
  localStorage.removeItem('jwt_token');
};

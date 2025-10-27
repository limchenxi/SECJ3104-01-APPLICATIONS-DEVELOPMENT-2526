import API from '../api';

const TOKEN_KEY = 'token';

export const authService = {
  login: async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    return res.data;
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getProfile: async () => {
    const res = await API.get('/auth/me');
    return res.data;
  },
};
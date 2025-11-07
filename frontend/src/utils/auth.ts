export const getAuthToken = () => localStorage.getItem('app_dev:auth_token');
export const setAuthToken = (token: string | null) => localStorage.setItem('app_dev:auth_token', token || '');

export const Auth = {
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
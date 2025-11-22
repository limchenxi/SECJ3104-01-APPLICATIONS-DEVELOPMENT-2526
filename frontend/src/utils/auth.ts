export const getAuthToken = () => localStorage.getItem('app_dev:auth_token');
export const setAuthToken = (token: string | null) => {
  if (token === null) {
    localStorage.removeItem('app_dev:auth_token');
  } else {
    localStorage.setItem('app_dev:auth_token', token);
  }
};

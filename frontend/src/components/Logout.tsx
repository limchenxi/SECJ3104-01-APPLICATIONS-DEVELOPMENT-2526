import { enqueueSnackbar } from 'notistack';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Logout = () => {
  const { logout } = useAuth();
  logout();
  enqueueSnackbar({
    variant: 'success',
    message: 'Logged Out',
  });
  return <Navigate to="/login" />;
};

export default Logout;
import { useSnackbar } from 'notistack';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useEffect } from 'react';

const Logout = () => {
  const { logout } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    logout();
    enqueueSnackbar({
      variant: "success",
      message: "Logged out"
    });
  }, [logout, enqueueSnackbar]);

  return <Navigate to="/login"/>
}


export default Logout;
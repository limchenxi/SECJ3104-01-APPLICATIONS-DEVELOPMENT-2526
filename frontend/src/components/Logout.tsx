import { enqueueSnackbar } from 'notistack';
import { useEffect } from "react";
import { Navigate } from 'react-router-dom';
import { Auth } from '../utils/auth';

const Logout = () => {
  useEffect(() => {
    Auth.logout();
    enqueueSnackbar({
      variant: 'success',
      message: 'Logged Out',
    });
  }, []);
  return <Navigate to="/login" />;
};

export default Logout;
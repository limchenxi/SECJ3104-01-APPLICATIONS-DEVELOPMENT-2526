import { Outlet } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function PentadbirLayout() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate("/login");
      return;
    }

    if (user.role !== "PENTADBIR") {
      navigate("/"); // Redirect non-pentadbir users
    }
  }, [user, isAuthenticated, navigate]);

  if (!user || user.role !== "PENTADBIR") {
    return null;
  }

  return <Outlet />;
}

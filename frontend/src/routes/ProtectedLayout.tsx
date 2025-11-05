import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { resolveRedirectPath } from "../utils/navigation";

export default function ProtectedLayout() {
  const location = useLocation();
  const { isInitialized, isLoading, isAuthenticated } = useAuth();

  if (!isInitialized || isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    const redirectPath = resolveRedirectPath(
      `${location.pathname}${location.search}${location.hash}`,
      "/"
    );
    const search = `?redirect=${encodeURIComponent(redirectPath)}`;
    return <Navigate to={`/login${search}`} replace />;
  }

  return <Outlet />;
}

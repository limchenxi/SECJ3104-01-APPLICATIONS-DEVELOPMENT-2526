import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { resolveRedirectPath } from "../utils/navigation";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar";

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar />

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "#f7f9fc",
            minHeight: "calc(100vh - 64px)", // minus navbar height
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );;
}

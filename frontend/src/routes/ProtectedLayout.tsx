import { Box, CircularProgress } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";
import NavBar from "../components/NavBar";
import { useState } from "react";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 70;

export default function ProtectedLayout() {
  const { isInitialized, isLoading, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const handleDrawerToggle = () => {
    setOpen(!open);
  };

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
    return <Navigate to={`/login`} replace />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <NavBar 
        onMenuClick={handleDrawerToggle} 
        sidebarOpen={open}
      />

      <Box sx={{ display: "flex", flexGrow: 1 }}>
        <Sidebar 
          isOpen={open} 
          drawerWidth={DRAWER_WIDTH} 
          collapsedWidth={COLLAPSED_WIDTH}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: "#f7f9fc",
            minHeight: "calc(100vh - 64px)", // minus navbar height
            ml: { sm: open ? `${DRAWER_WIDTH}px` : `${COLLAPSED_WIDTH}px` },
            transition: (theme) =>
              theme.transitions.create(["margin"], {
                easing: theme.transitions.easing.easeOut,
                duration: theme.transitions.duration.enteringScreen,
              }),
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );;
}

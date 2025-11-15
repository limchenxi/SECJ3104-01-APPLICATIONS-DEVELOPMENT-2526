import { Box, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

const pentadbirSidebarItems = [
  { label: "Halaman Utama", to: "/pentadbir" },
  { label: "Kedatangan", to: "/pentadbir/kedatangan" },
  { label: "Cerapan", to: "/pentadbir/cerapan" },
  // { label: "Tugasan Cerapan", to: "/pentadbir/observation-tasks" },
  { label: "Template Rubrik", to: "/pentadbir/template-rubrik" },
  { label: "Profil", to: "/pentadbir/profil" },
  { label: "Log Keluar", to: "/logout" },
];

export default function PentadbirSidebar() {
  const { user } = useAuth();

  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        minHeight: "100vh",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
          Panel Pentadbir
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user.name}
          </Typography>
        )}
      </Box>
      
      <Divider />
      
      {/* Navigation Items */}
      <List sx={{ flexGrow: 1 }}>
        {pentadbirSidebarItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            sx={{
              "&.active": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
                "& .MuiListItemText-primary": {
                  fontWeight: 600,
                },
              },
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
}

import { Box, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import type { ReactNode } from "react";

interface SidebarItem {
  label: string;
  to: string;
}

interface SidebarProps {
  items?: SidebarItem[];
  header?: ReactNode;
  footer?: ReactNode;
  width?: number;
}

const guruSidebarItems: SidebarItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Cerapan Kendiri", to: "/cerapan" },
  { label: "Kedatangan", to: "/kedatangan" },
  { label: "RPH Generator", to: "/rph" },
  { label: "AI Quiz", to: "/quiz" },
  { label: "Profile", to: "/profile" },
  { label: "Logout", to: "/logout" },
];

const pentadbirSidebarItems: SidebarItem[] = [
  { label: "Halaman Utama", to: "/pentadbir" },
  { label: "Kedatangan", to: "/pentadbir/kedatangan" },
  { label: "Cerapan", to: "/pentadbir/cerapan" },
  { label: "Template Rubrik", to: "/pentadbir/template-rubrik" },
  { label: "Profil", to: "/pentadbir/profil" },
  { label: "Log Keluar", to: "/logout" },
];

export default function Sidebar({
  items,
  header,
  footer,
  width = 240,
}: SidebarProps) {
  const { user } = useAuth();
  
  // Determine which items to show based on user role
  const sidebarItems = items || (user?.role === "PENTADBIR" ? pentadbirSidebarItems : guruSidebarItems);
  
  // Determine header content based on user role
  const defaultHeader = (
    <>
      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
        {user?.role === "PENTADBIR" ? "Panel Pentadbir" : "Panel Guru"}
      </Typography>
      {user && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {user.name}
        </Typography>
      )}
    </>
  );

  return (
    <Box
      component="nav"
      sx={{
        width,
        minHeight: "100vh",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ p: 2 }}>{header || defaultHeader}</Box>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {sidebarItems.map((item) => (
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
      {footer ? <Box sx={{ p: 2 }}>{footer}</Box> : null}
    </Box>
  );
}

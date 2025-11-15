import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
];

const pentadbirSidebarItems: SidebarItem[] = [
  { label: "Halaman Utama", to: "/pentadbir" },
  { label: "Kedatangan", to: "/pentadbir/kedatangan" },
  { label: "Cerapan", to: "/pentadbir/cerapan" },
  { label: "Template Rubrik", to: "/pentadbir/template-rubrik" },
  { label: "Profil", to: "/pentadbir/profil" },
];

const devSidebarItems: SidebarItem[] = [
  { label: "AI Management", to: "/ai" },
  { label: "User List", to: "/users" },
];

export default function Sidebar({
  header,
  footer,
  width = 240,
}: SidebarProps) {
  const { user } = useAuth();
  const role = user?.role;

  const headerTitle =
    role === "DEVELOPER"
      ? "Developer Panel"
      : role === "PENTADBIR"
      ? "Panel Pentadbir"
      : "Panel Guru";

  // ----------------------------------------------------------
  // NORMAL USER (guru/pentadbir)
  // ----------------------------------------------------------
  if (role !== "DEVELOPER") {
    const items =
      role === "PENTADBIR" ? pentadbirSidebarItems : guruSidebarItems;

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
        {/* Header */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {headerTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.name}
          </Typography>
        </Box>

        <Divider />

        <List sx={{ flexGrow: 1 }}>
          {items.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                "&.active": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                },
              }}
            >
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <ListItemButton component={NavLink} to="/logout">
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Box>
    );
  }

  // ----------------------------------------------------------
  // DEVELOPER SIDEBAR (with accordion)
  // ----------------------------------------------------------
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
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Developer Panel
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user?.name}
        </Typography>
      </Box>
      <Divider />

      <List sx={{ flexGrow: 1 }}>
        {/* Guru Accordion */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Guru Module</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {guruSidebarItems.map((item) => (
              <ListItemButton
                component={NavLink}
                to={item.to}
                key={item.to}
                sx={{
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Pentadbir Accordion */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Pentadbir Module</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {pentadbirSidebarItems.map((item) => (
              <ListItemButton
                component={NavLink}
                to={item.to}
                key={item.to}
                sx={{
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Dev Tools */}
        <Divider sx={{ my: 1 }} />

        <Typography px={2} py={1} fontWeight={600} fontSize={14}>
          Developer Tools
        </Typography>

        {devSidebarItems.map((item) => (
          <ListItemButton
            component={NavLink}
            to={item.to}
            key={item.to}
            sx={{
              "&.active": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <ListItemButton component={NavLink} to="/logout">
        <ListItemText primary="Logout" />
      </ListItemButton>
    </Box>
  );
}

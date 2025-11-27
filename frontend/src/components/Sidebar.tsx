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

// Import menu config
import { SidebarItem } from "./SidebarItem";

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const menu = SidebarItem[role] || [];

  const headerTitle =
    role === "SUPERADMIN"
      ? "Super Admin Panel"
      : role === "PENTADBIR"
      ? "Panel Pentadbir"
      : "Panel Guru";

  const width = 260;

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
        overflow: "hidden",
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

      {/* NORMAL ROLES: Guru / Pentadbir */}
      {role !== "SUPERADMIN" && (
        <List sx={{ flexGrow: 1 }}>
          {menu.map((item) => (
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
      )}

      {/* SUPERADMIN ROLE: with accordions */}
      {role === "SUPERADMIN" && (
        <List sx={{ flexGrow: 1 }}>
          {menu.map((item, idx) =>
            item.children ? (
              <Accordion key={idx} disableGutters elevation={0}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography fontWeight={600}>{item.label}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {item.children.map((c, i) => (
                    <ListItemButton
                      key={i}
                      component={NavLink}
                      to={c.to}
                      sx={{
                        "&.active": {
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                        },
                      }}
                    >
                      <ListItemText primary={c.label} />
                    </ListItemButton>
                  ))}
                </AccordionDetails>
              </Accordion>
            ) : (
              <ListItemButton
                key={idx}
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
            )
          )}
        </List>
      )}

      {/* Logout */}
      {/* <ListItemButton component={NavLink} to="/logout">
        <ListItemText primary="Logout" />
      </ListItemButton> */}
    </Box>
  );
}

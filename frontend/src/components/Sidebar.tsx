import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { NavLink } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { SidebarItem } from "./SidebarItem";
import { useState, type SyntheticEvent } from "react";

interface SidebarProps {
    isOpen: boolean;
    drawerWidth: number;
    collapsedWidth: number;
}

export default function Sidebar({ isOpen, drawerWidth, collapsedWidth }: SidebarProps) {
  const { user } = useAuth();
  const role = user?.role;

  const menu = SidebarItem[role] || [];
  const width = isOpen ? drawerWidth : collapsedWidth;
  const headerTitle =
    role === "SUPERADMIN"
      ? "Super Admin Panel"
      : role === "PENTADBIR"
      ? "Panel Pentadbir"
      : "Panel Guru";

  const getIcon = (label: string) => <Box sx={{ width: 24, height: 24, bgcolor: '#90CAF9', borderRadius: 1 }} />;

  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);

    const handleAccordionChange = (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
        setExpandedAccordion(isExpanded ? panel : false);
    };

  return (
    <Box
      component="nav"
      sx={{
        width: width,
        minHeight: "100vh",
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        position: "fixed",
        overflow: "hidden",
        transition: (theme) =>
          theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        position: "fixed",
        zIndex: (theme) => theme.zIndex.drawer,
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, 
          whiteSpace: "nowrap",
          overflow: "hidden",
          // textOverflow: "ellipsis", 
         }}>
        <Typography variant="h6" sx={{ fontWeight: 600, opacity: isOpen ? 1 : 0 }}>
          {headerTitle}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ opacity: isOpen ? 1 : 0 }}>
          {user?.name}
        </Typography>
      </Box>

      <Divider />

      {/* NORMAL ROLES: Guru / Pentadbir */}
      {role !== "SUPERADMIN" && (
        <List sx={{ flexGrow: 1, p: 1 }}>
          {menu.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                justifyContent: isOpen ? "initial" : "center", 
                minHeight: 48,
                px: 2.5,
                "&.active": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : "auto", justifyContent: "center" }}>
                {getIcon(item.label)}
              </ListItemIcon>
              <ListItemText primary={item.label} sx={{ opacity: isOpen ? 1 : 0 }} />
            </ListItemButton>
          ))}
        </List>
      )}

      {/* SUPERADMIN ROLE: with accordions */}
      {role === "SUPERADMIN" && (
        <List sx={{ flexGrow: 1, p: 1 }}>
          {menu.map((item, idx) =>
            item.children ? (
              <Accordion 
                key={idx} 
                disableGutters 
                elevation={0} 
                expanded={isOpen && expandedAccordion === item.label} 
                onChange={isOpen ? handleAccordionChange(item.label) : undefined} 
                sx={{ 
                    "&:before": { display: "none" }, 
                    bgcolor: 'background.paper'
                }}
              >
                <AccordionSummary expandIcon={isOpen ? <ExpandMoreIcon /> : null} 
                    sx={{ 
                        height: 48, 
                        minHeight: 48,
                        justifyContent: isOpen ? "initial" : "center",
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : "auto", justifyContent: "center" }}>
                      {getIcon(item.label)} 
                    </ListItemIcon>
                    <Typography fontWeight={600} sx={{ opacity: isOpen ? 1 : 0, whiteSpace: "nowrap" }}>
                      {item.label}
                    </Typography>
                </AccordionSummary>
                {isOpen && (
                    <AccordionDetails sx={{ p: 0, ml: 1 }}>
                    {item.children.map((c, i) => (
                        <ListItemButton
                            key={i}
                            component={NavLink}
                            to={c.to}
                            sx={{
                                pl: 4, // 增加内边距表示子项
                                minHeight: 40,
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
                )}
              </Accordion>
            ) : (
              <ListItemButton
                key={idx}
                component={NavLink}
                to={item.to}
                sx={{
                  justifyContent: isOpen ? "initial" : "center",
                  minHeight: 48,
                  px: 2.5,
                  "&.active": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: isOpen ? 3 : "auto", justifyContent: "center" }}>
                    {getIcon(item.label)} 
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ opacity: isOpen ? 1 : 0 }} />
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

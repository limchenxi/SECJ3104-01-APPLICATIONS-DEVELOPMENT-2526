import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  alpha,
  Box,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { NavLink, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { SidebarItem, type MenuItem } from "./SidebarItem";
import { useState, type SyntheticEvent } from "react";
import type { UserRole } from "../features/Users/type";
import { LayoutDashboard } from "lucide-react";
import React from "react";

interface SidebarProps {
  isOpen: boolean;
  drawerWidth: number;
  collapsedWidth: number;
}
const getHighestRole = (roles: UserRole[] | undefined): UserRole | null => {
  if (!roles || roles.length === 0) return null;
  if (roles.includes("SUPERADMIN")) return "SUPERADMIN";
  if (roles.includes("PENTADBIR")) return "PENTADBIR";
  if (roles.includes("GURU")) return "GURU";
  return null;
};

export default function Sidebar({
  isOpen,
  drawerWidth,
  collapsedWidth,
}: SidebarProps) {
  const { user } = useAuth() as {
    user: { name: string; role: UserRole[] } | null;
  };
  const theme = useTheme();
  const location = useLocation();

  const highestRole = getHighestRole(user?.role);

  const menu = React.useMemo(() => {
    const baseMenu = highestRole ? SidebarItem[highestRole] : [];
    if (highestRole === "PENTADBIR" && !user?.role?.includes("GURU")) {
      return baseMenu.filter((item) => item.label !== "Modul Guru");
    }
    return baseMenu;
  }, [highestRole, user?.role]);

  const width = isOpen ? drawerWidth : collapsedWidth;
  const headerTitle =
    highestRole === "SUPERADMIN"
      ? "Panel Super Admin"
      : highestRole === "PENTADBIR"
        ? "Panel Pentadbir"
        : "Panel Guru";

  // const getIcon = (label: string) => <Box sx={{ width: 24, height: 24, bgcolor: '#90CAF9', borderRadius: 1 }} />;

  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );

  const handleAccordionChange =
    (panel: string) => (event: SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);
    };

  const renderItemContent = (item: MenuItem, isChild: boolean = false) => {
    const IconComponent = item.icon || LayoutDashboard; // Default icon if needed
    const isActive = item.to && location.pathname.startsWith(item.to); // Check active state

    const sxProps = {
      justifyContent: isOpen ? "initial" : "center",
      minHeight: isChild ? 40 : 48,
      px: isChild ? 4 : 2.5,
      my: isChild ? 0.2 : 0.5,
      borderRadius: theme.shape.borderRadius,
      transition: "background-color 0.1s ease",
      "&.active, &:hover": {
        bgcolor: alpha(theme.palette.info.main, 0.1),
        color: theme.palette.info.dark,
      },
      "&.active .MuiListItemIcon-root": {
        color: theme.palette.info.main,
      },
      "& .MuiListItemIcon-root": {
        color: isActive ? theme.palette.info.main : theme.palette.grey[600],
        minWidth: 0,
        mr: isOpen ? (isChild ? 1 : 3) : "auto",
        justifyContent: "center",
      },
    };

    if (item.children) {
      return (
        <AccordionSummary
          expandIcon={isOpen ? <ExpandMoreIcon /> : null}
          sx={{
            ...sxProps,
            height: 48,
            minHeight: 48,
            "& .MuiAccordionSummary-content": {
              margin: "12px 0",
              opacity: isOpen ? 1 : 0,
            },
            "& .MuiAccordionSummary-expandIconWrapper": {
              opacity: isOpen ? 1 : 0,
            },
          }}
        >
          <ListItemIcon>
            <IconComponent size={20} />
          </ListItemIcon>
          <Typography fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
            {item.label}
          </Typography>
        </AccordionSummary>
      );
    } else if (item.to) {
      return (
        <ListItemButton component={NavLink} to={item.to} sx={sxProps}>
          <ListItemIcon>
            <IconComponent size={20} />
          </ListItemIcon>
          <ListItemText primary={item.label} sx={{ opacity: isOpen ? 1 : 0 }} />
        </ListItemButton>
      );
    }
    return null;
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
        // position: "fixed",
        zIndex: (theme) => theme.zIndex.drawer,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          whiteSpace: "nowrap",
          overflow: "hidden",
          // textOverflow: "ellipsis",
          minHeight: 64,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: isOpen ? "flex-start" : "center",
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, opacity: isOpen ? 1 : 0 }}
        >
          {headerTitle}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ opacity: isOpen ? 1 : 0 }}
        >
          {user?.name}
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, p: 1 }}>
        {menu.map((item, idx) => {
          const key = item.label || idx;

          return item.children ? (
            <Accordion
              key={idx}
              // key={key} 
              disableGutters
              elevation={0}
              expanded={isOpen && expandedAccordion === item.label}
              onChange={isOpen ? handleAccordionChange(item.label) : undefined}
              sx={{
                "&:before": { display: "none" },
                bgcolor: 'background.paper'
              }}
            >
              {/* Accordion Summary (Parent Link/Label) */}
              {renderItemContent(item)}
              {/* Accordion Details (Children) */}
              {isOpen && (
                <AccordionDetails sx={{ p: 0, ml: 1 }}>
                  {item.children.map((c, i) => {
                    const childKey = c.label || i;
                    return c.to ? (
                      <ListItemButton
                        key={childKey}
                        component={NavLink}
                        to={c.to}
                        sx={{
                          pl: 4,
                          minHeight: 40,
                          my: 0.2,
                          borderRadius: theme.shape.borderRadius,
                          color: theme.palette.grey[700],
                          "&.active, &:hover": {
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.dark
                          },
                        }}
                      >
                        <ListItemText primary={c.label} primaryTypographyProps={{ fontSize: '0.9rem' }} />
                      </ListItemButton>
                    ) : (<ListItemText
                      key={childKey}
                      primary={c.label}
                      sx={{ p: 1.5, pl: 4, opacity: isOpen ? 1 : 0.8 }}
                      primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'text.primary' }}
                    />);
                  }
                  )}
                </AccordionDetails>
              )}
            </Accordion>
          ) : (
            <React.Fragment key={key}>
              {renderItemContent(item)}
            </React.Fragment>
          )
        })}
      </List>

      {/* {role === "SUPERADMIN" && (
      //   <List sx={{ flexGrow: 1, p: 1 }}>
      //     {menu.map((item, idx) =>
      //       item.children ? (
      //         <Accordion
      //           key={idx}
      //           disableGutters
      //           elevation={0}
      //           expanded={isOpen && expandedAccordion === item.label}
      //           onChange={
      //             isOpen ? handleAccordionChange(item.label) : undefined
      //           }
      //           sx={{
      //             "&:before": { display: "none" },
      //             bgcolor: "background.paper",
      //           }}
      //         >
      //           <AccordionSummary
      //             expandIcon={isOpen ? <ExpandMoreIcon /> : null}
      //             sx={{
      //               height: 48,
      //               minHeight: 48,
      //               justifyContent: isOpen ? "initial" : "center",
      //             }}
      //           >
      //             <ListItemIcon
      //               sx={{
      //                 minWidth: 0,
      //                 mr: isOpen ? 3 : "auto",
      //                 justifyContent: "center",
      //               }}
      //             >
      //               {getIcon(item.label)}
      //             </ListItemIcon>
      //             <Typography
      //               fontWeight={600}
      //               sx={{ opacity: isOpen ? 1 : 0, whiteSpace: "nowrap" }}
      //             >
      //               {item.label}
      //             </Typography>
      //           </AccordionSummary>
      //           {isOpen && (
      //             <AccordionDetails sx={{ p: 0, ml: 1 }}>
      //               {item.children.map((c, i) => (
      //                 <ListItemButton
      //                   key={i}
      //                   component={NavLink}
      //                   to={c.to}
      //                   sx={{
      //                     pl: 4, // 增加内边距表示子项
      //                     minHeight: 40,
      //                     "&.active": {
      //                       bgcolor: "primary.main",
      //                       color: "primary.contrastText",
      //                     },
      //                   }}
      //                 >
      //                   <ListItemText primary={c.label} />
      //                 </ListItemButton>
      //               ))}
      //             </AccordionDetails>
      //           )}
      //         </Accordion>
      //       ) : (
      //         <ListItemButton
      //           key={idx}
      //           component={NavLink}
      //           to={item.to}
      //           sx={{
      //             justifyContent: isOpen ? "initial" : "center",
      //             minHeight: 48,
      //             px: 2.5,
      //             "&.active": {
      //               bgcolor: "primary.main",
      //               color: "primary.contrastText",
      //             },
      //           }}
      //         >
      //           <ListItemIcon
      //             sx={{
      //               minWidth: 0,
      //               mr: isOpen ? 3 : "auto",
      //               justifyContent: "center",
      //             }}
      //           >
      //             {getIcon(item.label)}
      //           </ListItemIcon>
      //           <ListItemText
      //             primary={item.label}
      //             sx={{ opacity: isOpen ? 1 : 0 }}
      //           />
      //         </ListItemButton>
      //       )
      //     )}
      //   </List>
      // )}
      {/* Footer */}
      <Box sx={{ mt: 'auto', p: 2, textAlign: isOpen ? 'left' : 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ opacity: isOpen ? 1 : 0 }}>
          {isOpen ? 'Version 1.0.0' : 'V1.0'}
        </Typography>
      </Box>

      {/* Logout */}
      {/* <ListItemButton component={NavLink} to="/logout">
        <ListItemText primary="Logout" />
      </ListItemButton> */}
      {/* ) */}
    </Box>
  );
}

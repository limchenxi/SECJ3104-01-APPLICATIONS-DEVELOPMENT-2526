import { Box, Divider, List, ListItemButton, ListItemText } from "@mui/material";
import { NavLink } from "react-router-dom";
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

const defaultSidebarItems: SidebarItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Cerapan Kendiri", to: "/cerapan" },
  { label: "Kedatangan", to: "/kedatangan" },
  { label: "RPH Generator", to: "/rph" },
  { label: "AI Quiz", to: "/quiz" },
  { label: "Profile", to: "/profile" },
];

export default function Sidebar({
  items = defaultSidebarItems,
  header,
  footer,
  width = 240,
}: SidebarProps) {
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
      {header ? <Box sx={{ p: 2 }}>{header}</Box> : null}
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
      {footer ? <Box sx={{ p: 2 }}>{footer}</Box> : null}
    </Box>
  );
}

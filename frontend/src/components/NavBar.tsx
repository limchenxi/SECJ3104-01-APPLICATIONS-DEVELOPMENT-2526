import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Link as RouterLink } from "react-router-dom";

interface NavItem {
  label: string;
  to: string;
}

interface NavBarProps {
  brand?: string;
  items?: NavItem[];
  trailing?: ReactNode;
}

const defaultItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Kedatangan", to: "/kedatangan" },
  { label: "Cerapan", to: "/cerapan" },
];

export default function NavBar({
  brand = "App Development",
  items = defaultItems,
  trailing,
}: NavBarProps) {
  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ display: "flex", gap: 2 }}>
        <Typography variant="h6" component="div">
          {brand}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexGrow: 1 }}>
          {items.map((item) => (
            <Button
              key={item.to}
              color="inherit"
              component={RouterLink}
              to={item.to}
            >
              {item.label}
            </Button>
          ))}
        </Box>
        {trailing}
      </Toolbar>
    </AppBar>
  );
}

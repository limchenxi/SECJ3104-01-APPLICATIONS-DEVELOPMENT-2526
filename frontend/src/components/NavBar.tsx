import { AppBar, Box, Button, IconButton, Menu, Toolbar, Typography, useTheme } from "@mui/material";
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
  { label: "Profile", to: "/profile" },
];

export default function NavBar({
  brand = "Smart School System",
  items = defaultItems,
  trailing,
}: NavBarProps) {
  const theme = useTheme();
  return (
    <AppBar position="sticky" elevation={3}
      sx={{
        background: theme.palette.primary.main,
        backdropFilter: "blur(8px)",
      }}>
      <Toolbar 
        sx={{ display: "flex", 
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, sm: 4 },}}>
              
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

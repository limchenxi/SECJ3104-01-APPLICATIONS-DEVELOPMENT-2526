import { AppBar, Avatar, Container, Toolbar, Typography } from "@mui/material";
import { Box } from "lucide-react";
import type { ReactNode } from "react";

interface NavBarProps {
  brand?: string;
  trailing?: ReactNode;
}

export default function NavBar({
  brand = "Smart School System",
  trailing,
}: NavBarProps) {
  return (
    <AppBar position="sticky" elevation={3}
      sx={{
        background: "#E3F2FD", // 浅蓝色
        color: "#0D47A1",      // 深蓝色文字
        backdropFilter: "blur(8px)",
      }}>
        <Container>
          <Toolbar 
            sx={{ display: "flex", 
                alignItems: "center",
                justifyContent: "flex-start",
                px: { xs: 2, sm: 4 },}}>
                  
            <Typography variant="h6" component="div">
              {brand}
            </Typography>
            {trailing}
            {/* <Box display="flex" alignItems="center" gap={2}>
              <div className="text-right">
                <Typography variant="subtitle2" color="text.secondary">
                  {currentUser?.role || "Guru"} 
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {currentUser?.name || "Cikgu Ahmad Abdullah"}
                </Typography>
              </div>

              <Avatar
                alt={`${currentUser?.name || "Cikgu Ahmad Abdullah"}'s Avatar`}
                src={currentUser?.profilePhoto ?? undefined}
                sx={{ bgcolor: "#90CAF9", color: "#0D47A1", fontWeight: 600 }}
              >
                {(currentUser?.name?.[0] || "A").toUpperCase()}
              </Avatar>
            </Box> */}
          </Toolbar>
        </Container>
    </AppBar>
  );
}

import { AppBar, Avatar, Button, Container, Toolbar, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

interface NavBarProps {
  brand?: string;
  // trailing?: ReactNode;
}

export default function NavBar({brand = "Smart School System"}: NavBarProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="sticky" elevation={3}
      sx={{
        background: "linear-gradient(90deg, #E3F2FD, #BBDEFB)", // 浅蓝渐变
        color: "#0D47A1", // 深蓝文字
        backdropFilter: "blur(8px)",
      }}>
        <Container maxWidth="xl">
          <Toolbar 
            sx={{ display: "flex", 
                alignItems: "center",
                // justifyContent: "flex-start",
                justifyContent: "space-between",
                px: { xs: 2, sm: 4 },}}>
                  
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 1 }}>
              {brand}
            </Typography>

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
            {/* RIGHT: User info + Logout */}
          <Box display="flex" alignItems="center" gap={2}>
            <Box textAlign="right">
              <Typography variant="subtitle2" color="text.secondary">
                {user?.role}
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {user?.name}
              </Typography>
            </Box>

            <Avatar
              alt={user?.name}
              src={undefined}
              sx={{ bgcolor: "#90CAF9", color: "#0D47A1", fontWeight: 600 }}
            >
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </Avatar>

            <Button
              // variant="outlined"
              // color="error"
              // size="small"
              // onClick={handleLogout}
              // sx={{ textTransform: "none", fontWeight: 600 }}
              variant="contained"
              color="error"
              size="small"
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
              }}
            >
              Logout
            </Button>
          </Box>
          </Toolbar>
        </Container>
    </AppBar>
  );
}

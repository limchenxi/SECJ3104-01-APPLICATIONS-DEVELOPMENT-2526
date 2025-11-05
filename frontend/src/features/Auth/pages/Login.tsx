import { Box } from "@mui/material";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <LoginForm />
    </Box>
  );
}

import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 2,
      }}
    >
      <Typography variant="h2" component="h1">
        404
      </Typography>
      <Typography variant="h5" component="p" color="text.secondary">
        Halaman yang anda cari tidak dijumpai.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Kembali ke Dashboard
      </Button>
    </Box>
  );
}

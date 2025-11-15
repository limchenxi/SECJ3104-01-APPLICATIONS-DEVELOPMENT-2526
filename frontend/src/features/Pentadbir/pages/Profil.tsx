import { Box, Typography, Card, CardContent, Alert, Stack } from "@mui/material";
import { User } from "lucide-react";

export default function Profil() {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Profil Pentadbir
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Halaman profil pentadbir untuk mengurus maklumat akaun.
      </Alert>

      <Card>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
            <Box
              sx={{
                bgcolor: "#1976d220",
                borderRadius: "50%",
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <User size={32} color="#1976d2" />
            </Box>
            <Box>
              <Typography variant="h6">Maklumat Profil</Typography>
              <Typography color="text.secondary" variant="body2">
                Pentadbir Sistem
              </Typography>
            </Box>
          </Stack>
          <Typography color="text.secondary">
            Fungsi untuk mengurus profil akan ditambah di sini.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Users, CheckCircle, Clock, XCircle } from "lucide-react";
import { pentadbirService } from "../api/pentadbirService";
import type { KedatanganStats } from "../type";

export default function Kedatangan() {
  const [stats, setStats] = useState<KedatanganStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadKedatanganStats();
  }, []);

  const loadKedatanganStats = async () => {
    try {
      setLoading(true);
      const data = await pentadbirService.getKedatanganStats();
      setStats(data);
    } catch (err) {
      console.error("Error loading kedatangan stats:", err);
      setError("Gagal memuatkan data kedatangan");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const statsCards = [
    {
      title: "Jumlah Guru",
      value: stats?.totalTeachers || 0,
      icon: Users,
      color: "#1976d2",
    },
    {
      title: "Hadir",
      value: stats?.presentToday || 0,
      icon: CheckCircle,
      color: "#2e7d32",
    },
    {
      title: "Lewat",
      value: stats?.lateToday || 0,
      icon: Clock,
      color: "#ed6c02",
    },
    {
      title: "Tidak Hadir",
      value: stats?.absentToday || 0,
      icon: XCircle,
      color: "#d32f2f",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Kedatangan Guru
      </Typography>

      <Grid container spacing={3}>
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Grid key={card.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {card.title}
                      </Typography>
                      <Typography variant="h4" sx={{ mt: 1 }}>
                        {card.value}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: card.color + "20",
                        borderRadius: 2,
                        p: 1.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={32} color={card.color} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

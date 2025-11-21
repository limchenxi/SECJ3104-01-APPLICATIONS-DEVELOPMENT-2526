import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
} from "@mui/material";
import { Users, ClipboardCheck, AlertCircle, BookOpen } from "lucide-react";
import { pentadbirService } from "../../Pentadbir/api/pentadbirService";
import type { DashboardStats } from "../../Pentadbir/type";

export default function PentadbirDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await pentadbirService.getDashboard();
      setStats(data);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Gagal memuatkan data dashboard");
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
      title: "Jumlah Pengguna",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "#1976d2",
    },
    {
      title: "Jumlah Guru",
      value: stats?.totalTeachers || 0,
      icon: BookOpen,
      color: "#2e7d32",
    },
    {
      title: "Jumlah Cerapan",
      value: stats?.totalCerapan || 0,
      icon: ClipboardCheck,
      color: "#ed6c02",
    },
    {
      title: "Semakan Pending",
      value: stats?.pendingReviews || 0,
      icon: AlertCircle,
      color: "#d32f2f",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard Pentadbir
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

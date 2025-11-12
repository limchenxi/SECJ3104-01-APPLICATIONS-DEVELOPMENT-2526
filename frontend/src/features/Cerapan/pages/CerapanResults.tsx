import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme,
  CircularProgress,
  Alert,
  Grid,
  Chip,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  BookOpen,
  Users,
  Award,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { getReportDetails } from "../api/cerapanService";
import type { CerapanRecord } from "../type";

export default function CerapanResults() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<CerapanRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getReportDetails(id);
      setReport(data);
    } catch (err) {
      console.error("Error loading report:", err);
      setError("Gagal memuatkan laporan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate mock scores for visualization (replace with actual calculation logic)
  const calculateScores = () => {
    if (!report) return { categories: [], radar: [], total: 0, percentage: 0 };

    // Mock data - in real scenario, you'd calculate based on answers
    const categories = [
      { name: "Perancangan Pengajaran", score: 88 },
      { name: "Penyampaian", score: 85 },
      { name: "Pengurusan Bilik Darjah", score: 89 },
      { name: "Komunikasi", score: 92 },
      { name: "Penggunaan BBM", score: 86 },
    ];

    const radar = categories.map((cat) => ({
      category: cat.name.split(" ")[0], // Shortened name for radar
      score: cat.score,
      fullMark: 100,
    }));

    const total = categories.reduce((sum, cat) => sum + cat.score, 0);
    const percentage = Math.round(total / categories.length);

    return { categories, radar, total, percentage };
  };

  const scores = calculateScores();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !report) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || "Laporan tidak dijumpai."}</Alert>
      </Box>
    );
  }

  // const isCompleted = report.self_evaluation.status === "submitted";

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
            <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900] }}>
              Keputusan Penilaian Kendiri
            </Typography>
            <Chip
              icon={<CheckCircle size={16} />}
              label="Berjaya Dihantar"
              sx={{
                bgcolor: theme.palette.success.main,
                color: theme.palette.common.white,
                fontWeight: "bold",
              }}
            />
          </Stack>
          <Typography color="text.secondary">
            Terima kasih kerana melengkapkan penilaian kendiri anda
          </Typography>
        </Box>

        {/* Report Info Card */}
        <Card raised>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BookOpen size={20} style={{ color: theme.palette.primary.main }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Mata Pelajaran
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {report.subject}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Users size={20} style={{ color: theme.palette.primary.main }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Kelas
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {report.class}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Calendar size={20} style={{ color: theme.palette.primary.main }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Tempoh
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {report.period}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Overall Score Card */}
        <Card
          raised
          sx={{
            border: `2px solid ${theme.palette.success.light}`,
            background: `linear-gradient(135deg, ${theme.palette.success.light}30 0%, ${theme.palette.common.white} 100%)`,
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={4} alignItems="center">
              <Box sx={{ textAlign: "center", minWidth: 200 }}>
                <Award size={48} style={{ color: theme.palette.success.main, marginBottom: 16 }} />
                <Typography variant="h2" sx={{ color: theme.palette.success.main, fontWeight: "bold" }}>
                  {scores.percentage}%
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Skor Keseluruhan
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mt={2}>
                  <TrendingUp size={16} style={{ color: theme.palette.success.main }} />
                  <Typography variant="body2" color="success.main">
                    Prestasi Cemerlang
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ flex: 1, width: "100%" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Analisis Prestasi
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Penilaian kendiri anda telah berjaya direkodkan. Pentadbir akan membuat cerapan untuk melengkapkan proses penilaian.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Status: <strong>Menunggu Cerapan Pentadbir</strong>
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Skor Mengikut Kategori
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scores.categories}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Radar Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Profil Kompetensi
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={scores.radar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Skor"
                      dataKey="score"
                      stroke={theme.palette.success.main}
                      fill={theme.palette.success.main}
                      fillOpacity={0.6}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>


        {/* Action Buttons */}
        <Stack direction="row" justifyContent="center" spacing={2}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate("/cerapan")}
          >
            Kembali ke Dashboard
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/cerapan/my-reports")}
          >
            Lihat Semua Laporan
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

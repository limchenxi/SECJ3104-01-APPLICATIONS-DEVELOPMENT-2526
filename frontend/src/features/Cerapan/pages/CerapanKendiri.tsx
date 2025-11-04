import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  useTheme,
  Grid,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Bot,
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  Calendar,
} from "lucide-react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Mock data
const performanceData = [
  { category: "Pedagogi", score: 88, fullMark: 100 },
  { category: "Profesionalisme", score: 85, fullMark: 100 },
  { category: "Penglibatan", score: 89, fullMark: 100 },
];

const barChartData = [
  { name: "Pedagogi", skor: 88 },
  { name: "Profesionalisme", skor: 85 },
  { name: "Penglibatan", skor: 89 },
];

// --- MAIN COMPONENT ---
export default function CerapanPage() {
  const theme = useTheme();
  const [evaluationCompleted, setEvaluationCompleted] = useState(false);

  const stats = {
    totalDays: 195,
    attended: 185,
    absences: 5,
    late: 3,
    mc: 2,
    percentage: 94.9,
  };

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900], mb: 0.5 }}>
            Cerapan Guru – Penilaian Kendiri (Self-Evaluation)
          </Typography>
          <Typography color="text.secondary">
            Sistem penilaian prestasi dan pembangunan profesional guru
          </Typography>
        </Box>

        {/* Evaluation Period Card */}
        <Card raised sx={{
          border: `1px solid ${theme.palette.info.light}`,
          background: `linear-gradient(to right, ${theme.palette.info.light} 5%, ${theme.palette.common.white} 100%)`,
        }}>
          <CardContent>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                  <Typography variant="h6" sx={{ color: theme.palette.grey[900] }}>
                    Tempoh Penilaian Semasa
                  </Typography>
                  <Chip
                    label={evaluationCompleted ? "Selesai" : "Belum Selesai"}
                    sx={{
                      bgcolor: evaluationCompleted ? theme.palette.success.main : theme.palette.info.main,
                      color: theme.palette.common.white,
                      fontWeight: 'bold',
                    }}
                    size="small"
                  />
                </Stack>
                <Typography color="text.secondary">Semester 1, 2025</Typography>
                <Typography variant="body2" color="text.disabled" mt={0.5}>
                  Tarikh Akhir: 31 Mac 2025
                </Typography>
              </Box>

              {!evaluationCompleted && (
                <Button
                  onClick={() => setEvaluationCompleted(true)}
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: theme.palette.info.main,
                    '&:hover': { bgcolor: theme.palette.info.dark },
                    px: 3,
                  }}
                >
                  Mula Penilaian Kendiri
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Results Section - Only shown when completed */}
        {evaluationCompleted && (
          <Stack spacing={3}>
            {/* Overall Score Cards */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card raised sx={{ border: `1px solid ${theme.palette.success.light}`, background: `linear-gradient(to bottom right, ${theme.palette.success.light}30, ${theme.palette.common.white} 100%)` }}>
                  <CardHeader
                    title={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Award size={20} style={{ color: theme.palette.success.main }} />
                        <Typography variant="subtitle1" sx={{ color: theme.palette.success.dark, fontWeight: 'bold' }}>
                          Skor Keseluruhan
                        </Typography>
                      </Stack>
                    }
                  />
                  <CardContent>
                    <Typography variant="h3" sx={{ color: theme.palette.success.main, mb: 1 }}>87</Typography>
                    <Typography color="text.secondary">daripada 100</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} mt={2} sx={{ color: theme.palette.success.main }}>
                      <TrendingUp size={16} />
                      <Typography variant="body2">+5 dari semester lepas</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card raised sx={{ border: `1px solid ${theme.palette.info.light}` }}>
                  <CardHeader
                    title={
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle2 size={20} style={{ color: theme.palette.info.main }} />
                        <Typography variant="subtitle1" sx={{ color: theme.palette.info.dark, fontWeight: 'bold' }}>
                          Status Penilaian
                        </Typography>
                      </Stack>
                    }
                  />
                  <CardContent>
                    <Typography color="text.secondary" mb={0.5}>Telah Diserahkan</Typography>
                    <Typography variant="body2" color="text.disabled">15 Januari 2025</Typography>
                    <Chip
                      label="Cemerlang"
                      size="small"
                      sx={{
                        mt: 2,
                        bgcolor: theme.palette.success.light,
                        color: theme.palette.success.dark,
                        fontWeight: 'bold',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card raised sx={{ border: `1px solid ${theme.palette.secondary.light}` }}>
                  <CardHeader
                    title={
                      <Typography variant="subtitle1" sx={{ color: theme.palette.secondary.dark, fontWeight: 'bold' }}>
                        Pencapaian Kategori
                      </Typography>
                    }
                  />
                  <CardContent>
                    <Stack spacing={2}>
                      {performanceData.map((item) => (
                        <Box key={item.category}>
                          <Stack direction="row" justifyContent="space-between" mb={0.5}>
                            <Typography variant="body2" color="text.secondary">{item.category}</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.secondary.main }}>{item.score}%</Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={item.score}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              bgcolor: theme.palette.grey[200],
                              '& .MuiLinearProgress-bar': {
                                bgcolor: theme.palette.secondary.main,
                              }
                            }}
                          />
                        </Box>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
              {/* Radar Chart */}
              <Grid item xs={12} lg={6}>
                <Card raised sx={{ boxShadow: 1 }}>
                  <CardHeader title="Analisis Prestasi (Radar)" subheader="Visualisasi prestasi mengikut kategori" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={performanceData}>
                        <PolarGrid stroke={theme.palette.grey[300]} />
                        <PolarAngleAxis dataKey="category" tick={{ fill: theme.palette.grey[600], fontSize: 12 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: theme.palette.grey[600], fontSize: 12 }} />
                        <Radar name="Skor" dataKey="score" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.6} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>

              {/* Bar Chart */}
              <Grid item xs={12} lg={6}>
                <Card raised sx={{ boxShadow: 1 }}>
                  <CardHeader title="Analisis Prestasi (Bar)" subheader="Perbandingan skor kategori penilaian" />
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[200]} />
                        <XAxis dataKey="name" tick={{ fill: theme.palette.grey[600], fontSize: 12 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: theme.palette.grey[600], fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: theme.palette.common.white,
                            border: `1px solid ${theme.palette.grey[300]}`,
                            borderRadius: theme.shape.borderRadius,
                            boxShadow: theme.shadows[1],
                            fontSize: 14,
                          }}
                        />
                        <Bar dataKey="skor" fill={theme.palette.primary.main} radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* AI Feedback Card */}
            <Card raised sx={{ border: `1px solid ${theme.palette.info.light}`, background: `linear-gradient(to right, ${theme.palette.info.light} 5%, ${theme.palette.common.white} 100%)` }}>
              <CardHeader
                title={
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ color: theme.palette.info.dark }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      bgcolor: theme.palette.info.light,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <Bot size={24} style={{ color: theme.palette.info.main }} />
                    </Box>
                    <Typography variant="h6" fontWeight="bold">
                      Maklum Balas AI
                    </Typography>
                  </Stack>
                }
                subheader="Analisis automatik berdasarkan data prestasi anda"
              />
              <CardContent>
                <Box sx={{ bgcolor: theme.palette.common.white, borderRadius: theme.shape.borderRadius, p: 3, border: `1px solid ${theme.palette.info.light}` }}>
                  <Typography color="text.secondary" paragraph>
                    "Tahniah! Penglibatan pengajaran anda telah meningkat sejak semester lepas.
                    Analisis menunjukkan kekuatan utama anda dalam aspek Penglibatan (89%) dan Pedagogi (88%).
                    Anda menunjukkan komitmen yang tinggi dalam pembangunan profesional."
                  </Typography>
                  <Stack direction="row" spacing={1} p={2} sx={{ bgcolor: theme.palette.info.light, borderRadius: theme.shape.borderRadius }} alignItems="flex-start">
                    <Box sx={{ width: 32, height: 32, bgcolor: theme.palette.info.main, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                      <TrendingUp size={16} style={{ color: theme.palette.common.white }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: theme.palette.grey[900], mb: 0.5, fontWeight: 'bold' }}>
                        Cadangan Penambahbaikan
                      </Typography>
                      <Typography variant="body2" sx={{ color: theme.palette.info.dark }}>
                        Fokuskan peningkatan dalam aspek Profesionalisme melalui penyertaan
                        dalam kursus pembangunan profesional dan aktiviti kolaborasi dengan rakan sejawat.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        )}

        {/* Info Card - Always shown when not completed */}
        {!evaluationCompleted && (
          <Card raised>
            <CardHeader title="Tentang Penilaian Kendiri" />
            <CardContent>
              <Stack spacing={3}>
                {[
                  { title: "Isi Borang Penilaian", content: "Jawab soalan penilaian kendiri berdasarkan prestasi anda dalam tiga kategori utama." },
                  { title: "Semak dan Hantar", content: "Semak semula jawapan anda sebelum menghantar penilaian kendiri." },
                  { title: "Terima Maklum Balas AI", content: "Sistem akan menganalisis prestasi anda dan memberikan maklum balas serta cadangan penambahbaikan." },
                ].map((item, index) => (
                  <Stack key={index} direction="row" alignItems="flex-start" spacing={2}>
                    <Box sx={{ width: 32, height: 32, bgcolor: theme.palette.info.light, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ color: theme.palette.info.main }}>{index + 1}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" sx={{ color: theme.palette.grey[900], mb: 0.5 }}>{item.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{item.content}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

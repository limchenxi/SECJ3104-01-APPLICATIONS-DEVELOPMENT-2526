//x guna
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import { ArrowLeft } from "lucide-react";
import { pentadbirService } from "../api/pentadbirService";

export default function CerapanReport() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadReport();
    }
  }, [id]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const result = await pentadbirService.getEvaluationSummary(id!);
      setData(result);
    } catch (err) {
      console.error("Error loading report:", err);
      setError("Gagal memuatkan laporan cerapan");
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
    return (
      <Box>
        <Button startIcon={<ArrowLeft />} onClick={() => navigate("/pentadbir/cerapan")}>
          Kembali
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!data) return null;

  const { report, summary } = data;

  return (
    <Box>
      <Button startIcon={<ArrowLeft />} onClick={() => navigate("/pentadbir/cerapan")} sx={{ mb: 2 }}>
        Kembali ke Senarai
      </Button>

      <Typography variant="h4" sx={{ mb: 3 }}>
        Laporan Cerapan
      </Typography>

      <Stack spacing={3}>
        {/* Basic Info */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Maklumat Asas</Typography>
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Tempoh:</Typography>
                <Typography fontWeight="bold">{report.period}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Subjek:</Typography>
                <Typography fontWeight="bold">{report.subject}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Kelas:</Typography>
                <Typography fontWeight="bold">{report.class}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="text.secondary">Status Keseluruhan:</Typography>
                <Chip label={report.status} color="primary" size="small" />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Weighted Scores Summary */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Skor Berwajaran (0-100)</Typography>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Cerapan Kendiri:</Typography>
                <Typography variant="h5" fontWeight="bold" color="info.main">
                  {summary?.overall?.weightedSelf?.toFixed(2) ?? 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Cerapan 1 (Obs 1):</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary.main">
                  {summary?.overall?.weightedObservation1?.toFixed(2) ?? 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography>Cerapan 2 (Obs 2):</Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {summary?.overall?.weightedObservation2?.toFixed(2) ?? 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                <Typography fontWeight="bold">Purata (Tri-Average):</Typography>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {summary?.overall?.triAverageWeighted?.toFixed(2) ?? 0}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="center" sx={{ pt: 1 }}>
                <Chip 
                  label={summary?.overall?.label || 'Tidak Dinilai'} 
                  color={
                    summary?.overall?.label === 'Cemerlang' ? 'success' :
                    summary?.overall?.label === 'Baik' ? 'primary' :
                    summary?.overall?.label === 'Sederhana' ? 'warning' : 'default'
                  }
                  sx={{ fontSize: '1.1rem', px: 2, py: 2.5 }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Per-Category Breakdown */}
        {summary?.categories?.breakdown && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Pecahan Mengikut Subkategori</Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ textAlign: 'left', padding: 8 }}>Kod</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Wajaran</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Kendiri</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs1</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs2</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.categories.breakdown.map((row: any) => (
                      <tr key={row.code} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: 8 }}>{row.code}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weight?.toFixed(0) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weightedSelf?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weighted1?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weighted2?.toFixed(2) ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #ddd', fontWeight: 600 }}>
                      <td style={{ padding: 8 }}>JUMLAH</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>100</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{summary.categories.totals.weightedSelfTotal?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{summary.categories.totals.weightedObservation1Total?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right' }}>{summary.categories.totals.weightedObservation2Total?.toFixed(2) ?? 0}</td>
                    </tr>
                  </tfoot>
                </table>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

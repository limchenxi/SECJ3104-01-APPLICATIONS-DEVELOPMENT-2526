import { useState, useEffect, useRef } from "react";
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
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  CheckCircle,
  Calendar,
  BookOpen,
  Users,
  Award,
  TrendingUp,
  Clock,
} from "lucide-react";
// Charts removed - no longer used
import { getReportSummary, getAdminReportSummary } from "../api/cerapanService";
import type { CerapanRecord, ReportSummary } from "../type";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import useAuth from "../../../hooks/useAuth";

export default function CerapanResults() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [report, setReport] = useState<CerapanRecord | null>(null);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Determine if this is admin view
  const isAdminView = user?.role === "PENTADBIR" || location.pathname.includes("/pentadbir/");

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    if (!id) return;

    try {
      setLoading(true);
      // Use admin endpoint if admin, otherwise teacher endpoint
      const data = isAdminView 
        ? await getAdminReportSummary(id)
        : await getReportSummary(id);
      setReport(data.report);
      setSummary(data.summary);
    } catch (err) {
      console.error("Error loading report:", err);
      setError("Gagal memuatkan laporan. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const obs1Total10 = summary?.categories.totals.observation1Score10Sum ?? 0;
  const obs2Total10 = summary?.categories.totals.observation2Score10Sum ?? 0;
  const hasObs1 = (summary?.observation1.count ?? 0) > 0;
  const hasObs2 = (summary?.observation2.count ?? 0) > 0;

  const handleExportPdf = async () => {
    try {
      const input = exportRef.current;
      if (!input) return;

      // Use a white background to avoid transparency issues
      const canvas = await html2canvas(input, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgProps = {
        width: pageWidth,
        height: (canvas.height * pageWidth) / canvas.width,
      };

      let heightLeft = imgProps.height;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgProps.width, imgProps.height, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgProps.height;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgProps.width, imgProps.height, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const fileName = `Laporan_Cerapan_${report?.subject || ''}_${report?.class || ''}.pdf`;
      pdf.save(fileName.replace(/\s+/g, '_'));
    } catch (e) {
      console.error("PDF export failed", e);
      setError("Gagal menjana PDF. Sila cuba lagi.");
    }
  };

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
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }} ref={exportRef}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
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
              <Grid size={{ xs: 12, sm: 4 }}>
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

        {/* Observation Status Card */}
        <Card raised>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Status Cerapan
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ bgcolor: theme.palette.success.light + '20', borderColor: theme.palette.success.main }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      <CheckCircle size={20} style={{ color: theme.palette.success.main }} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        Kendiri (Self)
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {summary?.selfEvaluation.status === 'submitted' ? (
                        <>
                          <Chip label="Selesai" size="small" color="success" sx={{ mr: 1 }} />
                          {summary?.selfEvaluation.completionPercent.toFixed(0)}% lengkap
                        </>
                      ) : (
                        <Chip label="Belum Selesai" size="small" color="default" />
                      )}
                    </Typography>
                    {summary?.selfEvaluation.submittedAt && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Dihantar: {new Date(summary.selfEvaluation.submittedAt).toLocaleDateString('ms-MY')}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ 
                  bgcolor: hasObs1 ? theme.palette.success.light + '20' : theme.palette.grey[100], 
                  borderColor: hasObs1 ? theme.palette.success.main : theme.palette.grey[300] 
                }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      {hasObs1 ? (
                        <CheckCircle size={20} style={{ color: theme.palette.success.main }} />
                      ) : (
                        <Clock size={20} style={{ color: theme.palette.grey[500] }} />
                      )}
                      <Typography variant="subtitle2" fontWeight={600}>
                        Cerapan 1
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {hasObs1 ? (
                        <>
                          <Chip label="Selesai" size="small" color="success" sx={{ mr: 1 }} />
                          {summary?.observation1.percent.toFixed(0)}%
                        </>
                      ) : (
                        <Chip label="Belum Selesai" size="small" color="default" />
                      )}
                    </Typography>
                    {summary?.observation1.submittedAt && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Dihantar: {new Date(summary.observation1.submittedAt).toLocaleDateString('ms-MY')}
                      </Typography>
                    )}
                    {hasObs1 && summary?.observation1?.count && summary.observation1.count > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Pentadbir: {report?.observation_1.administratorId || '-'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card variant="outlined" sx={{ 
                  bgcolor: hasObs2 ? theme.palette.success.light + '20' : theme.palette.grey[100], 
                  borderColor: hasObs2 ? theme.palette.success.main : theme.palette.grey[300] 
                }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                      {hasObs2 ? (
                        <CheckCircle size={20} style={{ color: theme.palette.success.main }} />
                      ) : (
                        <Clock size={20} style={{ color: theme.palette.grey[500] }} />
                      )}
                      <Typography variant="subtitle2" fontWeight={600}>
                        Cerapan 2
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {hasObs2 ? (
                        <>
                          <Chip label="Selesai" size="small" color="success" sx={{ mr: 1 }} />
                          {summary?.observation2.percent.toFixed(0)}%
                        </>
                      ) : (
                        <Chip label="Belum Selesai" size="small" color="default" />
                      )}
                    </Typography>
                    {summary?.observation2.submittedAt && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Dihantar: {new Date(summary.observation2.submittedAt).toLocaleDateString('ms-MY')}
                      </Typography>
                    )}
                    {hasObs2 && summary?.observation2?.count && summary.observation2.count > 0 && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Pentadbir: {report?.observation_2.administratorId || '-'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
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
                  {hasObs1 || hasObs2 ? `${summary?.overall.percent ?? 0}%` : `${summary?.selfEvaluation.completionPercent ?? 0}%`}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {hasObs1 || hasObs2 ? 'Skor Keseluruhan (Cerapan)' : 'Kadar Lengkap Kendiri'}
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
                {!(hasObs1 || hasObs2) ? (
                  <>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Penilaian kendiri anda telah berjaya direkodkan. Pentadbir akan membuat cerapan untuk melengkapkan proses penilaian.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: <strong>Menunggu Cerapan Pentadbir</strong>
                    </Typography>
                  </>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Ringkasan: Purata peratus cerapan = <strong>{summary?.overall.percent ?? 0}%</strong>, Label = <strong>{summary?.overall.label ?? '-'}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jumlah skor normalisasi (0..10): {hasObs1 && <><strong>Obs1</strong>: {obs1Total10}</>} {hasObs2 && <> | <strong>Obs2</strong>: {obs2Total10}</>}
                    </Typography>
                  </>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Per-subcategory breakdown table */}
        {(summary?.categories.breakdown?.length ?? 0) > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Skor Mengikut Subkategori (4.x.x)
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: 8 }}>Kod</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Weight</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Full Mark</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Kendiri Achieved</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Kendiri %</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Kendiri Weighted</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs1 Achieved</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs1 %</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs1 Weighted</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs2 Achieved</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs2 %</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs2 Weighted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary!.categories.breakdown.map((row) => (
                      <tr key={row.code}>
                        <td style={{ padding: 8 }}>{row.code}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weight?.toFixed(0) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.fullMark?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.achievedSelf?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.percentSelf?.toFixed(2) ?? 0}%</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weightedSelf?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.achieved1?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.percent1?.toFixed(2) ?? 0}%</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weighted1?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.achieved2?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.percent2?.toFixed(2) ?? 0}%</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weighted2?.toFixed(2) ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: 8, fontWeight: 600 }}>Jumlah</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>100</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.fullMarkSum?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.selfRawAchieved?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.selfPercent?.toFixed(2) ?? 0}%</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.weightedSelfTotal?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.observation1RawAchieved?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.observation1Percent?.toFixed(2) ?? 0}%</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.weightedObservation1Total?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.observation2RawAchieved?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.observation2Percent?.toFixed(2) ?? 0}%</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.weightedObservation2Total?.toFixed(2) ?? 0}</td>
                    </tr>
                  </tfoot>
                </table>
              </Box>
            </CardContent>
          </Card>
        )}


        {/* Action Buttons */}
        <Stack direction="row" justifyContent="center" spacing={2}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(isAdminView ? "/pentadbir/cerapan" : "/cerapan")}
          >
            Kembali ke Dashboard
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate(isAdminView ? "/cerapan/admin" : "/cerapan/my-reports")}
          >
            {isAdminView ? "Lihat Tugasan Pentadbir" : "Lihat Semua Laporan"}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleExportPdf}
          >
            Muat Turun PDF
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

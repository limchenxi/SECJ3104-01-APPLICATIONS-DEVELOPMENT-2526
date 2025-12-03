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
import useAuth from "../../../hooks/useAuth";
import { userApi } from "../../Users/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SCHOOL_NAME = 'SK SRI SIAKAP'; 
const SCHOOL_CODE = 'ABA 3012';
const PDFExportContent = ({ report, summary, teacherName }: { report: CerapanRecord, summary: ReportSummary, teacherName: string | undefined }) => {
    if (!report || !summary) return null;

    const breakdown = summary.categories.breakdown.sort((a, b) => a.code.localeCompare(b.code));
    const subCategoryCodes = breakdown.map(c => c.code);
    const dateToday = new Date().toLocaleDateString('ms-MY');

    const scoreRowData = [
        { label: 'Cerapan Kendiri / Self', key: 'weightedSelf' as keyof ReportSummary['categories']['breakdown'][0], total: summary.categories.totals.weightedSelfTotal },
        { label: 'Cerapan 1 / Obs 1', key: 'weighted1' as keyof ReportSummary['categories']['breakdown'][0], total: summary.categories.totals.weightedObservation1Total },
        { label: 'Cerapan 2 / Obs 2', key: 'weighted2' as keyof ReportSummary['categories']['breakdown'][0], total: summary.categories.totals.weightedObservation2Total },
    ];

    // 🚨 注意: 样式使用内联 CSS，因为 html2canvas 不总能完美抓取外部 MUI/CSS 样式
    return (
        <div style={{ 
            padding: '20px', 
            backgroundColor: '#fff', 
            fontSize: '10pt', 
            fontFamily: 'Arial, sans-serif', 
            width: '1100px' // 确保宽度足够大，用于横向 A4 导出
        }}>
            {/* Header / Info */}
            <h1 style={{ fontSize: '18pt', textAlign: 'center', marginBottom: '15px' }}>TAPAK STANDARD 4</h1>
            <h1 style={{ fontSize: '18pt', textAlign: 'center', marginBottom: '15px' }}>PEMBELAJARAN DAN PEMUDAHCARAAN (PdPc)</h1>
            <br />
            <table style={{ width: '100%', marginBottom: '15px', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr>
                        <td style={{ width: '33%' }}><strong>Nama Guru:</strong> {teacherName || report.teacherId}</td>
                        <td style={{ width: '33%' }}><strong>Sekolah:</strong> {SCHOOL_NAME} ({SCHOOL_CODE})</td>
                        <td style={{ width: '33%' }}><strong>Sesi Pengisian:</strong> {report.period}</td>
                    </tr>
                    <tr>
                        <td><strong>Mata Pelajaran:</strong> {report.subject}</td>
                        <td><strong>Kelas:</strong> {report.class}</td>
                        <td><strong>Tarikh Laporan:</strong> {dateToday}</td>
                    </tr>
                </tbody>
            </table>

            {/* Score Table (Excel Format) */}
            <h2 style={{ fontSize: '14pt', marginTop: '20px', marginBottom: '10px' }}>Skor Berwajaran Mengikut Subkategori (0-100)</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'left', minWidth: '150px' }}>Penilaian/Evaluation</th>
                        {subCategoryCodes.map(code => (
                            <th key={code} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{code}</th>
                        ))}
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', minWidth: '120px' }}>Jumlah Skor</th>
                        <th style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>Taraf</th>
                    </tr>
                </thead>
                <tbody>
                    {scoreRowData.map(row => (
                        <tr key={row.label}>
                            <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold' }}>{row.label}</td>
                            {subCategoryCodes.map(code => {
                                const category = breakdown.find(c => c.code === code);
                                const score = category ? category[row.key] : 0;
                                return (
                                    <td key={code} style={{ border: '1px solid #000', padding: '8px', textAlign: 'right' }}>
                                        {score && score > 0 ? score.toFixed(2) : '-'}
                                    </td>
                                );
                            })}
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{row.total.toFixed(2)}</td>
                            <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center' }}>{row.label.includes('Cerapan 2') ? summary.overall.label : ''}</td>
                        </tr>
                    ))}
                    {/* Footer Row for Wajaran */}
                    <tr>
                        <td style={{ border: '1px solid #000', padding: '8px', fontWeight: 'bold', backgroundColor: '#e0ee0e' }}>Wajaran / Weight (Total 100)</td>
                        {subCategoryCodes.map(code => {
                            const category = breakdown.find(c => c.code === code);
                            return (
                                <td key={code} style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>
                                    {category ? category.weight.toFixed(0) : '-'}
                                </td>
                            );
                        })}
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'right', fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>
                            {summary.overall.triAverageWeighted.toFixed(2)}
                        </td>
                        <td style={{ border: '1px solid #000', padding: '8px', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#e0e0e0' }}>
                            Purata
                        </td>
                    </tr>
                </tbody>
            </table>

            {/* AI Comment Section */}
            {/* {report.aiComment && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f9f9f9', border: '1px dashed #ccc' }}>
                    <h2 style={{ fontSize: '14pt', marginBottom: '5px', fontWeight: 'bold', color: '#006699' }}>Komen AI (Dwibahasa) / AI Comment (Bilingual)</h2>
                    <p style={{ whiteSpace: 'pre-line', fontStyle: 'italic', lineHeight: '1.5' }}>
                        {report.aiComment}
                    </p>
                </div>
            )} */}
        </div>
    );
};

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
  const [fullTeacherName, setFullTeacherName] = useState<string | undefined>(undefined);

  // Determine if this is admin view
  const isAdminView = user?.role === "PENTADBIR" || location.pathname.includes("/pentadbir/");

  useEffect(() => {
    loadReport();
  }, [id]);

  useEffect(() => {
    const fetchTeacherName = async () => {
      if (report?.teacherId) {
        try {
            const user = await userApi.getById(report.teacherId);
              setFullTeacherName(user?.name);
            } catch {
                setFullTeacherName(report.teacherId); // 失败时使用 ID
            }
        }
    };
    fetchTeacherName();
  }, [report?.teacherId]);

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
    if (!report || !summary) {
        setError("Laporan tidak lengkap untuk eksport.");
        return;
    }
    
    try {
        // 🚨 目标元素是隐藏的 PDF 容器
        // 由于我们将其命名为 'pdf-export-content'，我们使用 document.getElementById
        const input = document.getElementById('pdf-export-content');
        if (!input) {
            setError("PDF content container not found.");
            return;
        }

        // 1. 使用 html2canvas 将 HTML 元素渲染为 Canvas
        const canvas = await html2canvas(input, {
            scale: 2, // 提高分辨率
            backgroundColor: "#ffffff",
            useCORS: true,
            // 确保我们抓取的是隐藏元素的实际内容尺寸
        });
        
        const imgData = canvas.toDataURL("image/png");

        // 2. 初始化 jsPDF
        // 使用 Landscape (横向) A4 格式
        const pdf = new jsPDF({ orientation: "l", unit: "mm", format: "a4" }); 
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgProps = {
            width: pageWidth,
            height: (canvas.height * pageWidth) / canvas.width,
        };

        let heightLeft = imgProps.height;
        let position = 0;

        // 3. 将 Canvas 图像添加到 PDF 中并处理分页
        pdf.addImage(imgData, "PNG", 0, position, imgProps.width, imgProps.height, undefined, "FAST");
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgProps.height;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, imgProps.width, imgProps.height, undefined, "FAST");
            heightLeft -= pageHeight;
        }

        // 4. 保存文件
        const fileName = `Laporan_Cerapan_${report.subject}_${report.class}.pdf`;
        pdf.save(fileName.replace(/\s+/g, '_'));

    } catch (e: any) {
        console.error("PDF export failed:", e);
        setError(`Gagal menjana PDF: ${e.message || '未知错误'}`);
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
                    <Typography variant="body2" color="text.secondary" component="span">
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

        {/* AI COMMENT CARD: NEW SECTION */}
        {report.aiComment && (report.self_evaluation.status === 'submitted' && report.observation_2.status === 'submitted') && (
          <Card
            raised
            sx={{
                border: `2px solid ${theme.palette.primary.main}`,
                bgcolor: theme.palette.primary.light + '20',
            }}
          >
            <CardContent>
                <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Award size={24} style={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" sx={{ color: theme.palette.primary.main, fontWeight: 700 }}>
                            AI Comment / Komen AI (Dwibahasa)
                        </Typography>
                    </Stack>
                    <Typography 
                        variant="body1" 
                        sx={{ whiteSpace: 'pre-line', fontStyle: 'italic', lineHeight: 1.8 }}
                    >
                        {/* 显示 AI 生成的双语评论 */}
                        {report.aiComment}
                    </Typography>
                </Stack>
            </CardContent>
          </Card>
        )}

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
                      <th style={{ textAlign: 'right', padding: 8 }}>Kendiri Weighted</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs1 Achieved</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs1 Weighted</th>
                      <th style={{ textAlign: 'right', padding: 8 }}>Obs2 Achieved</th>
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
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weightedSelf?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.achieved1?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.weighted1?.toFixed(2) ?? 0}</td>
                        <td style={{ padding: 8, textAlign: 'right' }}>{row.achieved2?.toFixed(2) ?? 0}</td>
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
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.weightedSelfTotal?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.observation1RawAchieved?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.weightedObservation1Total?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.observation2RawAchieved?.toFixed(2) ?? 0}</td>
                      <td style={{ padding: 8, textAlign: 'right', fontWeight: 600 }}>{summary!.categories.totals.weightedObservation2Total?.toFixed(2) ?? 0}</td>
                    </tr>
                  </tfoot>
                </table>
              </Box>
            </CardContent>
          </Card>
        )}
        <Box id="pdf-export-content" sx={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
            <PDFExportContent report={report} summary={summary} teacherName={fullTeacherName} />
        </Box>


        {/* Action Buttons */}
        <Stack direction="row" justifyContent="center" spacing={2}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate(isAdminView ? "/pentadbir/cerapan" : "/cerapan")}
          >
            Kembali ke Dashboard
          </Button>
          {/* <Button
            variant="contained"
            size="large"
            onClick={() => navigate(isAdminView ? "/cerapan/admin" : "/cerapan/my-reports")}
          >
            {isAdminView ? "Lihat Tugasan Pentadbir" : "Lihat Semua Laporan"}
          </Button> */}
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

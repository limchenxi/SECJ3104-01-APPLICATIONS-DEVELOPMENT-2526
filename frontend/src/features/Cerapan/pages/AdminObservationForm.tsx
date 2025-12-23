import { useState, useEffect, useMemo, useRef } from "react";
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
  Paper,
  Grid,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Divider,
} from "@mui/material";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Users, Calendar, CheckCircle } from "lucide-react";
import { getAdminEvaluationDetails, submitObservation1, submitObservation2 } from "../api/cerapanService";
import { userApi } from "../../Users/api";
import type { CerapanRecord, SubmitObservationDto, QuestionSnapshot, ScoreDescription } from "../type";
import useAuth from "../../../hooks/useAuth";

interface MarkForm {
  [questionId: string]: {
    mark: number;
  };
}

export default function AdminObservationForm() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const observationType = parseInt(searchParams.get("type") || "1") as 1 | 2;

  const [task, setTask] = useState<CerapanRecord | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [marks, setMarks] = useState<MarkForm>({} as MarkForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Derived totals
  const totalMarks = Object.values(marks).reduce((sum, m) => sum + (m.mark || 0), 0);
  const maxMarks = (task?.questions_snapshot || []).reduce((sum, q) => sum + (q.maxScore || 0), 0);
  const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

  // Kendiri-like score descriptions
  const getScoreDescriptions = (question: QuestionSnapshot): ScoreDescription[] => {
    if (question.scoreDescriptions && question.scoreDescriptions.length > 0) return question.scoreDescriptions;
    return [
      { score: 4, label: "Cemerlang", description: "Sangat baik" },
      { score: 3, label: "Baik", description: "Baik" },
      { score: 2, label: "Sederhana", description: "Sederhana" },
      { score: 1, label: "Lemah", description: "Lemah" },
      { score: 0, label: "Tidak Memuaskan", description: "Tidak memuaskan" },
    ];
  };

  // Group by Aspek like kendiri
  const groupedAspek = useMemo(() => {
    if (!task) return [] as Array<[string, { title: string; subtitle: string; questions: QuestionSnapshot[] }]>;
    const aspekGroups: { [key: string]: { title: string; subtitle: string; questions: QuestionSnapshot[] } } = {};
    task.questions_snapshot.forEach((question) => {
      const parts = question.questionId.split(".");
      const aspekKey = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : parts[0];
      if (!aspekGroups[aspekKey]) {
        let title = "";
        let subtitle = "";
        switch (aspekKey) {
          case "4.1":
            title = "ASPEK 4.1: GURU SEBAGAI PERANCANG";
            subtitle = "Perancangan pengajaran dan pembelajaran";
            break;
          case "4.2":
            title = "ASPEK 4.2: GURU SEBAGAI PENYAMPAI";
            subtitle = "Penyampaian pengajaran dan pembelajaran";
            break;
          case "4.3":
            title = "ASPEK 4.3: GURU SEBAGAI PEMBIMBING";
            subtitle = "Bimbingan kepada murid";
            break;
          case "4.4":
            title = "ASPEK 4.4: GURU SEBAGAI PENTAKSIR";
            subtitle = "Pentaksiran murid";
            break;
          case "4.5":
            title = "ASPEK 4.5: GURU SEBAGAI PENTADBIR";
            subtitle = "Pentadbiran bilik darjah";
            break;
          case "4.6":
            title = "ASPEK 4.6: GURU SEBAGAI PROFESIONAL";
            subtitle = "Profesionalisme dan etika";
            break;
          default:
            title = `ASPEK ${aspekKey}`;
            subtitle = "";
        }
        aspekGroups[aspekKey] = { title, subtitle, questions: [] };
      }
      aspekGroups[aspekKey].questions.push(question);
    });
    return Object.entries(aspekGroups).sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]));
  }, [task]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getAdminEvaluationDetails(id);
        setTask(data);

        // Pre-fill marks if they exist
        const targetObs = observationType === 1 ? data.observation_1 : data.observation_2;
        if (targetObs && targetObs.marks && targetObs.marks.length > 0) {
          const prefilled: MarkForm = {};
          targetObs.marks.forEach(m => {
            prefilled[m.questionId] = { mark: m.mark };
          });
          setMarks(prefilled);
        } else {
          setMarks({} as MarkForm);
        }
      } catch (err) {
        console.error("Error loading task:", err);
        setError("Gagal memuatkan data. Sila cuba lagi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Fetch teacher name for header display
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        if (task?.teacherId) {
          const user = await userApi.getById(task.teacherId);
          setTeacherName(user?.name || null);
        } else {
          setTeacherName(null);
        }
      } catch {
        setTeacherName(null);
      }
    };
    fetchTeacher();
  }, [task?.teacherId]);

  const handleMarkChange = (questionId: string, mark: number) => {
    setMarks((prev) => ({ ...prev, [questionId]: { ...prev[questionId], mark } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !id || !user?.id) return;

    try {
      setSubmitting(true);
      setError("");

      // Validate that all questions have an explicit score selected
      const missing = (task.questions_snapshot || []).filter(
        (q) => marks[q.questionId] === undefined || marks[q.questionId].mark === undefined
      );
      if (missing.length > 0) {
        setSubmitting(false);
        setError(`Sila pilih skor untuk semua soalan. Baki belum dipilih: ${missing.length}`);
        const firstMissing = missing[0]?.questionId;
        if (firstMissing && questionRefs.current[firstMissing]) {
          questionRefs.current[firstMissing]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setHighlightId(firstMissing);
          setTimeout(() => setHighlightId(null), 1500);
        }
        return;
      }
      const payload: SubmitObservationDto = {
        marks: Object.entries(marks).map(([questionId, data]) => ({ questionId, mark: data.mark })),
      };

      if (observationType === 1) {
        await submitObservation1(id, payload);
      } else {
        await submitObservation2(id, payload);
      }

      // Successfully submitted, navigate to report
      navigate(`/cerapan/results/${id}`);
    } catch (err: any) {
      console.error("Error submitting observation:", err);
      console.error("Error details:", err.response?.data);
      const errorMsg = err.response?.data?.message || err.message || "Gagal menghantar. Sila cuba lagi.";
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Tugasan tidak dijumpai.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "lg", mx: "auto" }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Header */}
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={0.5}>
              <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900] }}>
                Borang Cerapan {observationType}
              </Typography>
            </Stack>
            <Typography color="text.secondary">Sila berikan markah dan komen untuk setiap aspek penilaian</Typography>
          </Box>

          {/* Task Info Card */}
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Users size={20} style={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Guru</Typography>
                      <Typography variant="body1" fontWeight={600}>{teacherName || task.teacherId}</Typography>
                      {teacherName && (
                        <Typography variant="caption" color="text.secondary">ID: {task.teacherId}</Typography>
                      )}
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BookOpen size={20} style={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Subjek & Kelas</Typography>
                      <Typography variant="body1" fontWeight={600}>{task.subject} - {task.class}</Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Calendar size={20} style={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">Tempoh</Typography>
                      <Typography variant="body1" fontWeight={600}>{task.period}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" onClose={() => setError("")}>{error}</Alert>
          )}

          {/* Score Summary */}
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Jumlah Markah Semasa</Typography>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>{totalMarks}</Typography>
                  <Typography variant="body1" color="text.secondary">/ {maxMarks} ({percentage}%)</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Match kendiri layout */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
              Penilaian Pentadbir
            </Typography>

            <Stack spacing={4}>
              {groupedAspek.map(([aspekKey, aspekData], aspekIndex) => (
                <Box key={aspekKey}>
                  <Paper elevation={2} sx={{ p: 2, mb: 2, bgcolor: theme.palette.primary.main, color: theme.palette.common.white }}>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{aspekData.title}</Typography>
                    {aspekData.subtitle && (
                      <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>{aspekData.subtitle}</Typography>
                    )}
                  </Paper>

                  <Stack spacing={3}>
                    {aspekData.questions.map((q) => {
                      const selected = marks[q.questionId]?.mark ?? null;
                      const valueStr = selected !== null ? String(selected) : "";
                      return (
                        <Card
                          key={q.questionId}
                          variant="outlined"
                          ref={(el: HTMLDivElement | null) => { questionRefs.current[q.questionId] = el; }}
                          sx={highlightId === q.questionId ? { borderColor: theme.palette.error.main, boxShadow: `${theme.palette.error.main}40 0 0 0 2px` } : undefined}
                        >
                          <CardContent>
                            <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>{q.questionId}</Typography>
                            <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>{q.text}</Typography>

                            <FormControl component="fieldset" fullWidth required sx={{ mb: 2 }}>
                              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>Pilih Skor:</FormLabel>
                              <RadioGroup value={valueStr} onChange={(e) => handleMarkChange(q.questionId, parseInt(e.target.value, 10))}>
                                {getScoreDescriptions(q)
                                  .sort((a, b) => b.score - a.score)
                                  .map((opt) => (
                                    <FormControlLabel
                                      key={opt.score}
                                      value={String(opt.score)}
                                      control={<Radio />}
                                      label={
                                        <Box sx={{ py: 0.5 }}>
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            Skor {opt.score}: {opt.label}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "pre-line" }}>
                                            {opt.description}
                                          </Typography>
                                        </Box>
                                      }
                                      sx={{
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        mb: 1,
                                        px: 2,
                                        py: 1,
                                        '&:hover': { bgcolor: theme.palette.action.hover },
                                        ...(valueStr === String(opt.score) && {
                                          bgcolor: theme.palette.primary.light + '20',
                                          borderColor: theme.palette.primary.main,
                                        }),
                                      }}
                                    />
                                  ))}
                              </RadioGroup>
                            </FormControl>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>

                  {aspekIndex < groupedAspek.length - 1 && <Divider sx={{ my: 4 }} />}
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Submit Button */}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button variant="outlined" onClick={() => navigate("/pentadbir/cerapan")} disabled={submitting}>Batal</Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle size={20} />}
              sx={{
                bgcolor: observationType === 1 ? theme.palette.info.main : theme.palette.success.main,
                "&:hover": {
                  bgcolor: observationType === 1 ? theme.palette.info.dark : theme.palette.success.dark,
                },
                px: 4,
              }}
            >
              {submitting ? "Menghantar..." : `Hantar Cerapan ${observationType}`}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

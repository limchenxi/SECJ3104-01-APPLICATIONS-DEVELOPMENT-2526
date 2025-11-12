import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme,
  TextField,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  Chip,
  Grid,
  Slider,
} from "@mui/material";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, Users, Calendar, Send, CheckCircle } from "lucide-react";
import { getReportDetails, submitObservation1, submitObservation2 } from "../api/cerapanService";
import type { CerapanRecord, SubmitObservationDto } from "../type";
import useAuth from "../../../hooks/useAuth";

interface MarkForm {
  [questionId: string]: {
    mark: number;
    comment: string;
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
  const [marks, setMarks] = useState<MarkForm>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTaskDetails();
  }, [id]);

  const loadTaskDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const data = await getReportDetails(id);
      setTask(data);

      // Initialize marks object
      const initialMarks: MarkForm = {};
      data.questions_snapshot.forEach((q) => {
        initialMarks[q.questionId] = {
          mark: 0,
          comment: "",
        };
      });
      setMarks(initialMarks);
    } catch (err) {
      console.error("Error loading task:", err);
      setError("Gagal memuatkan data. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkChange = (questionId: string, mark: number) => {
    setMarks((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        mark,
      },
    }));
  };

  const handleCommentChange = (questionId: string, comment: string) => {
    setMarks((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        comment,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !id || !user?.id) return;

    // Validate all questions have comments
    const unanswered = task.questions_snapshot.filter(
      (q) => !marks[q.questionId]?.comment || marks[q.questionId].comment.trim() === ""
    );

    if (unanswered.length > 0) {
      setError("Sila berikan komen untuk semua soalan.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload: SubmitObservationDto = {
        marks: Object.entries(marks).map(([questionId, data]) => ({
          questionId,
          mark: data.mark,
          comment: data.comment,
        })),
      };

      if (observationType === 1) {
        await submitObservation1(id, payload);
      } else {
        await submitObservation2(id, payload);
      }

      // Navigate back to admin dashboard
      navigate("/cerapan/admin");
    } catch (err: any) {
      console.error("Error submitting observation:", err);
      setError(err.response?.data?.message || "Gagal menghantar. Sila cuba lagi.");
      setSubmitting(false);
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

  if (!task) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Tugasan tidak dijumpai.</Alert>
      </Box>
    );
  }

  const totalMarks = Object.values(marks).reduce((sum, m) => sum + m.mark, 0);
  const maxMarks = task.questions_snapshot.length * 5;
  const percentage = maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0;

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
              <Chip
                label={observationType === 1 ? "Cerapan 1" : "Cerapan 2"}
                sx={{
                  bgcolor: observationType === 1 ? theme.palette.info.main : theme.palette.success.main,
                  color: theme.palette.common.white,
                  fontWeight: "bold",
                }}
              />
            </Stack>
            <Typography color="text.secondary">
              Sila berikan markah dan komen untuk setiap aspek penilaian
            </Typography>
          </Box>

          {/* Task Info Card */}
          <Card raised>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Users size={20} style={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Guru ID
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {task.teacherId}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <BookOpen size={20} style={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Subjek & Kelas
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {task.subject} - {task.class}
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
                        {task.period}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Score Summary */}
          <Card
            sx={{
              bgcolor: theme.palette.primary.light + "20",
              border: `1px solid ${theme.palette.primary.light}`,
            }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">Jumlah Markah Semasa</Typography>
                <Stack direction="row" alignItems="baseline" spacing={1}>
                  <Typography variant="h4" sx={{ color: theme.palette.primary.main }}>
                    {totalMarks}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    / {maxMarks} ({percentage}%)
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Teacher's Self Evaluation (for reference) */}
          {task.self_evaluation.status === "submitted" && (
            <Paper elevation={0} sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
              <Typography variant="h6" sx={{ mb: 2, color: theme.palette.info.dark }}>
                Jawapan Cerapan Kendiri Guru (Rujukan)
              </Typography>
              <Stack spacing={2}>
                {task.self_evaluation.answers?.map((answer, index) => {
                  const question = task.questions_snapshot.find(
                    (q) => q.questionId === answer.questionId
                  );
                  return (
                    <Card key={answer.questionId} variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                          Soalan {index + 1}: {question?.text}
                        </Typography>
                        <Paper sx={{ p: 2, bgcolor: theme.palette.grey[100] }}>
                          <Typography variant="body2">{answer.answer}</Typography>
                        </Paper>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Paper>
          )}

          {/* Marking Form */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
              Penilaian Pentadbir
            </Typography>

            <Stack spacing={3}>
              {task.questions_snapshot.map((question, index) => (
                <Box key={question.questionId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                        Aspek {index + 1}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                        {question.text}
                      </Typography>

                      {/* Mark Slider */}
                      <Box sx={{ mb: 3 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body2" color="text.secondary">
                            Markah (0-5)
                          </Typography>
                          <Chip
                            label={`${marks[question.questionId]?.mark || 0} / 5`}
                            size="small"
                            sx={{
                              bgcolor: theme.palette.primary.main,
                              color: theme.palette.common.white,
                              fontWeight: "bold",
                            }}
                          />
                        </Stack>
                        <Slider
                          value={marks[question.questionId]?.mark || 0}
                          onChange={(_e, value) => handleMarkChange(question.questionId, value as number)}
                          min={0}
                          max={5}
                          step={1}
                          marks
                          valueLabelDisplay="auto"
                        />
                      </Box>

                      {/* Comment Field */}
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Komen & Cadangan Penambahbaikan"
                        placeholder="Berikan komen terperinci mengenai aspek ini..."
                        value={marks[question.questionId]?.comment || ""}
                        onChange={(e) => handleCommentChange(question.questionId, e.target.value)}
                        required
                        variant="outlined"
                      />
                    </CardContent>
                  </Card>
                  {index < task.questions_snapshot.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Submit Button */}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate("/cerapan/admin")}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <CheckCircle size={20} />}
              sx={{
                bgcolor:
                  observationType === 1 ? theme.palette.info.main : theme.palette.success.main,
                "&:hover": {
                  bgcolor:
                    observationType === 1 ? theme.palette.info.dark : theme.palette.success.dark,
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

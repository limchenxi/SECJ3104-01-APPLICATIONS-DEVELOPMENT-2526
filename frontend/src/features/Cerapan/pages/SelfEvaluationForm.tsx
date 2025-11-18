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
  Paper,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { BookOpen, Users, Calendar, Send } from "lucide-react";
import { getTaskDetails, submitSelfEvaluation } from "../api/cerapanService";
import type { CerapanRecord, QuestionSnapshot, ScoreDescription } from "../type";

export default function SelfEvaluationForm() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<CerapanRecord | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    loadTaskDetails();
  }, [id]);

  const loadTaskDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getTaskDetails(id);
      setTask(data);
      
      // Initialize answers object with empty strings (will store score as string)
      const initialAnswers: { [key: string]: string } = {};
      data.questions_snapshot.forEach((q) => {
        initialAnswers[q.questionId] = "";
      });
      setAnswers(initialAnswers);
    } catch (err) {
      console.error("Error loading task:", err);
      setError("Gagal memuatkan data. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Get score descriptions from question snapshot (from backend template)
  const getScoreDescriptions = (question: QuestionSnapshot): ScoreDescription[] => {
    // If question has score descriptions from template, use them
    if (question.scoreDescriptions && question.scoreDescriptions.length > 0) {
      return question.scoreDescriptions;
    }
    
    // Fallback: Generate basic 0-4 scale
    return [
      { score: 4, label: "Cemerlang", description: "Sangat baik" },
      { score: 3, label: "Baik", description: "Baik" },
      { score: 2, label: "Sederhana", description: "Sederhana" },
      { score: 1, label: "Lemah", description: "Lemah" },
      { score: 0, label: "Tidak Memuaskan", description: "Tidak memuaskan" },
    ];
  };

  // Group questions by Aspek with titles
  const groupQuestionsByAspek = () => {
    if (!task) return [];

    const aspekGroups: {
      [key: string]: {
        title: string;
        subtitle: string;
        questions: QuestionSnapshot[];
      };
    } = {};

    task.questions_snapshot.forEach((question) => {
      // Extract aspek from questionId (e.g., "4.1.1a" -> "4.1")
      const parts = question.questionId.split(".");
      const aspekKey = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : parts[0];

      if (!aspekGroups[aspekKey]) {
        // Set title and subtitle based on aspekKey
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

        aspekGroups[aspekKey] = {
          title,
          subtitle,
          questions: [],
        };
      }

      aspekGroups[aspekKey].questions.push(question);
    });

    // Convert to sorted array
    return Object.entries(aspekGroups).sort((a, b) => {
      const aNum = parseFloat(a[0]);
      const bNum = parseFloat(b[0]);
      return aNum - bNum;
    });
  };

  const handleSubmit = async () => {
    if (!task) return;

    // Validate all questions are answered
    const unanswered = task.questions_snapshot.filter(
      (q) => !answers[q.questionId] || answers[q.questionId] === ""
    );

    if (unanswered.length > 0) {
      setError(`Sila jawab semua soalan. ${unanswered.length} soalan belum dijawab.`);
      const first = unanswered[0]?.questionId;
      if (first && questionRefs.current[first]) {
        questionRefs.current[first]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightId(first);
        setTimeout(() => setHighlightId(null), 1500);
      }
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Convert answers object to array format
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      }));

      await submitSelfEvaluation(task._id, { answers: answersArray });

      // Navigate to results page
      navigate(`/cerapan/results/${task._id}`);
    } catch (err: any) {
      console.error("Error submitting evaluation:", err);
      setError(err.response?.data?.message || "Gagal menghantar penilaian. Sila cuba lagi.");
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

  if (error && !task) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!task) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">Tiada data tugasan.</Alert>
      </Box>
    );
  }

  // Calculate progress
  const answeredCount = Object.values(answers).filter((a) => a !== "").length;
  const totalCount = task.questions_snapshot.length;
  const progress = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;

  return (
    <Box sx={{ p: 4 }}>
      {/* Page Header */}
      <Stack spacing={3} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" color="primary" gutterBottom>
            Penilaian Kendiri
          </Typography>
          <Typography color="text.secondary">
            Sila isi borang penilaian kendiri berdasarkan prestasi anda
          </Typography>
        </Box>

        {/* Task Info Card */}
        <Card>
          <CardContent>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                <BookOpen size={20} style={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Subjek
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {task.subject}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                <Users size={20} style={{ color: theme.palette.primary.main }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Kelas
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {task.class}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
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
            </Stack>
          </CardContent>
        </Card>

        {/* Progress Bar */}
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Kemajuan Penilaian
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {answeredCount} / {totalCount} soalan
                </Typography>
              </Stack>
              <Box
                sx={{
                  height: 8,
                  bgcolor: theme.palette.grey[200],
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${progress}%`,
                    bgcolor: theme.palette.success.main,
                    transition: "width 0.3s ease",
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Questions */}
      <Card>
        <CardContent>
          <Stack spacing={4}>
            <Typography variant="h6" sx={{ mb: 3, color: theme.palette.primary.main }}>
              Soalan Penilaian
            </Typography>
            
            <Stack spacing={4}>
              {groupQuestionsByAspek().map(([aspekKey, aspekData], aspekIndex) => (
                <Box key={aspekKey}>
                  {/* Aspek Header */}
                  <Paper
                    elevation={2}
                    sx={{
                      p: 2,
                      mb: 2,
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.common.white,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {aspekData.title}
                    </Typography>
                    {aspekData.subtitle && (
                      <Typography variant="body2" sx={{ mt: 0.5, opacity: 0.9 }}>
                        {aspekData.subtitle}
                      </Typography>
                    )}
                  </Paper>

                  {/* Questions in this Aspek */}
                  <Stack spacing={3}>
                    {aspekData.questions.map((question) => (
                      <Card
                        key={question.questionId}
                        variant="outlined"
                        ref={(el: HTMLDivElement | null) => { questionRefs.current[question.questionId] = el; }}
                        sx={highlightId === question.questionId ? { borderColor: theme.palette.error.main, boxShadow: `${theme.palette.error.main}40 0 0 0 2px` } : undefined}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                            {question.questionId}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                            {question.text}
                          </Typography>
                          
                          <FormControl component="fieldset" fullWidth required>
                            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                              Pilih Skor Anda:
                            </FormLabel>
                            <RadioGroup
                              value={answers[question.questionId] || ""}
                              onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                            >
                              {getScoreDescriptions(question).map((scoreOption) => (
                                <FormControlLabel
                                  key={scoreOption.score}
                                  value={scoreOption.score.toString()}
                                  control={<Radio />}
                                  label={
                                    <Box sx={{ py: 0.5 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        Skor {scoreOption.score}: {scoreOption.label}
                                      </Typography>
                                      <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ whiteSpace: 'pre-line' }}
                                      >
                                        {scoreOption.description}
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 1,
                                    mb: 1,
                                    px: 2,
                                    py: 1,
                                    '&:hover': {
                                      bgcolor: theme.palette.action.hover,
                                    },
                                    ...(answers[question.questionId] === scoreOption.score.toString() && {
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
                    ))}
                  </Stack>

                  {aspekIndex < groupQuestionsByAspek().length - 1 && (
                    <Divider sx={{ my: 4 }} />
                  )}
                </Box>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body1" fontWeight={600}>
                Sedia untuk menghantar?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pastikan semua soalan telah dijawab sebelum menghantar.
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="large"
              startIcon={<Send />}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Menghantar..." : "Hantar Penilaian"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

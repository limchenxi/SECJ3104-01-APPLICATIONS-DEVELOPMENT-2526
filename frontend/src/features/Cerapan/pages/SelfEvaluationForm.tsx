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
import type { CerapanRecord } from "../type";

// Scoring rubric function - returns different rubrics based on question pattern
const getScoreDescriptions = (questionId: string) => {
  // Pattern 1: Aspek 4.3 (4 criteria)
  if (questionId.startsWith("4.3.")) {
    return [
      {
        score: 4,
        label: "Cemerlang",
        description: "i. Mengikut keperluan/pelbagai aras keupayaan murid\nii. Dengan betul dan tepat\niii. Secara berhemah\niv. Bersungguh-sungguh",
      },
      {
        score: 3,
        label: "Baik",
        description: "Mengambil kira mana-mana tiga (3) perkara",
      },
      {
        score: 2,
        label: "Sederhana",
        description: "Mengambil kira mana-mana dua (2) perkara",
      },
      {
        score: 1,
        label: "Lemah",
        description: "Mengambil kira mana-mana satu (1) perkara",
      },
      {
        score: 0,
        label: "Tidak Memuaskan",
        description: "Tidak mengambil kira mana-mana perkara",
      },
    ];
  }
  
  // Pattern 2: Aspek 4.5 (4 criteria)
  if (questionId.startsWith("4.5.")) {
    return [
      {
        score: 4,
        label: "Cemerlang",
        description: "i. Berdasarkan objektif pelajaran\nii. Mengikut arahan pelaksanaan pentaksiran/ketetapan kurikulum yang berkuat kuasa\niii. Secara menyeluruh kepada semua murid\niv. Dari semasa ke semasa",
      },
      {
        score: 3,
        label: "Baik",
        description: "Mengambil kira mana-mana tiga (3) perkara",
      },
      {
        score: 2,
        label: "Sederhana",
        description: "Mengambil kira mana-mana dua (2) perkara",
      },
      {
        score: 1,
        label: "Lemah",
        description: "Mengambil kira mana-mana satu (1) perkara",
      },
      {
        score: 0,
        label: "Tidak Memuaskan",
        description: "Tidak mengambil kira mana-mana perkara",
      },
    ];
  }
  
  // Pattern 3: Aspek 4.6 (percentage-based)
  if (questionId.startsWith("4.6.")) {
    // Check if it's 4.6.1d, 4.6.1e, 4.6.1f, 4.6.1g (50-100% base)
    if (["4.6.1d", "4.6.1e", "4.6.1f", "4.6.1g"].includes(questionId)) {
      return [
        {
          score: 4,
          label: "Cemerlang",
          description: "i. Pelibatan 50%-100% murid\nii. Selaras dengan objektif pelajaran\niii. Dengan yakin\niv. Secara berhemah/bersungguh-sungguh",
        },
        {
          score: 3,
          label: "Baik",
          description: "Memenuhi sekurang-kurangnya dua (2) perkara daripada (ii), (iii), (iv)",
        },
        {
          score: 2,
          label: "Sederhana",
          description: "Memenuhi sekurang-kurangnya satu (1) perkara daripada (ii), (iii), (iv)",
        },
        {
          score: 1,
          label: "Lemah",
          description: "Memenuhi sekurang-kurangnya satu (1) perkara daripada (ii), (iii), (iv)",
        },
        {
          score: 0,
          label: "Tidak Memuaskan",
          description: "Tidak memenuhi mana-mana perkara",
        },
      ];
    }
    // Default 4.6 (90-100% base)
    return [
      {
        score: 4,
        label: "Cemerlang",
        description: "i. Pelibatan 90%-100% murid\nii. Selaras dengan objektif pelajaran\niii. Dengan yakin\niv. Secara berhemah/bersungguh-sungguh",
      },
      {
        score: 3,
        label: "Baik",
        description: "i. Pelibatan 80%-89% murid\nii. Memenuhi sekurang-kurangnya dua (2) perkara daripada (ii), (iii), (iv)",
      },
      {
        score: 2,
        label: "Sederhana",
        description: "i. Pelibatan 50%-79% murid\nii. Memenuhi sekurang-kurangnya satu (1) perkara daripada (ii), (iii), (iv)",
      },
      {
        score: 1,
        label: "Lemah",
        description: "i. Pelibatan 1%-49% murid\nii. Memenuhi sekurang-kurangnya satu (1) perkara daripada (ii), (iii), (iv)",
      },
      {
        score: 0,
        label: "Tidak Memuaskan",
        description: "Tidak memenuhi mana-mana perkara",
      },
    ];
  }
  
  // Pattern 4: Aspek 4.2.2 (3 criteria - berhemah/menyeluruh/semasa)
  if (questionId.startsWith("4.2.2")) {
    return [
      {
        score: 4,
        label: "Cemerlang",
        description: "i. Secara berhemah/mengikut kesesuaian\nii. Secara menyeluruh meliputi semua murid\niii. Dari semasa ke semasa",
      },
      {
        score: 3,
        label: "Baik",
        description: "Mengambil kira perkara (i) dan (ii) atau perkara (i) dan (iii)",
      },
      {
        score: 2,
        label: "Sederhana",
        description: "Mengambil kira perkara (ii) dan (iii)",
      },
      {
        score: 1,
        label: "Lemah",
        description: "Mengambil kira mana-mana satu (1) perkara",
      },
      {
        score: 0,
        label: "Tidak Memuaskan",
        description: "Tidak mengambil kira mana-mana perkara",
      },
    ];
  }
  
  // Pattern 5: Aspek 4.4.2 (3 criteria - berhemah/menyeluruh/semasa)
  if (questionId.startsWith("4.4.2")) {
    return [
      {
        score: 4,
        label: "Cemerlang",
        description: "i. Secara berhemah\nii. Secara menyeluruh meliputi semua murid\niii. Dari semasa ke semasa",
      },
      {
        score: 3,
        label: "Baik",
        description: "Mengambil kira perkara (i) dan (ii) atau perkara (i) dan (iii)",
      },
      {
        score: 2,
        label: "Sederhana",
        description: "Mengambil kira perkara (ii) dan (iii)",
      },
      {
        score: 1,
        label: "Lemah",
        description: "Mengambil kira mana-mana satu (1) perkara",
      },
      {
        score: 0,
        label: "Tidak Memuaskan",
        description: "Tidak mengambil kira mana-mana perkara",
      },
    ];
  }
  
  // Pattern 6: Aspek 4.2.1 (menepati/pelbagai/semasa)
  if (questionId.startsWith("4.2.1")) {
    return [
      {
        score: 4,
        label: "Cemerlang",
        description: "i. Menepati objektif pelajaran\nii. Mengikut pelbagai aras keupayaan murid/pembelajaran terbeza\niii. Dari semasa ke semasa",
      },
      {
        score: 3,
        label: "Baik",
        description: "Mengambil kira perkara (i) dan (ii) atau perkara (i) dan (iii)",
      },
      {
        score: 2,
        label: "Sederhana",
        description: "Mengambil kira perkara (ii) dan (iii)",
      },
      {
        score: 1,
        label: "Lemah",
        description: "Mengambil kira mana-mana satu (1) perkara",
      },
      {
        score: 0,
        label: "Tidak Memuaskan",
        description: "Tidak mengambil kira mana-mana perkara",
      },
    ];
  }
  
  // Pattern 7: Aspek 4.4.1 (objektif/pelbagai/semasa)
  if (questionId.startsWith("4.4.1")) {
    return [
      {
        score: 4,
        label: "Cemerlang",
        description: "i. Berdasarkan objektif pelajaran\nii. Mengikut pelbagai aras keupayaan murid\niii. Dari semasa ke semasa",
      },
      {
        score: 3,
        label: "Baik",
        description: "Mengambil kira perkara (i) dan (ii) atau perkara (i) dan (iii)",
      },
      {
        score: 2,
        label: "Sederhana",
        description: "Mengambil kira perkara (ii) dan (iii)",
      },
      {
        score: 1,
        label: "Lemah",
        description: "Mengambil kira mana-mana satu (1) perkara",
      },
      {
        score: 0,
        label: "Tidak Memuaskan",
        description: "Tidak mengambil kira mana-mana perkara",
      },
    ];
  }
  
  // Default: Aspek 4.1 pattern (pelbagai/masa/arahan)
  return [
    {
      score: 4,
      label: "Cemerlang",
      description: "i. Mengikut pelbagai aras keupayaan murid\nii. Mengikut peruntukan masa yang ditetapkan\niii. Mematuhi arahan/ketetapan kurikulum yang berkuat kuasa",
    },
    {
      score: 3,
      label: "Baik",
      description: "Mengambil kira perkara (i) dan (ii) atau perkara (i) dan (iii)",
    },
    {
      score: 2,
      label: "Sederhana",
      description: "Mengambil kira perkara (ii) dan (iii)",
    },
    {
      score: 1,
      label: "Lemah",
      description: "Mengambil kira mana-mana satu (1) perkara",
    },
    {
      score: 0,
      label: "Tidak Memuaskan",
      description: "Tidak mengambil kira mana-mana perkara",
    },
  ];
};

export default function SelfEvaluationForm() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [task, setTask] = useState<CerapanRecord | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
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

  // Group questions by Aspek with titles
  const groupQuestionsByAspek = () => {
    if (!task) return [];
    
    const aspekTitles: { [key: string]: { title: string; subtitle: string } } = {
      "4.1": { 
        title: "Aspek 4.1: GURU SEBAGAI PERANCANG", 
        subtitle: "Guru merancang pelaksanaan PdPc secara profesional dan sistematik" 
      },
      "4.2": { 
        title: "Aspek 4.2: GURU SEBAGAI PENGAWAL", 
        subtitle: "Guru mengawal proses dan suasana pembelajaran" 
      },
      "4.3": { 
        title: "Aspek 4.3: GURU SEBAGAI PEMBIMBING", 
        subtitle: "Guru membimbing murid secara profesional dan terancang" 
      },
      "4.4": { 
        title: "Aspek 4.4: GURU SEBAGAI PENDORONG", 
        subtitle: "Guru mendorong minda dan emosi murid" 
      },
      "4.5": { 
        title: "Aspek 4.5: GURU SEBAGAI PENILAI", 
        subtitle: "Guru melaksanakan penilaian secara sistematik dan profesional" 
      },
      "4.6": { 
        title: "Aspek 4.6: MURID SEBAGAI PEMBELAJAR AKTIF", 
        subtitle: "Murid melibatkan diri dalam proses pembelajaran" 
      },
    };
    
    const grouped: { 
      [key: string]: { 
        title: string; 
        subtitle: string; 
        questions: typeof task.questions_snapshot 
      } 
    } = {};
    
    task.questions_snapshot.forEach((question) => {
      // Extract Aspek from questionId (e.g., "4.1.1a" -> "4.1")
      const aspekMatch = question.questionId.match(/^(\d+\.\d+)/);
      const aspekId = aspekMatch ? aspekMatch[1] : "Other";
      
      if (!grouped[aspekId]) {
        grouped[aspekId] = {
          title: aspekTitles[aspekId]?.title || `Aspek ${aspekId}`,
          subtitle: aspekTitles[aspekId]?.subtitle || "",
          questions: [],
        };
      }
      grouped[aspekId].questions.push(question);
    });
    
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !id) return;

    // Validate all questions are answered
    const unanswered = task.questions_snapshot.filter(
      (q) => !answers[q.questionId] || answers[q.questionId].trim() === ""
    );

    if (unanswered.length > 0) {
      setError("Sila jawab semua soalan sebelum menghantar.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          answer,
        })),
      };

      await submitSelfEvaluation(id, payload);
      
      // Navigate to results page
      navigate(`/cerapan/results/${id}`);
    } catch (err: any) {
      console.error("Error submitting evaluation:", err);
      setError(err.response?.data?.message || "Gagal menghantar. Sila cuba lagi.");
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
            <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900], mb: 0.5 }}>
              Borang Penilaian Kendiri
            </Typography>
            <Typography color="text.secondary">
              Sila jawab semua soalan dengan jujur berdasarkan prestasi anda
            </Typography>
          </Box>

          {/* Task Info Card */}
          <Card raised>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <BookOpen size={20} style={{ color: theme.palette.primary.main }} />
                  <Typography variant="h6">{task.subject}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Users size={18} style={{ color: theme.palette.grey[600] }} />
                  <Typography color="text.secondary">Kelas: {task.class}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Calendar size={18} style={{ color: theme.palette.grey[600] }} />
                  <Typography color="text.secondary">Tempoh: {task.period}</Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* Questions Grouped by Aspek */}
          <Paper elevation={0} sx={{ p: 3, bgcolor: theme.palette.grey[50] }}>
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
                      <Card key={question.questionId} variant="outlined">
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
                              {getScoreDescriptions(question.questionId).map((scoreOption) => (
                                <FormControlLabel
                                  key={scoreOption.score}
                                  value={scoreOption.score.toString()}
                                  control={<Radio />}
                                  label={
                                    <Box sx={{ py: 0.5 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        Skor {scoreOption.score}: {scoreOption.label}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
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

                  {/* Divider between Aspeks */}
                  {aspekIndex < groupQuestionsByAspek().length - 1 && (
                    <Divider sx={{ my: 4 }} />
                  )}
                </Box>
              ))}
            </Stack>
          </Paper>

          {/* Submit Button */}
          <Stack direction="row" justifyContent="flex-end" spacing={2}>
            <Button
              variant="outlined"
              onClick={() => navigate("/cerapan")}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <Send size={20} />}
              sx={{
                bgcolor: theme.palette.success.main,
                "&:hover": { bgcolor: theme.palette.success.dark },
                px: 4,
              }}
            >
              {submitting ? "Menghantar..." : "Hantar Penilaian"}
            </Button>
          </Stack>
        </Stack>
      </form>
    </Box>
  );
}

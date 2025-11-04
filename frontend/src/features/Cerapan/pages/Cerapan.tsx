import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { CheckCircle2, Send, Clock, User, Briefcase } from "lucide-react";

// Interfaces (for typing, simplified in JS/JSX)
// interface Teacher { id: number; name: string; subject: string; cerapan1: number | null; cerapan2: number | null; status: 'Completed' | 'Pending'; }
// interface EvaluationFormProps { teacher: Teacher; }

const evaluationCriteria = [
  { id: 1, category: "Perancangan Pengajaran", maxScore: 25 },
  { id: 2, category: "Penyampaian Pengajaran", maxScore: 25 },
  { id: 3, category: "Pengurusan Bilik Darjah", maxScore: 20 },
  { id: 4, category: "Kemahiran Komunikasi", maxScore: 15 },
  { id: 5, category: "Penggunaan BBM", maxScore: 15 },
];

const initialScores = evaluationCriteria.reduce((acc, curr) => {
  acc[curr.id] = 0; // Initialize score to 0
  return acc;
}, {});

// Mock Teacher Data
const mockTeacher = {
  id: 1,
  name: "Puan Siti Nurhaliza",
  subject: "Bahasa Melayu",
  cerapan1: 85, // Mock previous score
  cerapan2: null,
  status: 'Pending',
};

// --- Helper Component for Score Input ---
const ScoreInput = ({ id, category, maxScore, value, onChange }) => {
  const theme = useTheme();
  const isInvalid = value > maxScore || value < 0;

  return (
    <Card variant="outlined" sx={{ boxShadow: 0, '&:hover': { boxShadow: theme.shadows[1] } }}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle2 size={20} style={{ color: theme.palette.success.main }} />
            <Typography variant="body1" sx={{ color: theme.palette.grey[900] }}>
              {category}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              type="number"
              value={value}
              onChange={(e) => {
                const numValue = parseInt(e.target.value, 10);
                onChange(id, isNaN(numValue) ? 0 : numValue);
              }}
              inputProps={{ min: 0, max: maxScore }}
              error={isInvalid}
              helperText={isInvalid ? `Maks: ${maxScore}` : ''}
              size="small"
              sx={{ width: 80 }}
            />
            <Typography variant="body2" sx={{ color: theme.palette.info.dark, fontWeight: 'bold' }}>
              /{maxScore}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// --- MAIN COMPONENT ---
export default function PentadbirCerapanForm({ teacher = mockTeacher }) {
  const theme = useTheme();
  const [scores, setScores] = useState(initialScores);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewing, setIsViewing] = useState(false); // Controls display mode (Form vs. Result View)

  const handleScoreChange = (id, newScore) => {
    setScores((prevScores) => ({
      ...prevScores,
      [id]: newScore,
    }));
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  const maxTotalScore = evaluationCriteria.reduce((sum, item) => sum + item.maxScore, 0);
  const percentage = maxTotalScore > 0 ? ((totalScore / maxTotalScore) * 100).toFixed(0) : 0;
  const isFormValid = Object.values(scores).every((score, index) => score >= 0 && score <= evaluationCriteria[index].maxScore);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!isFormValid) {
      alert("Sila betulkan markah yang melebihi markah maksimum."); // Use alert for simple demo
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      console.log("Submitting Scores:", scores, "Comment:", comment);
      setIsSubmitting(false);
      setIsViewing(true); // Switch to viewing results
    }, 2000);
  };

  if (isViewing) {
    // Simplified Result View (Based on the structure provided by user for self-evaluation)
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Cerapan Pentadbir: Keputusan</Typography>
        {/* Placeholder for Final Score Card (Similar to ST14 completed view) */}
        <Card sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.dark, p: 3, mb: 3 }}>
           <Typography variant="h4">Skor Akhir: {totalScore} / {maxTotalScore} ({percentage}%)</Typography>
           <Typography variant="body1" mt={1}>Penilaian Berjaya Disimpan.</Typography>
        </Card>

        {/* Display Submitted Scores */}
        <Typography variant="h6" sx={{ color: theme.palette.info.dark, mb: 2 }}>Markah Yang Diberi:</Typography>
        <Grid container spacing={2}>
            {evaluationCriteria.map((criteria) => (
                <Grid item xs={12} sm={6} md={4} key={criteria.id}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">{criteria.category}</Typography>
                        <Typography variant="h6">{scores[criteria.id]} / {criteria.maxScore}</Typography>
                    </Card>
                </Grid>
            ))}
        </Grid>
        <Button onClick={() => setIsViewing(false)} sx={{ mt: 3 }} variant="outlined">Edit Semula</Button>
      </Box>
    );
  }

  // --- Assessment Form View ---
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>
        <Typography variant="h4" sx={{ color: theme.palette.primary.dark }}>
          Cerapan Pengajaran Guru
        </Typography>
        <Typography color="text.secondary" variant="body1">
          Sila masukkan markah penilaian untuk setiap kriteria pengajaran.
        </Typography>

        {/* Teacher Info Card */}
        <Card raised sx={{ bgcolor: theme.palette.info.light, border: `1px solid ${theme.palette.info.main}`, boxShadow: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <User size={16} /> Nama Guru
                </Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.grey[900], fontWeight: 'bold' }}>{teacher.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Briefcase size={16} /> Subjek
                </Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.grey[900], fontWeight: 'bold' }}>{teacher.subject}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Cerapan 1 Skor</Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
                  {teacher.cerapan1 ? `${teacher.cerapan1}%` : 'Belum Selesai'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" color="text.secondary">Cerapan 2 Skor</Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main }}>
                  {teacher.cerapan2 ? `${teacher.cerapan2}%` : 'Belum Selesai'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Evaluation Breakdown */}
        <Card raised sx={{ boxShadow: 2 }}>
          <CardHeader title={<Typography variant="h6" sx={{ color: theme.palette.primary.dark }}>Kriteria Penilaian (Markah)</Typography>} />
          <CardContent>
            <Stack spacing={2}>
              {evaluationCriteria.map((criteria) => (
                <ScoreInput
                  key={criteria.id}
                  id={criteria.id}
                  category={criteria.category}
                  maxScore={criteria.maxScore}
                  value={scores[criteria.id]}
                  onChange={handleScoreChange}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Total Score Display */}
        <Card raised sx={{
          bgcolor: theme.palette.primary.main,
          color: theme.palette.common.white,
          boxShadow: 3,
        }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.primary.light, mb: 0.5 }}>Jumlah Markah Semasa</Typography>
                <Typography variant="h4">{totalScore} / {maxTotalScore}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: theme.palette.primary.light, mb: 0.5, textAlign: 'right' }}>Peratusan</Typography>
                <Typography variant="h4" sx={{ color: theme.palette.warning.light }}>{percentage}%</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card raised sx={{ boxShadow: 2 }}>
          <CardHeader title={<Typography variant="h6" sx={{ color: theme.palette.primary.dark }}>Komen dan Maklum Balas Penilai</Typography>} />
          <CardContent>
            <TextField
              label="Komen / Cadangan Penambahbaikan"
              multiline
              rows={4}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting || !isFormValid}
          startIcon={isSubmitting ? <CircularProgress size={24} color="inherit" /> : <Send size={24} />}
          sx={{
            mt: 2,
            bgcolor: theme.palette.success.main,
            '&:hover': { bgcolor: theme.palette.success.dark },
            py: 1.5,
          }}
        >
          {isSubmitting ? "Menghantar..." : "Hantar Penilaian Cerapan"}
        </Button>
      </Stack>
    </Box>
  );
}

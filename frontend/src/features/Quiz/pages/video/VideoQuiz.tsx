import React, { useState } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DownloadIcon } from "lucide-react";
import { useGenerateQuiz } from "../../hooks/useGenerateQuiz";
import { exportQuizToPDF } from "../exportQuizToPdf";
import QuizPreview from "../QuizPreview";

export default function VideoQuizGenerator() {
  const [form, setForm] = useState({
    url: "",
    numQuestions: 5,
    difficulty: "medium",
  });

  const { loading, data, generate } = useGenerateQuiz("/api/quiz/ai/video-quiz");

  const handleSubmit = async () => {
    await generate({
      url: form.url,
      numQuestions: form.numQuestions,
      difficulty: form.difficulty as 'easy' | 'medium' | 'hard',
    });
  };

  const handleExport = async () => {
    if (data?.questions) { // Video Quiz 返回 questions
      const quizToExport = {
        questions: data.questions,
        title: "Kuiz Video: " + form.url,
        subject: "Video Content",
        // createdAt 默认为当前时间
      };
      await exportQuizToPDF(quizToExport);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
        🎥 Penjana Kuiz dari Video YouTube
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Masukkan pautan YouTube dan AI akan menjana soalan berdasarkan kandungan video.
      </Typography>

      {/* Form */}
      <Card sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="URL YouTube"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="number"
          label="Bilangan Soalan"
          value={form.numQuestions}
          onChange={(e) =>
            setForm({ ...form, numQuestions: Number(e.target.value) })
          }
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Jana Kuiz Video"}
        </Button>
      </Card>

      {/* Result */}
      {data?.questions && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 2  }}>
            <Typography variant="h6" fontWeight="bold">
              📘 Kuiz Video Dijana
            </Typography>
            <Button
              onClick={handleExport}
              variant="contained"
              startIcon={<DownloadIcon size={18} />}
            >
                    Eksport PDF
                </Button>
          </Box>
          <QuizPreview questions={data.questions} showAnswers={true} />
        </Card>
      )}
    </Box>
  );
}

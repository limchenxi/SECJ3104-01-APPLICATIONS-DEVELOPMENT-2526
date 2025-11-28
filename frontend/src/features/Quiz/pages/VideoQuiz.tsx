import React, { useState } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Copy, CheckCircle2 } from "lucide-react";
import { useGenerateQuiz } from "../hooks/useGenerateQuiz";

export default function VideoQuizGenerator() {
  const [form, setForm] = useState({
    url: "",
    numQuestions: 5,
  });

  // const [quiz, setQuiz] = useState([]);
  // const [loading, setLoading] = useState(false);
  const { loading, data, generate } = useGenerateQuiz("/api/ai/video-quiz");
  const [copied, setCopied] = useState(false);

  // const generateVideoQuiz = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch("/api/ai/video-quiz", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(form),
  //     });

  //     const data = await res.json();
  //     setQuiz(data.quiz);
  //   } catch (e) {
  //     alert("Gagal menjana kuiz daripada video.");
  //   }
  //   setLoading(false);
  // };

  const handleSubmit = () => {
    generate({
      url: form.url,
      numQuestions: form.numQuestions,
    });
  };

  const handleCopy = async () => {
    if (!data?.quiz) return;
    await navigator.clipboard.writeText(JSON.stringify(data.quiz, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {data?.quiz && (
        <Card sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6" fontWeight="bold">
              📘 Kuiz Video Dijana
            </Typography>

            <Button
              onClick={handleCopy}
              startIcon={copied ? <CheckCircle2 /> : <Copy />}
            >
              {copied ? "Disalin!" : "Copy"}
            </Button>
          </Box>

          {data.quiz.map((q: any, idx: number) => (
            <Box key={idx} sx={{ mt: 2 }}>
              <Typography fontWeight="bold">
                {idx + 1}. {q.question}
              </Typography>

              {q.options.map((opt: string, i: number) => (
                <Typography key={i} sx={{ ml: 2 }}>
                  {String.fromCharCode(65 + i)}. {opt}
                </Typography>
              ))}
            </Box>
          ))}
        </Card>
      )}
    </Box>
  );
}

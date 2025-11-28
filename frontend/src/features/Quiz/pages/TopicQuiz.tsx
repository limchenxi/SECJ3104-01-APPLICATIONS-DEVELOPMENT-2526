import React, { useState } from "react";
import { Box, Card, Typography, Button, CircularProgress } from "@mui/material";
import QuizForm from "./Form";
import { useGenerateQuiz } from "../hooks/useGenerateQuiz"; 
import QuizPreview from "./QuizPreview";
import { useQuizHistory } from "../hooks/useQuizHistory";

export default function TopicQuizGenerator() {
  const [form, setForm] = useState({
    subject: "",
    year: "",
    topic: "",
    difficulty: "medium",
    numQuestions: 5,
  });
  const { loading, error, data, generateAndSave } = useGenerateQuiz();
  const { reload } = useQuizHistory({ pollInterval: 0 });
  // const [quiz, setQuiz] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [copied, setCopied] = useState(false);

  // const generateQuiz = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch("/api/ai/quiz", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(form),
  //     });

  //     const data = await res.json();
  //     setQuiz(data.quiz);
  //   } catch {
  //     alert("Gagal menjana kuiz.");
  //   }
  //   setLoading(false);
  // };

  const handleGenerate = async () => {
    try {
      const saved = await generateAndSave(
        {
          subject: form.subject,
          topic: form.topic,
          difficulty: form.difficulty,
          numQuestions: form.numQuestions,
        },
        "teacher-web"
      );
      // refresh history list immediately (if you show it)
      reload();
      // data returned as saved quiz
      // optional: show toast/snackbar
    } catch (err) {
      console.error(err);
      alert("Gagal menjana kuiz.");
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
        📝 Penjana Kuiz AI
      </Typography>
      <Typography color="text.secondary">
        Jana soalan kuiz aneka pilihan secara automatik berdasarkan topik
      </Typography>
      <br /><br />
      <QuizForm 
        form={form} 
        setForm={setForm} 
        loading={loading} 
        onSubmit={handleGenerate} />

      {data && (
        <Card sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            📘 Kuiz Dijana
          </Typography>
          <QuizPreview questions={data.questions || []} showAnswers={false} />
          {/* {data.quiz.map((q, idx) => (
            <Box key={idx}>
              <b>{idx + 1}. {q.question}</b>
              {q.options.map((opt, i) => (
                <Typography sx={{ ml: 2 }}>
                  {String.fromCharCode(65 + i)}. {opt}
                </Typography>
              ))}
            </Box>
          ))} */}
        </Card>
      )}
    </Box>
  );
}

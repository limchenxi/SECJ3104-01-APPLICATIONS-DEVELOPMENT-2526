import React, { useState } from "react";
import { Box, Card, Typography, Button, CircularProgress } from "@mui/material";
import QuizForm from "../Form";
import { useGenerateQuiz } from "../../hooks/useGenerateQuiz"; 
import QuizPreview from "../QuizPreview";
import { useQuizHistory } from "../../hooks/useQuizHistory";
import { exportQuizToPDF } from "../exportQuizToPdf";

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

  const handleGenerate = async () => {
    try {
      const saved = await generateAndSave(
        {
          subject: form.subject,
          year: form.year,
          topic: form.topic,
          difficulty: form.difficulty,
          numQuestions: form.numQuestions,
        },
        "teacher-web"
      );
      // refresh history list immediately (if you show it)
      // reload();
      // data returned as saved quiz
      // optional: show toast/snackbar
    } catch (err) {
      console.error(err);
      alert("Gagal menjana kuiz.");
    }
  };

  const handleExportWithAnswers = () => {
    if (data) {
      exportQuizToPDF(data, { showAnswers: true });
    }
  };
  
  const handleExportWithoutAnswers = () => {
    if (data) {
      exportQuizToPDF(data, { showAnswers: false });
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
      <br />
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
          <QuizPreview questions={data.questions || []} showAnswers={true} />
          {/* <Box sx={{ mt: 2, p: 1, border: '1px solid #ccc' }}>
            {data.questions && data.questions.length > 0 ? (
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                    {JSON.stringify(data.questions[0], null, 2)} 
                </pre>
            ) : (
                <Typography>Questions array is empty or missing.</Typography>
            )}
        </Box> */}
          {/* `Jumlah ${data.questions.length} soalan dijana.` 
          "Tiada soalan dijana。" */}
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
          <Box sx={{ mt: 3, textAlign: 'right', display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            {/* 导出无答案版本 (给学生) */}
            <Button 
              variant="outlined" 
              onClick={handleExportWithoutAnswers}
            >
              Eksport (Tanpa Jawapan)
            </Button>

            {/* 导出带答案版本 (给老师) */}
            <Button 
              variant="outlined" 
              onClick={handleExportWithAnswers}
            >
              Eksport (Dengan Jawapan)
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
}

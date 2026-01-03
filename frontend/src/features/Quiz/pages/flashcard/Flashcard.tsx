import { useState } from "react";
import { Box, Card, Typography, Button } from "@mui/material";
import { Download as DownloadIcon } from "lucide-react";
import { useGenerateQuiz } from "../../hooks/useGenerateQuiz";
import QuizForm from "../Form";
import FlashcardPreview from "./FlashcardPreview";
// Import the specific flashcard export function
import { downloadFlashcardPDF } from "./downloadFlashcardPDF";
import { useQuizHistory } from "../../hooks/useQuizHistory";

export default function FlashcardGenerator() {
  // Point to the flashcard API endpoint
  const { loading, data, generate } = useGenerateQuiz("/api/quiz/ai/flashcards");
  const { reload } = useQuizHistory({ pollInterval: 0 });
  const [form, setForm] = useState({
    subject: "",
    year: "",
    topic: "",
    difficulty: "medium",
    numQuestions: 10,
  });

  const handleGenerate = async () => {
    try {
      await generate({
        subject: form.subject,
        year: form.year,
        topic: form.topic,
        difficulty: form.difficulty as 'easy' | 'medium' | 'hard',
        numQuestions: form.numQuestions,
      });
      reload();
    }catch (error) {
        console.error("Flashcard generation error:", error);
    }
  };

  const handleExport = async () => {
    if (data && data.flashcards) {
      // Create a data object structure similar to what the export function expects
      const exportData = {
        title: `Kad Imbas: ${form.topic}`,
        subject: form.subject,
        flashcards: data.flashcards
      };
      await downloadFlashcardPDF(exportData);
    }
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
        📚 Penjana Kad Imbas AI
      </Typography>
      <Typography color="text.secondary">
        Jana kad imbas (flashcards) untuk membantu murid mengingati istilah dan konsep penting
      </Typography>
      <br />

      <QuizForm
        form={form}
        setForm={setForm}
        loading={loading}
        onSubmit={handleGenerate}
      />

      {data?.flashcards && (
        <Card sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              📚 Kad Imbas Dijana
            </Typography>
            <Button 
              variant="contained" 
              onClick={handleExport}
              startIcon={<DownloadIcon size={18} />}
            >
              Eksport PDF
            </Button>
          </Box>
          
          <FlashcardPreview flashcards={data.flashcards} />
          
        </Card>
      )}
    </Box>
  );
}
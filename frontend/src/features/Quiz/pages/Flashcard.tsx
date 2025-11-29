import React, { useState } from "react";
import { Box, Card, Typography, Button } from "@mui/material";

import QuizForm from "./Form";
import { useGenerateQuiz } from "../hooks/useGenerateQuiz";

export default function FlashcardGenerator() {
  const { loading, data, generate } = useGenerateQuiz("/api/ai/flashcards");
  const [form, setForm] = useState({
    subject: "",
    year: "",
    topic: "",
    difficulty: "medium",
    numQuestions: 10, // 👉 在 Flashcard 中当成 "numCards"
  });

  // const [cards, setCards] = useState([]);
  // const [loading, setLoading] = useState(false);
  // const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    generate(form);
  };
  // const generateFlashcards = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await fetch("/api/ai/flashcards", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         subject: form.subject,
  //         year: form.year,
  //         topic: form.topic,
  //         difficulty: form.difficulty,
  //         count: form.numQuestions, // ⚡ 用同一个字段
  //       }),
  //     });

  //     const data = await res.json();
  //     setCards(data.flashcards);
  //   } catch {
  //     alert("Gagal menjana kad imbas.");
  //   }
  //   setLoading(false);
  // };

  // const handleCopy = async () => {
  //   await navigator.clipboard.writeText(JSON.stringify(cards, null, 2));
  //   setCopied(true);
  //   setTimeout(() => setCopied(false), 2000);
  // };

  return (
    <Box>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
          📚 Penjana Kad Imbas AI
      </Typography>
      <Typography color="text.secondary">
          Jana kad imbas (flashcards) untuk membantu murid mengingati istilah dan konsep penting
      </Typography>
      <br /><br />

      {/* 🔥 use same Form */}
      <QuizForm
        form={form}
        setForm={setForm}
        loading={loading}
        onSubmit={handleGenerate}
      />

      {data?.flashcards && (
        <Card sx={{ p: 3 }}>
          {data.flashcards.map((c, i) => (
            <Box key={i}>
              <Typography fontWeight="bold">{c.front}</Typography>
              <Typography sx={{ ml: 2 }}>{c.back}</Typography>
            </Box>
          ))}
        </Card>
      )}
    </Box>
  );
}

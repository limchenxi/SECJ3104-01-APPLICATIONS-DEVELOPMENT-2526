// src/components/QuizHistory.tsx
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Divider,
  Button,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import { useQuizHistory } from "../hooks/useQuizHistory";
import { exportQuizToPDF } from "./exportQuizToPdf";

export default function QuizHistory({ onSelect }: { onSelect?: (q: any) => void }) {
  const { list, loading, error, reload } = useQuizHistory({ pollInterval: 8000 });

  async function handleDeleteHistory(id: string) {
    if (!confirm("Padam rekod sejarah ini?")) return;
    await fetch(`/api/quiz/history/${id}`, { method: "DELETE" });
    reload();
  }

  async function handleExport(quiz: any) {
    // if history contains snapshot string, parse it; otherwise fetch quiz by id
    let quizObj = null;
    if (quiz.snapshot) {
      try {
        const snap = typeof quiz.snapshot === "string" ? JSON.parse(quiz.snapshot) : quiz.snapshot;
        // 如果 snapshot 存放 { quiz: [...] , meta: {...} }
        quizObj = {
          title: quiz?.title || (snap.meta && snap.meta.title) || "Kuiz",
          subject: snap.meta?.subject || "",
          createdAt: quiz.createdAt,
          questions: snap.quiz || snap.questions || [],
        };
      } catch {
        // fallback to fetching
      }
    }
    if (!quizObj && quiz.quizId) {
      const res = await fetch(`/api/quiz/${quiz.quizId}`);
      quizObj = await res.json();
    }
    if (!quizObj) {
      alert("Tiada data kuiz untuk dieksport");
      return;
    }
    exportQuizToPDF(quizObj, { title: quizObj.title });
  }

  if (loading) return <Box sx={{ p: 3 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error loading history</Typography>;

  return (
    <Box sx={{ width: 360, p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">Sejarah Kuiz</Typography>
        <Button size="small" onClick={reload}>Refresh</Button>
      </Box>

      {list.map((h: any) => (
        <Card key={h._id} variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography fontWeight="bold">{h.generatedBy} • {new Date(h.createdAt).toLocaleString()}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  QuizId: {String(h.quizId).slice(0, 8)}
                </Typography>
              </Box>

              <Box>
                <IconButton size="small" onClick={() => onSelect && onSelect(h)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton size="small" onClick={() => handleExport(h)}>
                  <DownloadIcon />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDeleteHistory(h._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {h.note || (h.snapshot ? "Snapshot available" : "No details")}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}

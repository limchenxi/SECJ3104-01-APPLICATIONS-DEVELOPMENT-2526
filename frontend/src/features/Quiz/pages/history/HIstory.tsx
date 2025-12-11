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
import { useQuizHistory } from "../../hooks/useQuizHistory";
import { exportQuizToPDF } from "../exportQuizToPdf";
import { downloadFlashcardPDF } from "../flashcard/downloadFlashcardPDF";

export default function QuizHistory({ onSelect }: { onSelect?: (q: any) => void }) {
  const { list, loading, error, reload } = useQuizHistory({ pollInterval: 8000 });

  async function handleDeleteHistory(id: string) {
    if (!confirm("Padam rekod sejarah ini?")) return;
    try {
      const res = await fetch(`/api/quiz/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        reload(); // 删除成功后才重新加载列表
      } else {
        const errorText = await res.text();
        console.error("DELETE FAILED:", res.status, errorText);
        alert(`Gagal padam rekod. Status: ${res.status}`);
      }
    } catch (err) {
      console.error("DELETE FETCH ERROR:", err);
      alert("Ralat rangkaian ketika memadam.");
    }
}

  async function handleExport(historyItem: any) {
    // let quizObj = null;
    let contentObj = null;
    // 1. 尝试使用预解析的快照对象
    const isQuiz = historyItem.snapshot && historyItem.snapshot.questions;
    const isFlashcard = historyItem.snapshot && historyItem.snapshot.flashcards;
    // if (quiz.snapshot && quiz.snapshot.questions && quiz.snapshot.questions.length > 0) {
    //     const snap = quiz.snapshot;
    //     quizObj = {
    //         // 从历史记录和快照中提取元数据
    //         title: snap.title || "Kuiz Dijana",
    //         subject: snap.subject || "",
    //         createdAt: quiz.createdAt,
    //         questions: snap.questions, // 直接使用解析后的 questions 数组
    //     };
    // } 
    if (isQuiz || isFlashcard) {
        const snap = historyItem.snapshot;
        contentObj = {
            title: snap.title || "Konten Dijana",
            subject: snap.subject || "",
            createdAt: historyItem.createdAt,
            // 确保 questions 和 flashcards 字段都存在，以便导出函数区分
            questions: snap.questions, 
            flashcards: snap.flashcards,
        };
    } 
    
    // 2. 否则，通过 API 获取
    else if (historyItem.quizId) {
        try {
            const res = await fetch(`/api/quiz/${historyItem.quizId}`);
            if (!res.ok) throw new Error("Failed to fetch quiz");
            contentObj = await res.json();
        } catch (e) {
            console.error("Failed to fetch quiz by ID:", e);
            alert("Gagal memuat kuiz dari API. Sila cuba lagi.");
            return;
        }
    }

    // 3. 验证数据是否存在
    if (!contentObj) {
        alert("Tiada data kuiz untuk dieksport");
        return;
    }

    // 4. 根据内容类型分发导出
    if (historyItem.contentType === 'flashcard') {
        if (!contentObj.flashcards || contentObj.flashcards.length === 0) {
             alert("Tiada kad imbas untuk dieksport."); return;
        }
        await downloadFlashcardPDF(contentObj, { title: contentObj.title, subject: contentObj.subject });
    
    } else { // 默认为 Kuiz (quiz-topic, quiz-video)
        if (!contentObj.questions || contentObj.questions.length === 0) {
             alert("Tiada soalan kuiz untuk dieksport."); return;
        }
        // 默认导出带答案版本 (可以根据需求提供选项)
        await exportQuizToPDF(contentObj, { title: contentObj.title, showAnswers: true });
    }
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
                  Jenis: 
                  {h.contentType === 'flashcard' ? '🃏 Kad Imbas' : '📝 Kuiz'} 
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

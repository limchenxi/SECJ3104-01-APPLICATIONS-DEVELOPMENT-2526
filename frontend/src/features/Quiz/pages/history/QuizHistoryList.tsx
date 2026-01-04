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
// import DownloadIcon from "@mui/icons-material/Download";
import { useQuizHistory } from "../../hooks/useQuizHistory";
import { exportQuizToPDF } from "../exportQuizToPdf";
import { downloadFlashcardPDF } from "../flashcard/downloadFlashcardPDF";
import { Savings } from "@mui/icons-material";
import { HistoryExportAction } from "./HistoryExportAction";
import { backendClient } from "../../../../utils/axios-client";

export default function QuizHistory({ onSelect }: { onSelect?: (q: any) => void }) {
  const { list, loading, error, reload } = useQuizHistory({ pollInterval: 0 });

  async function handleDeleteHistory(id: string) {
    if (!window.confirm("Padam rekod sejarah ini?")) return;
    try {
      // const res = await fetch(`/api/quiz/history/${id}`, { method: "DELETE" });
      const client = backendClient();
      const res = await client.delete(`/quiz/history/${id}`);
      if (res.status === 204 || res.status === 200) {
        reload();
      } else {
        const errorText = JSON.stringify(res.data);
        console.error("DELETE FAILED:", res.status, errorText);
        //   alert(`Gagal padam rekod. Status: ${res.status}`);
      }
    } catch (err) {
      console.error("DELETE FETCH ERROR:", err);
      // alert("Ralat rangkaian ketika memadam.");
    }
  }

  async function handleExport(historyItem: any, showAnswers: boolean) {
    // let quizObj = null;
    let contentObj = null;
    // 1. 尝试使用预解析的快照对象
    const isQuiz = historyItem.snapshot && historyItem.snapshot.questions;
    const isFlashcard = historyItem.snapshot && historyItem.snapshot.flashcards;
    // if (quiz.snapshot && quiz.snapshot.questions && quiz.snapshot.questions.length > 0) {
    //     const snap = quiz.snapshot;
    //     quizObj = {
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
        year: snap.year || "",
        // 确保 questions 和 flashcards 字段都存在，以便导出函数区分
        questions: snap.questions,
        flashcards: snap.flashcards,
      };
    }

    // 2. 否则，通过 API 获取
    else if (historyItem.quizId) {
      try {
        const client = backendClient();
        const res = await client.get(`/quiz/${historyItem.quizId}`);
        contentObj = res.data;
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
      await downloadFlashcardPDF(contentObj, { title: contentObj.title });

    } else { // 默认为 Kuiz (quiz-topic, quiz-video)
      if (!contentObj.questions || contentObj.questions.length === 0) {
        alert("Tiada soalan kuiz untuk dieksport."); return;
      }
      // 导出带答案版本或无答案版本
      await exportQuizToPDF(contentObj, { title: contentObj.title, showAnswers: showAnswers });
    }
  }

  if (loading) return <Box sx={{ p: 3 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">Error loading history</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
          <Savings /> Kuiz bank
        </Typography>
        <Button size="small" onClick={reload}>Refresh</Button>
      </Box>

      {list.map((h: any) => {
        const snap = h.snapshot || {};

        // 1. 格式化主要标题
        const primaryTitle = (() => {
          const topic = snap.topic || snap.title || 'Konten Dijana';
          if (h.contentType === 'flashcard') {
            return `🃏 Kad Imbas: ${snap.title?.replace('Kad Imbas: ', '') || topic}`;
          }
          if (h.contentType === 'quiz-topic') {
            return `📝 Kuiz: ${topic}`;
          }
          return snap.title || topic;
        })();

        // 2. 构造次要信息 (Subject, Year, Topic)
        const infoDisplayParts = [];
        if (snap.subject) infoDisplayParts.push(`Subjek: ${snap.subject}`);
        if (snap.year) infoDisplayParts.push(`Tahun: ${snap.year}`);

        const primaryInfo = infoDisplayParts.join(' • '); // 使用 ' • ' 连接 Subject, Year
        const hasInfo = infoDisplayParts.length > 0;


        return (
          <Card key={h._id} variant="outlined" sx={{ mb: 4, borderRadius: 2, width: '100%' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                  {/* 🚨 1. 格式化后的主要标题 (Kuiz/Kad Imbas) */}
                  <Typography fontWeight="bold" sx={{ fontSize: '1.05rem', mb: 0.5 }}>
                    {primaryTitle}
                  </Typography>

                  {/* {snap.topic && (
                    <Typography variant="body2" color="text.primary" sx={{ mb: 0.5 }}>
                        Topik: {snap.topic}
                    </Typography>
                )} */}
                  {/* 2. 主体信息 (Subject, Year) */}
                  {hasInfo && (
                    <Typography variant="body2" color="text.secondary">
                      {primaryInfo}
                      {snap.difficulty && ` • Kesukaran: ${snap.difficulty}`}
                    </Typography>
                  )}
                </Box>

                <Box>
                  <IconButton size="small" onClick={() => onSelect && onSelect(h)}>
                    <VisibilityIcon />
                  </IconButton>
                  <HistoryExportAction
                    historyItem={h}
                    onExport={(showAnswers) => handleExport(h, showAnswers)}
                  />
                  <IconButton size="small" color="error" onClick={() => handleDeleteHistory(h._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              {/* 4. Footer (Date) */}
              <Typography variant="caption" color="text.secondary" noWrap>
                Dijana: {new Date(h.createdAt).toLocaleString()}
                {/* | Jenis: {h.contentType === 'flashcard' ? '🃏 Kad Imbas' : '📝 Kuiz'} */}
              </Typography>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
}

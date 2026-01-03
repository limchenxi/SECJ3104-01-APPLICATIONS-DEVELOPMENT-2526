import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";

import { exportQuizToPDF } from "../exportQuizToPdf"; // 导入导出函数
import QuizPreview from "../topic/QuizPreview";
import { downloadFlashcardPDF } from "../flashcard/downloadFlashcardPDF";
import FlashcardPreview from "../flashcard/FlashcardPreview";

// 假设我们有一个接口来定义传递进来的 props
interface QuizDetailModalProps {
  historyItem: any; // 包含 snapshot 或 quizId 的历史记录项
  open: boolean;
  onClose: () => void;
}

interface ContentData {
    title: string;
    subject: string;
    year?: string;
    difficulty: string;
    questions?: any[]; // 测验内容
    flashcards?: any[]; // 闪卡内容
    topic?: string;
}


export default function QuizDetailModal({ historyItem, open, onClose }: QuizDetailModalProps) {
  const [contentData, setContentData] = useState<ContentData | null>(null);
  // const [quizData, setQuizData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 核心逻辑：根据 historyItem 加载完整的测验数据
  useEffect(() => {
    if (!open || !historyItem) return;

    const loadQuizDetails = async () => {
      setLoading(true);
      setError(null);
      setContentData(null);
      let loadedData = null;

      // 1. 尝试从快照加载  //&& historyItem.snapshot.questions
      if (historyItem.snapshot ) {
        const snap = historyItem.snapshot;
        if (snap.questions || snap.flashcards) {
            loadedData = {
                title: snap.title || "Konten Dijana",
                subject: snap.subject || "N/A",
                year: snap.year || "N/A",
                topic: snap.topic || "",
                difficulty: snap.difficulty || "N/A",
                questions: snap.questions,
                flashcards: snap.flashcards,
                createdAt: historyItem.createdAt,
            };
        }
      } 
      
      // 2. 否则，通过 API 获取
      else if (historyItem.quizId) {
        try {
          const res = await fetch(`/api/quiz/${historyItem.quizId}`);
          if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
          const apiData = await res.json();
          loadedData = {
                title: apiData.title || "Kuiz Pangkalan Data",
                subject: apiData.subject || "N/A",
                difficulty: apiData.difficulty || "N/A",
                year: apiData.year || "N/A",
                topic: apiData.topic || "",
                questions: apiData.questions,
                flashcards: apiData.flashcards,
                createdAt: historyItem.createdAt,
            };
        } catch (e) {
          console.error("Failed to load quiz by ID:", e);
          setError("Gagal memuat kuiz dari pangkalan data.");
          setLoading(false);
          return;
        }
      }
      setContentData(loadedData);
      setLoading(false);
    };

    loadQuizDetails();
    
    // 清理函数
    return () => {
        setContentData(null);
        setError(null);
    };

  }, [open, historyItem]); 

  const handleExport = () => {
    if (!contentData) return;
    if (contentData.flashcards && contentData.flashcards.length > 0) {
      downloadFlashcardPDF(contentData);
    } else if (contentData.questions && contentData.questions.length > 0) {
      exportQuizToPDF(contentData);
    } else {
        alert("Tiada data yang dapat dieksport.");
    }
  };

  // const dialogTitle = contentData?.title || "Butiran Kuiz";
  const formattedTitle = (() => {
    if (!contentData) return "Butiran Konten";
    
    // 提取主要主题名称，并清理掉任何前缀
    const rawTitle = contentData.topic || contentData.title || "Konten Dijana";
    const baseContentName = rawTitle.replace(/^(Kad Imbas|Kuiz|Kuiz —|Kad Imbas:)\s*/, '').trim();
    
    if (historyItem.contentType === 'flashcard') {
        return `🃏 Kad Imbas: ${baseContentName}`;
    }
    if (historyItem.contentType === 'quiz-topic') {
        return `📝 Kuiz: ${baseContentName}`;
    }
    return contentData.title;
  })();
  const isQuiz = contentData?.questions && contentData.questions.length > 0;
  const isFlashcard = contentData?.flashcards && contentData.flashcards.length > 0;
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
    >
      <DialogTitle>{formattedTitle}</DialogTitle>
      
      <DialogContent dividers>
        {loading && <Box textAlign="center" py={3}><CircularProgress /></Box>}
        
        {error && <Typography color="error">{error}</Typography>}

        {contentData && (
          <Box>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                Subjek: {contentData.subject || 'N/A'} 
                {contentData.year && ` | Tahun: ${contentData.year} `}
                | Kesukaran: {contentData.difficulty || 'N/A'}
            </Typography>
            
            {isQuiz && <QuizPreview 
                questions={contentData.questions} 
                showAnswers={true} 
                subject={contentData.subject}
                year={contentData.year}
            />}
            
            {isFlashcard && <FlashcardPreview flashcards={contentData.flashcards} />}
            
            {!isQuiz && !isFlashcard && (
                <Typography color="text.secondary">Tiada kandungan untuk dipaparkan.</Typography>
            )}
            
          </Box>
        )}
        
        {!loading && !contentData && !error && (
            <Typography color="text.secondary">Tiada maklumat kuiz tersedia.</Typography>
        )}

      </DialogContent>
      
      <DialogActions>
        {/* <Button 
          onClick={handleExport} 
          disabled={!isQuiz && !isFlashcard || loading}
          startIcon={<DownloadIcon />}
        >
          Eksport PDF
        </Button> */}
        
        <Button onClick={onClose} color="primary" variant="contained">
          Tutup
        </Button>
      </DialogActions>
    </Dialog>
  );
}
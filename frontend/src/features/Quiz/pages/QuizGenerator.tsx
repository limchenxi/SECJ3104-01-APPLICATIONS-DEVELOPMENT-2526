import React, { useState } from "react";
import { Box, Tabs, Tab, Stack, Typography } from "@mui/material";
import { FileQuestion, BookOpen, Youtube, ClipboardClock } from "lucide-react";

import TopicQuizGenerator from "./topic/TopicQuiz";
import FlashcardGenerator from "./flashcard/Flashcard";
import VideoQuizGenerator from "./video/VideoQuiz";
import QuizHistory from "./history/HIstory";
import QuizDetailModal from "./history/QuizDetailModal";

export default function QuizGeneratorPage() {
  const [tabValue, setTabValue] = useState(0);
  // const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  
  // 处理从 QuizHistory 传来的选中事件
  const handleSelectQuiz = (historyItem) => {
    setSelectedHistory(historyItem);
    setIsModalOpen(true); // 打开模态框
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHistory(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            📝 AI Penjana Kuiz & Kad Imbas
          </Typography>
          <Typography color="text.secondary">
            Jana kuiz, kad imbas dan kuiz video dengan bantuan AI
          </Typography>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          variant="fullWidth"
        >
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <FileQuestion size={16} /> Kuiz dari Topik
              </Stack>
            }
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <BookOpen size={16} /> Kad Imbas
              </Stack>
            }
          />
          {/* <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <Youtube size={16} /> Kuiz dari Video
              </Stack>
            }
          /> */}
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <ClipboardClock size={16} /> Sejarah Kuiz
              </Stack>
            }
          />
        </Tabs>

        {/* Panels */}
        {tabValue === 0 && <TopicQuizGenerator />}
        {tabValue === 1 && <FlashcardGenerator />}
        {/* {tabValue === 2 && <VideoQuizGenerator />} */}
        {tabValue === 2 && <QuizHistory onSelect={handleSelectQuiz} />}
      </Stack>
        {/* 4. 渲染模态框 */}
      {selectedHistory && (
        <QuizDetailModal
          historyItem={selectedHistory}
          open={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </Box>
  );
}

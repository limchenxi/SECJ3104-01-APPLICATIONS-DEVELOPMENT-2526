import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  useTheme,
  InputLabel,
  FormControl,
  Chip,
} from "@mui/material";
import { Bot, Sparkles, Download, Copy, CheckCircle2, FileQuestion, BookOpen, Youtube } from "lucide-react";
import { styled } from "@mui/material/styles";

// Styled Components for unique card styles
const GeneratorCard = styled(Card)(({ theme, color, bgcolor }) => ({
  position: "relative",
  overflow: "hidden",
  border: `1px solid ${color}`,
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    right: 0,
    width: "150px",
    height: "150px",
    background: `radial-gradient(circle, ${bgcolor} 20%, transparent 70%)`,
    borderRadius: "50%",
    filter: "blur(50px)",
    zIndex: 0,
  },
  "& .MuiCardHeader-root": {
    position: "relative",
    zIndex: 1,
  },
}));

// Mock Data
const sampleQuiz = [
  {
    question: "Apakah hasil daripada 15 × 12?",
    options: ["150", "180", "170", "160"],
    correct: 1,
  },
  {
    question: "Encik Ali membeli 24 kotak pensel. Setiap kotak mengandungi 12 batang pensel. Berapakah jumlah pensel yang dibeli?",
    options: ["288 batang", "268 batang", "298 batang", "278 batang"],
    correct: 0,
  },
  {
    question: "Jika 18 × 15 = 270, maka 270 ÷ 18 = ?",
    options: ["12", "15", "18", "20"],
    correct: 1,
  },
];

const sampleFlashcards = [
  { front: "Pendaraban", back: "Operasi matematik untuk mendarabkan dua nombor atau lebih" },
  { front: "Pembahagian", back: "Operasi matematik untuk membahagikan nombor kepada bahagian yang sama rata" },
  { front: "Grid Method", back: "Kaedah visual untuk mendarab nombor 2 digit menggunakan kotak grid" },
];

const FlashcardFlip = styled(Box)(({ theme }) => ({
  height: 192, // 48 * 4 (h-48)
  transition: "transform 0.5s",
  transformStyle: "preserve-3d",
  cursor: "pointer",
  position: "relative",
}));

// Helper for Tabs
function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`generator-tabpanel-${index}`}
      aria-labelledby={`generator-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export default function QuizFlashcardPage() {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0); // 0: Quiz, 1: Flashcards, 2: Video
  const [quizGenerated, setQuizGenerated] = useState(false);
  const [flashcardsGenerated, setFlashcardsGenerated] = useState(false);
  const [videoQuizGenerated, setVideoQuizGenerated] = useState(false);

  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [generatingVideoQuiz, setGeneratingVideoQuiz] = useState(false);

  const [copiedQuiz, setCopiedQuiz] = useState(false);
  const [copiedFlashcards, setCopiedFlashcards] = useState(false);
  const [copiedVideoQuiz, setCopiedVideoQuiz] = useState(false);

  const [quizData, setQuizData] = useState({
    subject: "",
    year: "",
    topic: "",
    numQuestions: "7",
    difficulty: "sederhana",
  });
  const [flashcardTopic, setFlashcardTopic] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [flashcardFlipStates, setFlashcardFlipStates] = useState(sampleFlashcards.map(() => false));

  // Handlers
  const handleGenerateQuiz = () => {
    setGeneratingQuiz(true);
    setTimeout(() => {
      setGeneratingQuiz(false);
      setQuizGenerated(true);
    }, 2000);
  };

  const handleGenerateFlashcards = () => {
    setGeneratingFlashcards(true);
    setTimeout(() => {
      setGeneratingFlashcards(false);
      setFlashcardsGenerated(true);
    }, 2000);
  };

  const handleGenerateVideoQuiz = () => {
    setGeneratingVideoQuiz(true);
    setTimeout(() => {
      setGeneratingVideoQuiz(false);
      setVideoQuizGenerated(true);
    }, 2500);
  };

  const handleCopy = (setter) => {
    // Implement actual copy logic here
    document.execCommand('copy'); 
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleFlip = (index) => {
    setFlashcardFlipStates(prev => prev.map((flip, i) => i === index ? !flip : flip));
  }

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 'xl', mx: 'auto' }}>
      <Stack spacing={4}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900], mb: 0.5 }}>
            📝 AI Penjana Kuiz & Kad Imbas
          </Typography>
          <Typography color="text.secondary">
            Jana kuiz dan kad imbas dengan bantuan kecerdasan buatan
          </Typography>
        </Box>

        {/* Tabs for different generators */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleChange} aria-label="generator tabs"
            indicatorColor="primary" textColor="primary"
            variant="fullWidth"
          >
            <Tab label={<Stack direction="row" alignItems="center" spacing={1}><FileQuestion size={16} />Kuiz dari Topik</Stack>} />
            <Tab label={<Stack direction="row" alignItems="center" spacing={1}><BookOpen size={16} />Kad Imbas</Stack>} />
            <Tab label={<Stack direction="row" alignItems="center" spacing={1}><Youtube size={16} />Kuiz dari Video</Stack>} />
          </Tabs>
        </Box>

        {/* Quiz Generator Tab Content */}
        <CustomTabPanel value={tabValue} index={0}>
          <Stack spacing={4}>
            <GeneratorCard color={theme.palette.secondary.main} bgcolor={theme.palette.secondary.light}>
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: theme.palette.secondary.main, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: theme.shadows[3] }}>
                    <FileQuestion size={24} style={{ color: theme.palette.common.white }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.grey[900], fontWeight: 'bold' }}>
                      📝 Penjana Kuiz AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jana soalan kuiz aneka pilihan secara automatik berdasarkan topik
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Mata Pelajaran</InputLabel>
                      <Select label="Mata Pelajaran" onChange={(e) => setQuizData({ ...quizData, subject: e.target.value })}>
                        <MenuItem value="matematik">Matematik</MenuItem>
                        <MenuItem value="sains">Sains</MenuItem>
                        <MenuItem value="bahasa-melayu">Bahasa Melayu</MenuItem>
                        <MenuItem value="english">Bahasa Inggeris</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tahun / Tingkatan</InputLabel>
                      <Select label="Tahun / Tingkatan" onChange={(e) => setQuizData({ ...quizData, year: e.target.value })}>
                        <MenuItem value="1">Tahun 1</MenuItem>
                        <MenuItem value="5">Tahun 5</MenuItem>
                        <MenuItem value="6">Tahun 6</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Topik / Unit" placeholder="Contoh: Pendaraban dan Pembahagian Nombor 2 Digit" size="small" value={quizData.topic} onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Bilangan Soalan</InputLabel>
                      <Select label="Bilangan Soalan" value={quizData.numQuestions} onChange={(e) => setQuizData({ ...quizData, numQuestions: e.target.value })}>
                        <MenuItem value="7">7 soalan</MenuItem>
                        <MenuItem value="10">10 soalan</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Tahap Kesukaran</InputLabel>
                      <Select label="Tahap Kesukaran" value={quizData.difficulty} onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}>
                        <MenuItem value="mudah">Mudah</MenuItem>
                        <MenuItem value="sederhana">Sederhana</MenuItem>
                        <MenuItem value="sukar">Sukar</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Button
                  onClick={handleGenerateQuiz}
                  disabled={generatingQuiz}
                  variant="contained"
                  size="large"
                  startIcon={generatingQuiz ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={20} />}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`,
                    "&:hover": {
                      background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.secondary.main} 90%)`,
                    },
                    boxShadow: theme.shadows[5],
                    py: 1.5,
                  }}
                >
                  {generatingQuiz ? "Menjana Kuiz..." : "🧠 Jana Kuiz"}
                </Button>
              </CardContent>
            </GeneratorCard>

            {/* Generated Quiz Results */}
            {quizGenerated && (
              <Card sx={{ border: `1px solid ${theme.palette.secondary.light}`, bgcolor: theme.palette.secondary.light + '40' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ width: 40, height: 40, bgcolor: theme.palette.secondary.light, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileQuestion size={20} style={{ color: theme.palette.secondary.main }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: theme.palette.secondary.dark }}>✅ Kuiz Telah Dijana</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sampleQuiz.length} soalan aneka pilihan telah dijana oleh AI
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleCopy(setCopiedQuiz)}
                        sx={{ borderColor: theme.palette.secondary.light, color: theme.palette.secondary.dark, "&:hover": { bgcolor: theme.palette.secondary.light + '40' } }}>
                        {copiedQuiz ? <CheckCircle2 size={16} style={{ marginRight: 4 }} /> : <Copy size={16} style={{ marginRight: 4 }} />}
                        {copiedQuiz ? "Disalin" : "Salin"}
                      </Button>
                      <Button variant="contained" size="small" sx={{ bgcolor: theme.palette.secondary.main, "&:hover": { bgcolor: theme.palette.secondary.dark } }}>
                        <Download size={16} style={{ marginRight: 4 }} />
                        Muat Turun PDF
                      </Button>
                    </Stack>
                  </Stack>

                  <Stack spacing={3} sx={{ bgcolor: theme.palette.common.white, p: 3, borderRadius: '8px', border: `1px solid ${theme.palette.grey[200]}` }}>
                    {sampleQuiz.map((question, index) => (
                      <Box key={index}>
                        <Stack direction="row" alignItems="flex-start" spacing={1} mb={1}>
                          <Chip label={index + 1} size="small" sx={{ bgcolor: theme.palette.secondary.main, color: theme.palette.common.white, fontWeight: 'bold' }} />
                          <Typography variant="body1" sx={{ color: theme.palette.grey[900], flexGrow: 1 }}>{question.question}</Typography>
                        </Stack>

                        <Grid container spacing={1} sx={{ pl: 4 }}>
                          {question.options.map((option, optIndex) => (
                            <Grid item xs={12} key={optIndex}>
                              <Box sx={{
                                p: 1.5,
                                borderRadius: '8px',
                                border: `1px solid ${optIndex === question.correct ? theme.palette.success.light : theme.palette.grey[300]}`,
                                bgcolor: optIndex === question.correct ? theme.palette.success.light : theme.palette.grey[50],
                              }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body2" color="text.primary">
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </Typography>
                                  {optIndex === question.correct && (
                                    <Chip label="✓ Jawapan" size="small" sx={{ bgcolor: theme.palette.success.main, color: theme.palette.common.white, fontWeight: 'bold' }} />
                                  )}
                                </Stack>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CustomTabPanel>

        {/* Flashcards Generator Tab Content */}
        <CustomTabPanel value={tabValue} index={1}>
          <Stack spacing={4}>
            <GeneratorCard color={theme.palette.success.main} bgcolor={theme.palette.success.light}>
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: theme.palette.success.main, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: theme.shadows[3] }}>
                    <BookOpen size={24} style={{ color: theme.palette.common.white }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.grey[900], fontWeight: 'bold' }}>
                      📚 Penjana Kad Imbas AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Jana kad imbas (flashcards) untuk membantu murid mengingati istilah dan konsep penting
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Topik atau Kata Kunci" placeholder="Contoh: Operasi Matematik Asas" size="small" value={flashcardTopic} onChange={(e) => setFlashcardTopic(e.target.value)} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Bilangan Kad</InputLabel>
                      <Select label="Bilangan Kad" defaultValue="8">
                        <MenuItem value="8">8 kad</MenuItem>
                        <MenuItem value="10">10 kad</MenuItem>
                        <MenuItem value="15">15 kad</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Button
                  onClick={handleGenerateFlashcards}
                  disabled={generatingFlashcards}
                  variant="contained"
                  size="large"
                  startIcon={generatingFlashcards ? <CircularProgress size={20} color="inherit" /> : <Sparkles size={20} />}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                    "&:hover": {
                      background: `linear-gradient(45deg, ${theme.palette.success.dark} 30%, ${theme.palette.success.main} 90%)`,
                    },
                    boxShadow: theme.shadows[5],
                    py: 1.5,
                  }}
                >
                  {generatingFlashcards ? "Menjana Kad Imbas..." : "✨ Jana Kad Imbas"}
                </Button>
              </CardContent>
            </GeneratorCard>

            {/* Generated Flashcards Results */}
            {flashcardsGenerated && (
              <Card sx={{ border: `1px solid ${theme.palette.success.light}`, bgcolor: theme.palette.success.light + '40' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ width: 40, height: 40, bgcolor: theme.palette.success.light, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={20} style={{ color: theme.palette.success.main }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: theme.palette.success.dark }}>✅ Kad Imbas Telah Dijana</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sampleFlashcards.length} kad imbas telah dijana oleh AI
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleCopy(setCopiedFlashcards)}
                        sx={{ borderColor: theme.palette.success.light, color: theme.palette.success.dark, "&:hover": { bgcolor: theme.palette.success.light + '40' } }}>
                        {copiedFlashcards ? <CheckCircle2 size={16} style={{ marginRight: 4 }} /> : <Copy size={16} style={{ marginRight: 4 }} />}
                        {copiedFlashcards ? "Disalin" : "Salin"}
                      </Button>
                      <Button variant="contained" size="small" sx={{ bgcolor: theme.palette.success.main, "&:hover": { bgcolor: theme.palette.success.dark } }}>
                        <Download size={16} style={{ marginRight: 4 }} />
                        Muat Turun PDF
                      </Button>
                    </Stack>
                  </Stack>

                  <Grid container spacing={3}>
                    {sampleFlashcards.map((card, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <FlashcardFlip onClick={() => handleFlip(index)} sx={{ transform: flashcardFlipStates[index] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
                          {/* Front of card */}
                          <Box sx={{
                            position: 'absolute', inset: 0,
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 30%, ${theme.palette.success.dark} 90%)`,
                            borderRadius: '12px', p: 3,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backfaceVisibility: 'hidden', // Hides the back side when facing away
                            boxShadow: theme.shadows[4]
                          }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Chip label={`Depan #${index + 1}`} size="small" sx={{ bgcolor: theme.palette.common.white + '30', color: theme.palette.common.white, mb: 1.5, fontWeight: 'bold' }} />
                              <Typography variant="h6" sx={{ color: theme.palette.common.white }}>{card.front}</Typography>
                            </Box>
                          </Box>

                          {/* Back of card */}
                          <Box sx={{
                            position: 'absolute', inset: 0,
                            bgcolor: theme.palette.common.white,
                            border: `2px solid ${theme.palette.success.main}`,
                            borderRadius: '12px', p: 3,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            backfaceVisibility: 'hidden', // Hides the back side when facing away
                            transform: 'rotateY(180deg)', // Initially rotated
                            boxShadow: theme.shadows[4]
                          }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Chip label={`Belakang #${index + 1}`} size="small" sx={{ bgcolor: theme.palette.success.light, color: theme.palette.success.dark, mb: 1.5, fontWeight: 'bold' }} />
                              <Typography variant="body1" color="text.primary">{card.back}</Typography>
                            </Box>
                          </Box>
                        </FlashcardFlip>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CustomTabPanel>

        {/* Video Quiz Generator Tab Content */}
        <CustomTabPanel value={tabValue} index={2}>
          <Stack spacing={4}>
            <GeneratorCard color={theme.palette.error.main} bgcolor={theme.palette.error.light}>
              <CardContent sx={{ position: 'relative', zIndex: 1, p: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
                  <Box sx={{ width: 48, height: 48, bgcolor: theme.palette.error.main, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: theme.shadows[3] }}>
                    <Youtube size={24} style={{ color: theme.palette.common.white }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" sx={{ color: theme.palette.grey[900], fontWeight: 'bold' }}>
                      ▶️ Penjana Kuiz dari Video YouTube
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      AI akan menganalisis video YouTube dan menjana soalan kuiz berdasarkan kandungan video
                    </Typography>
                  </Box>
                </Stack>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12}>
                    <TextField fullWidth label="Pautan YouTube (URL)" placeholder="https://www.youtube.com/watch?v=..." size="small" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)}
                      helperText="💡 Pastikan video berkaitan dengan topik pengajaran untuk hasil terbaik"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Bilangan Soalan</InputLabel>
                      <Select label="Bilangan Soalan" defaultValue="6">
                        <MenuItem value="5">5 soalan</MenuItem>
                        <MenuItem value="6">6 soalan</MenuItem>
                        <MenuItem value="8">8 soalan</MenuItem>
                        <MenuItem value="10">10 soalan</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Button
                  onClick={handleGenerateVideoQuiz}
                  disabled={generatingVideoQuiz}
                  variant="contained"
                  size="large"
                  startIcon={generatingVideoQuiz ? <CircularProgress size={20} color="inherit" /> : <Bot size={20} />}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.error.main} 30%, ${theme.palette.error.dark} 90%)`,
                    "&:hover": {
                      background: `linear-gradient(45deg, ${theme.palette.error.dark} 30%, ${theme.palette.error.main} 90%)`,
                    },
                    boxShadow: theme.shadows[5],
                    py: 1.5,
                  }}
                >
                  {generatingVideoQuiz ? "Menganalisis Video..." : "🤖 Jana Kuiz dari Video"}
                </Button>
              </CardContent>
            </GeneratorCard>

            {/* Generated Video Quiz Results */}
            {videoQuizGenerated && (
              <Card sx={{ border: `1px solid ${theme.palette.error.light}`, bgcolor: theme.palette.error.light + '40' }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ width: 40, height: 40, bgcolor: theme.palette.error.light, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Youtube size={20} style={{ color: theme.palette.error.main }} />
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ color: theme.palette.error.dark }}>✅ Kuiz Video Telah Dijana</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Kuiz berdasarkan kandungan video telah dijana oleh AI
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                      <Button variant="outlined" size="small" onClick={() => handleCopy(setCopiedVideoQuiz)}
                        sx={{ borderColor: theme.palette.error.light, color: theme.palette.error.dark, "&:hover": { bgcolor: theme.palette.error.light + '40' } }}>
                        {copiedVideoQuiz ? <CheckCircle2 size={16} style={{ marginRight: 4 }} /> : <Copy size={16} style={{ marginRight: 4 }} />}
                        {copiedVideoQuiz ? "Disalin" : "Salin"}
                      </Button>
                      <Button variant="contained" size="small" sx={{ bgcolor: theme.palette.error.main, "&:hover": { bgcolor: theme.palette.error.dark } }}>
                        <Download size={16} style={{ marginRight: 4 }} />
                        Muat Turun PDF
                      </Button>
                    </Stack>
                  </Stack>

                  <Stack spacing={3} sx={{ bgcolor: theme.palette.common.white, p: 3, borderRadius: '8px', border: `1px solid ${theme.palette.grey[200]}` }}>
                    {sampleQuiz.slice(0, 6).map((question, index) => (
                      <Box key={index}>
                        <Stack direction="row" alignItems="flex-start" spacing={1} mb={1}>
                          <Chip label={index + 1} size="small" sx={{ bgcolor: theme.palette.error.main, color: theme.palette.common.white, fontWeight: 'bold' }} />
                          <Typography variant="body1" sx={{ color: theme.palette.grey[900], flexGrow: 1 }}>{question.question}</Typography>
                        </Stack>

                        <Grid container spacing={1} sx={{ pl: 4 }}>
                          {question.options.map((option, optIndex) => (
                            <Grid item xs={12} key={optIndex}>
                              <Box sx={{
                                p: 1.5,
                                borderRadius: '8px',
                                border: `1px solid ${optIndex === question.correct ? theme.palette.success.light : theme.palette.grey[300]}`,
                                bgcolor: optIndex === question.correct ? theme.palette.success.light : theme.palette.grey[50],
                              }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                  <Typography variant="body2" color="text.primary">
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                  </Typography>
                                  {optIndex === question.correct && (
                                    <Chip label="✓ Jawapan" size="small" sx={{ bgcolor: theme.palette.success.main, color: theme.palette.common.white, fontWeight: 'bold' }} />
                                  )}
                                </Stack>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CustomTabPanel>
      </Stack>
    </Box>
  );
}

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  Stack,
  InputLabel,
  FormControl,
  useTheme,
  Grid,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  Bot,
  Sparkles,
  Download,
  Copy,
  FileText,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";

// 模拟的 AI 生成结果
const sampleRPH = {
  title: "Rancangan Pengajaran Harian - Matematik Tahun 5",
  date: "24 Oktober 2025",
  duration: "60 minit",
  sections: [
    {
      title: "Standard Kandungan",
      content: "5.1 Operasi Asas - Pendaraban dan Pembahagian",
    },
    {
      title: "Standard Pembelajaran",
      content: "5.1.1 Memahami konsep pendaraban dan pembahagian nombor bulat",
    },
    {
      title: "Objektif Pembelajaran",
      content: "Pada akhir pembelajaran, murid dapat:\n• Mendarab nombor 2 digit dengan 2 digit\n• Menyelesaikan masalah berayat melibatkan pendaraban\n• Mengaplikasikan strategi pendaraban dalam kehidupan harian",
    },
    {
      title: "Set Induksi (5 minit)",
      content: "• Tunjukkan video pendek tentang penggunaan pendaraban dalam kehidupan harian\n• Soal jawab tentang situasi yang memerlukan pendaraban\n• Menarik minat murid dengan contoh aplikasi dalam kehidupan sebenar",
    },
    {
      title: "Langkah Pengajaran - Pembangunan (35 minit)",
      content: "Langkah 1 (15 minit):\n• Terangkan konsep pendaraban 2 digit x 2 digit menggunakan grid method\n• Demonstrasi contoh: 23 x 14\n• Murid mencatat dalam buku nota\n\nLangkah 2 (20 minit):\n• Aktiviti kumpulan: Selesaikan masalah berayat\n• Murid bekerja dalam kumpulan untuk menyelesaikan 3 masalah\n• Guru memantau dan membimbing setiap kumpulan",
    },
    {
      title: "Penutup (20 minit)",
      content: "• Pembentangan hasil kerja kumpulan (10 minit)\n• Perbincangan strategi yang digunakan (5 minit)\n• Rumusan pembelajaran dan refleksi murid (5 minit)\n• Guru memberikan penguatan positif",
    },
    {
      title: "Bahan Bantu Mengajar",
      content: "• Papan putih dan pen marker\n• Kad aktiviti pendaraban\n• Video pembelajaran (projector)\n• Lembaran kerja kumpulan\n• Grid method chart",
    },
    {
      title: "Penilaian & Refleksi",
      content: "Penilaian:\n• Penilaian formatif melalui soal jawab\n• Pemerhatian semasa aktiviti kumpulan\n• Lembaran kerja individu\n\nRefleksi:\n• Adakah objektif pembelajaran tercapai?\n• Tahap penglibatan murid\n• Keberkesanan kaedah pengajaran\n• Penambahbaikan untuk sesi akan datang",
    },
  ],
};

// --- MAIN COMPONENT ---
export default function RPHGeneratorPage() { // Changed to default export for stability
  const theme = useTheme();
  const [rphGenerated, setRphGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    year: "",
    objectives: "",
    duration: "",
    materials: "",
  });

  const handleGenerate = () => {
    // Basic validation check
    if (!formData.subject || !formData.topic || !formData.year || !formData.objectives) {
        console.error("Please fill in required fields.");
        return;
    }

    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGenerating(false);
      setRphGenerated(true);
    }, 2000);
  };

  const handleCopy = () => {
    // In a real app, copy sampleRPH content to clipboard
    // Using document.execCommand('copy') for better iframe compatibility
    try {
        const textToCopy = sampleRPH.sections.map(s => `${s.title}:\n${s.content}`).join('\n\n');
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleChange = (name) => (event) => {
    setFormData({ ...formData, [name]: event.target.value });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 'xl', mx: 'auto' }}>
      <Stack spacing={4}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900], mb: 0.5 }}>
            eRPH - Penjana Rancangan Pengajaran
          </Typography>
          <Typography color="text.secondary">
            Jana Rancangan Pengajaran Harian (RPH) dengan bantuan kecerdasan buatan
          </Typography>
        </Box>

        {/* AI RPH Generator Section */}
        <Card raised sx={{
          border: `1px solid ${theme.palette.info.light}`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            width: 256,
            height: 256,
            background: `radial-gradient(circle at 100% 0%, ${theme.palette.info.light} 0%, transparent 70%)`,
            opacity: 0.5,
            zIndex: 0,
            filter: 'blur(40px)',
          }
        }}>
          <CardHeader sx={{ position: 'relative', zIndex: 1 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{
                width: 48,
                height: 48,
                background: `linear-gradient(to bottom right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                borderRadius: theme.shape.borderRadius,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: theme.shadows[3],
              }}>
                <Bot size={24} style={{ color: 'white' }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: theme.palette.grey[900], fontWeight: 'bold' }}>
                  🧠 AI Penjana RPH
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Masukkan maklumat pengajaran dan biarkan AI menjana RPH yang lengkap untuk anda
                </Typography>
              </Box>
            </Stack>
          </CardHeader>

          <CardContent sx={{ position: 'relative', zIndex: 1 }}>
            <Stack spacing={3} mb={3}>
              <Grid container spacing={2}>
                {/* Mata Pelajaran */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="subject-label">Mata Pelajaran</InputLabel>
                    <Select
                      labelId="subject-label"
                      value={formData.subject}
                      label="Mata Pelajaran"
                      onChange={handleChange('subject')}
                    >
                      <MenuItem value="matematik">Matematik</MenuItem>
                      <MenuItem value="sains">Sains</MenuItem>
                      <MenuItem value="bahasa-melayu">Bahasa Melayu</MenuItem>
                      <MenuItem value="english">Bahasa Inggeris</MenuItem>
                      <MenuItem value="sejarah">Sejarah</MenuItem>
                      <MenuItem value="pendidikan-islam">Pendidikan Islam</MenuItem>
                      <MenuItem value="pendidikan-moral">Pendidikan Moral</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Tahun / Tingkatan */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="year-label">Tahun / Tingkatan</InputLabel>
                    <Select
                      labelId="year-label"
                      value={formData.year}
                      label="Tahun / Tingkatan"
                      onChange={handleChange('year')}
                    >
                      <MenuItem value="1">Tahun 1</MenuItem>
                      <MenuItem value="2">Tahun 2</MenuItem>
                      <MenuItem value="3">Tahun 3</MenuItem>
                      <MenuItem value="4">Tahun 4</MenuItem>
                      <MenuItem value="5">Tahun 5</MenuItem>
                      <MenuItem value="6">Tahun 6</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Topik / Unit */}
              <TextField
                label="Topik / Unit"
                placeholder="Contoh: Pendaraban dan Pembahagian"
                value={formData.topic}
                onChange={handleChange('topic')}
                fullWidth
                size="small"
              />

              {/* Objektif Pembelajaran */}
              <TextField
                label="Objektif Pembelajaran"
                placeholder="Nyatakan objektif pembelajaran yang ingin dicapai..."
                value={formData.objectives}
                onChange={handleChange('objectives')}
                fullWidth
                multiline
                rows={4}
                sx={{ minHeight: '96px' }}
              />

              <Grid container spacing={2}>
                {/* Tempoh Masa */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Tempoh Masa"
                    placeholder="Contoh: 60 minit"
                    value={formData.duration}
                    onChange={handleChange('duration')}
                    fullWidth
                    size="small"
                  />
                </Grid>

                {/* Bahan Bantu Mengajar */}
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Bahan Bantu Mengajar (Pilihan)"
                    placeholder="Contoh: Papan putih, kad aktiviti"
                    value={formData.materials}
                    onChange={handleChange('materials')}
                    fullWidth
                    size="small"
                  />
                </Grid>
              </Grid>
            </Stack>

            <Button
              onClick={handleGenerate}
              disabled={generating}
              variant="contained"
              size="large"
              sx={{
                background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                '&:hover': { background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` },
                color: 'white',
                boxShadow: theme.shadows[5],
                transition: 'all 0.3s ease-in-out',
                mt: 1,
                minWidth: 200,
              }}
            >
              {generating ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <Typography>Menjana RPH...</Typography>
                </Stack>
              ) : (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Sparkles size={20} />
                  <Typography>🧠 Jana RPH</Typography>
                </Stack>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated RPH Results */}
        {rphGenerated && (
          <Card raised sx={{
            border: `1px solid ${theme.palette.success.light}`,
            background: `linear-gradient(to right, ${theme.palette.success.light}33, ${theme.palette.common.white} 100%)`,
          }}>
            <CardHeader sx={{ pb: 1 }}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
                spacing={2}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    bgcolor: theme.palette.success.light,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FileText size={20} style={{ color: theme.palette.success.main }} />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: theme.palette.success.dark, fontWeight: 'bold' }}>
                      ✅ RPH Telah Dijana
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rancangan pengajaran anda telah berjaya dijana oleh AI
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleCopy}
                    sx={{
                      borderColor: theme.palette.success.light,
                      color: theme.palette.success.main,
                      '&:hover': { bgcolor: theme.palette.success.light },
                    }}
                  >
                    {copied ? (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CheckCircle2 size={16} />
                        <Typography variant="button">Disalin</Typography>
                      </Stack>
                    ) : (
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Copy size={16} />
                        <Typography variant="button">Salin</Typography>
                      </Stack>
                    )}
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{
                      bgcolor: theme.palette.success.main,
                      '&:hover': { bgcolor: theme.palette.success.dark },
                    }}
                    startIcon={<Download size={16} />}
                  >
                    Muat Turun PDF
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setRphGenerated(false)}
                    sx={{
                      borderColor: theme.palette.info.light,
                      color: theme.palette.info.main,
                      '&:hover': { bgcolor: theme.palette.info.light },
                    }}
                    startIcon={<Sparkles size={16} />}
                  >
                    Jana Semula
                  </Button>
                </Stack>
              </Stack>
            </CardHeader>

            <CardContent>
              <Box sx={{ bgcolor: theme.palette.common.white, borderRadius: theme.shape.borderRadius, p: 3, border: `1px solid ${theme.palette.grey[200]}` }}>
                {/* RPH Header */}
                <Box sx={{ borderBottom: `1px solid ${theme.palette.grey[300]}`, pb: 2, mb: 3 }}>
                  <Typography variant="h5" sx={{ color: theme.palette.grey[900], mb: 1, fontWeight: 'bold' }}>
                    {sampleRPH.title}
                  </Typography>
                  <Stack direction="row" spacing={3} alignItems="center" sx={{ fontSize: 14 }}>
                    <Chip
                      label={sampleRPH.date}
                      size="small"
                      sx={{
                        bgcolor: theme.palette.info.light,
                        color: theme.palette.info.dark,
                        borderColor: theme.palette.info.main,
                      }}
                    />
                    <Stack direction="row" alignItems="center" spacing={1} color="text.secondary">
                      <Clock size={16} style={{ color: theme.palette.info.main }} />
                      <Typography variant="body2">{sampleRPH.duration}</Typography>
                    </Stack>
                  </Stack>
                </Box>

                {/* RPH Sections */}
                <Stack spacing={3}>
                  {sampleRPH.sections.map((section, index) => (
                    <Box key={index}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Target size={16} style={{ color: theme.palette.primary.main }} />
                        <Typography variant="h6" sx={{ color: theme.palette.grey[900], fontSize: '1rem', fontWeight: 'bold' }}>
                          {section.title}
                        </Typography>
                      </Stack>
                      <Box sx={{ bgcolor: theme.palette.grey[50], borderRadius: theme.shape.borderRadius, p: 2, ml: 3 }}>
                        <Typography variant="body2" sx={{ color: theme.palette.grey[700], whiteSpace: 'pre-line' }}>
                          {section.content}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Box>
  );
}

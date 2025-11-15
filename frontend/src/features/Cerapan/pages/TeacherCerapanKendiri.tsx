import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  useTheme,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Calendar, BookOpen, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { startSelfEvaluation, getMyTasks } from "../api/cerapanService";
import { getTemplates } from "../../Pentadbir/api/templateService";
import { userApi } from "../../Users/api";
import type { CerapanRecord } from "../type";
import type { TemplateRubric } from "../../Pentadbir/type";
import useAuth from "../../../hooks/useAuth";

// Subjects & Classes will be loaded from API based on logged-in teacher assignments

export default function TeacherCerapanKendiri() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingTasks, setPendingTasks] = useState<CerapanRecord[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [tapakTemplate, setTapakTemplate] = useState<TemplateRubric | null>(null);
  const [tapakTemplateLoading, setTapakTemplateLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);

  // Current evaluation period - you can fetch this from backend
  const currentPeriod = {
    name: "Semester 1, 2025",
    deadline: "31 Mac 2025",
    status: "active", // active, completed
  };

  // Fetch pending tasks and assignments on load
  useEffect(() => {
    loadPendingTasks();
    loadAssignments();
    loadTapakTemplate();
  }, []);

  const loadTapakTemplate = async () => {
    try {
      setTapakTemplateLoading(true);
      const templates = await getTemplates();
      const tapak = templates.find(t => t.name.includes("TAPAK STANDARD 4") || t.name.includes("TAPAK"));
      if (tapak) {
        setTapakTemplate(tapak);
      }
    } catch (err) {
      console.error("Error loading TAPAK template:", err);
    } finally {
      setTapakTemplateLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoadingAssignments(true);
      const data = await userApi.getMyAssignments();
      setSubjects(data.subjects);
      setClasses(data.classes);
    } catch (err) {
      console.error("Error loading assignments", err);
      setError("Gagal memuat senarai mata pelajaran dan kelas.");
    } finally {
      setLoadingAssignments(false);
    }
  };

  const loadPendingTasks = async () => {
    try {
      setLoadingTasks(true);
      const tasks = await getMyTasks();
      setPendingTasks(tasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleStartEvaluation = () => {
    setOpenDialog(true);
    setError("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSubject("");
    setSelectedClass("");
    setError("");
  };

  const handleSubmitSelection = async () => {
    if (!selectedSubject || !selectedClass) {
      setError("Sila pilih Mata Pelajaran dan Kelas");
      return;
    }

    if (!user?.id) {
      setError("User tidak dijumpai. Sila log masuk semula.");
      return;
    }

    // Ensure template loaded
    if (tapakTemplateLoading) {
      setError("Sedang memuat template TAPAK. Sila tunggu sebentar.");
      return;
    }
    if (!tapakTemplate) {
      // Attempt a refetch once (silent)
      try {
        await loadTapakTemplate();
      } catch (e) {
        /* ignore */
      }
      if (!tapakTemplate) {
        setError("Template TAPAK tidak dijumpai. Sila hubungi pentadbir untuk mencipta atau aktifkan template.");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");
      
      const templateId = tapakTemplate.id;

      const payload = {
        templateId: templateId,
        period: currentPeriod.name,
        subject: selectedSubject,
        class: selectedClass,
      };

      const newEvaluation = await startSelfEvaluation(payload);
      
      // Navigate to the evaluation form
      navigate(`/cerapan/task/${newEvaluation._id}`);
    } catch (err: any) {
      console.error("Error starting evaluation:", err);
      setError(err.response?.data?.message || "Gagal memulakan penilaian. Sila cuba lagi.");
      setLoading(false);
    }
  };

  const handleContinueTask = (taskId: string) => {
    navigate(`/cerapan/task/${taskId}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" component="h1" sx={{ color: theme.palette.grey[900], mb: 0.5 }}>
            Cerapan Guru – Penilaian Kendiri
          </Typography>
          <Typography color="text.secondary">
            Sistem penilaian prestasi dan pembangunan profesional guru
          </Typography>
        </Box>

        {/* Evaluation Period Card */}
        <Card
          raised
          sx={{
            border: `1px solid ${theme.palette.info.light}`,
            background: `linear-gradient(to right, ${theme.palette.info.light} 5%, ${theme.palette.common.white} 100%)`,
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                  <Typography variant="h6" sx={{ color: theme.palette.grey[900] }}>
                    Tempoh Penilaian Semasa
                  </Typography>
                  <Chip
                    label={pendingTasks.length > 0 ? "Belum Selesai" : "Selesai"}
                    sx={{
                      bgcolor: pendingTasks.length > 0 ? theme.palette.warning.main : theme.palette.success.main,
                      color: theme.palette.common.white,
                      fontWeight: "bold",
                    }}
                    size="small"
                  />
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                  <Calendar size={18} style={{ color: theme.palette.info.main }} />
                  <Typography sx={{ color: theme.palette.grey[800] }}>
                    {currentPeriod.name}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.disabled">
                  Tarikh Akhir: {currentPeriod.deadline}
                </Typography>
              </Box>

              <Button
                onClick={handleStartEvaluation}
                variant="contained"
                size="large"
                sx={{
                  bgcolor: theme.palette.info.main,
                  "&:hover": { bgcolor: theme.palette.info.dark },
                  px: 4,
                  py: 1.5,
                }}
              >
                Mula Penilaian Kendiri
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Pending Tasks Section */}
        {loadingTasks ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : pendingTasks.length > 0 ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.grey[900] }}>
              Penilaian Belum Selesai
            </Typography>
            <Stack spacing={2}>
              {pendingTasks.map((task) => (
                <Card key={task._id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                          <BookOpen size={18} style={{ color: theme.palette.primary.main }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {task.subject}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                          <Users size={16} style={{ color: theme.palette.grey[600] }} />
                          <Typography variant="body2" color="text.secondary">
                            Kelas: {task.class}
                          </Typography>
                        </Stack>
                        <Typography variant="body2" color="text.disabled">
                          Tempoh: {task.period}
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        onClick={() => handleContinueTask(task._id)}
                      >
                        Sambung
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Stack>

      {/* Subject and Class Selection Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Pilih Mata Pelajaran dan Kelas</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            {tapakTemplateLoading && (
              <Alert severity="info">Memuat template TAPAK...</Alert>
            )}
            {!tapakTemplateLoading && !tapakTemplate && (
              <Alert severity="warning">
                Template TAPAK tidak ditemui. Sila hubungi pentadbir untuk menambah template rubrik TAPAK STANDARD 4.
              </Alert>
            )}
            {!tapakTemplateLoading && tapakTemplate && (
              <Alert severity="success">
                Template dipilih: <strong>{tapakTemplate.name}</strong> ({tapakTemplate.categories.reduce((c, cat) => c + cat.subCategories.reduce((s, sub) => s + sub.items.length, 0), 0)} item)
              </Alert>
            )}
            {loadingAssignments && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={32} />
              </Box>
            )}
            {!loadingAssignments && subjects.length === 0 && (
              <Alert severity="warning">
                Tiada mata pelajaran ditetapkan kepada anda. Sila hubungi pentadbir.
              </Alert>
            )}
            
            <TextField
              select
              label="Mata Pelajaran"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              fullWidth
              required
              disabled={loadingAssignments || subjects.length === 0}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject} value={subject}>
                  {subject}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Kelas"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              fullWidth
              required
              disabled={loadingAssignments || classes.length === 0}
            >
              {classes.map((kelas) => (
                <MenuItem key={kelas} value={kelas}>
                  {kelas}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseDialog} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmitSelection}
            variant="contained"
            disabled={loading || !selectedSubject || !selectedClass || loadingAssignments || tapakTemplateLoading || !tapakTemplate}
          >
            {loading ? <CircularProgress size={24} /> : "Teruskan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

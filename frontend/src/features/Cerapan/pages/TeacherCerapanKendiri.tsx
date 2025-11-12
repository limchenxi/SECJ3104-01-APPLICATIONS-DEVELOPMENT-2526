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
import { startEvaluation, getMyTasks } from "../api/cerapanService";
import type { CerapanRecord } from "../type";
import useAuth from "../../../hooks/useAuth";

// Mock data - replace with API call to get available templates/rubrics
const availableSubjects = [
  "Bahasa Melayu",
  "Bahasa Inggeris",
  "Matematik",
  "Sains",
  "Sejarah",
  "Pendidikan Islam",
  "Pendidikan Jasmani",
];

const availableClasses = [
  "1 Amanah",
  "1 Bestari",
  "2 Amanah",
  "2 Bestari",
  "3 Amanah",
  "3 Bestari",
  "4 Amanah",
  "4 Bestari",
  "5 Amanah",
  "5 Bestari",
  "6 Amanah",
  "6 Bestari",
];

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

  // Current evaluation period - you can fetch this from backend
  const currentPeriod = {
    name: "Semester 1, 2025",
    deadline: "31 Mac 2025",
    status: "active", // active, completed
  };

  // Fetch pending tasks on load
  useEffect(() => {
    loadPendingTasks();
  }, []);

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

    try {
      setLoading(true);
      setError("");

      // Real template ID for TAPAK STANDARD 4 PdPc rubric
      const templateId = "690e1a9d52fa9b68a451a9f8";

      const payload = {
        teacherId: user.id,
        templateId: templateId,
        period: currentPeriod.name,
        subject: selectedSubject,
        class: selectedClass,
      };

      const newEvaluation = await startEvaluation(payload);
      
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
            
            <TextField
              select
              label="Mata Pelajaran"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              fullWidth
              required
            >
              {availableSubjects.map((subject) => (
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
            >
              {availableClasses.map((kelas) => (
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
            disabled={loading || !selectedSubject || !selectedClass}
          >
            {loading ? <CircularProgress size={24} /> : "Teruskan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useEffect, useMemo, useState } from "react";
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
  Divider,
  IconButton,
} from "@mui/material";
import { Calendar, BookOpen, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { startSelfEvaluation, getMyTasks } from "../api/cerapanService";
import { getTemplates } from "../../Pentadbir/api/templateService";
import { TeachingAssignmentAPI } from "../../TeachingAssignment/api";
import type { AvailableCerapanAssignment } from "../../TeachingAssignment/api";
import type { CerapanRecord } from "../type";
import type { TemplateRubric } from "../../Pentadbir/type";
import useAuth from "../../../hooks/useAuth";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';


export default function TeacherCerapanKendiri() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Add missing currentPeriod definition
  const currentPeriod = useMemo(
    () => ({ name: "Semester 1, 2025", deadline: "31 Mac 2025", status: "active" }),
    []
  );

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [assignments, setAssignments] = useState<AvailableCerapanAssignment[]>([]);
  const [pendingTasks, setPendingTasks] = useState<CerapanRecord[]>([]);
  const [tapakTemplate, setTapakTemplate] = useState<TemplateRubric | null>(null);
  const [error, setError] = useState<string | null>(null);

  // dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");

  // Derived options
  const subjects = useMemo(
    () => [...new Set(assignments.map((a) => a.subject))].sort(),
    [assignments]
  );

  const classesForSelectedSubject = useMemo(
    () =>
      assignments
        .filter((a) => a.subject === selectedSubject)
        .map((a) => a.class),
    [assignments, selectedSubject]
  );

  const unstartedAssignments = useMemo(() => {
    if (assignments.length === 0) return [];
    const existingKeys = new Set(pendingTasks.map(t => `${t.subject}_${t.class}`));
    return assignments.filter(assignment => {
        const key = `${assignment.subject}_${assignment.class}`;
        return !existingKeys.has(key);
    });
    
  }, [assignments, pendingTasks]);

  // Load templates, assignments, tasks
  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      setLoading(true);
      try {
        const [templates, assignmentList, myTasks] = await Promise.all([
          getTemplates().catch(() => []),
          TeachingAssignmentAPI.getAvailableForCerapan(currentPeriod.name).catch(() => []),
          getMyTasks().catch(() => []),
        ]);

        if (!mounted) return;

        const foundTapak =
          templates?.find((t: TemplateRubric) =>
            (t.name || "").toUpperCase().includes("TAPAK")
          ) ?? null;

        setTapakTemplate(foundTapak);
        setAssignments(assignmentList || []);
        setPendingTasks(myTasks || []);
      } catch {
        setError("Gagal memuat data. Sila cuba lagi.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAll();
    return () => {
      mounted = false;
    };
  }, [currentPeriod.name]);

  // Dialog handlers
  const openSelection = () => {
    setSelectedSubject("");
    setSelectedClass("");
    setError(null);
    setDialogOpen(true);
  };
  const closeSelection = () => {
    setDialogOpen(false);
    setError(null);
  };

  // Start evaluation
  const handleStart = async () => {
    if (!selectedSubject || !selectedClass)
      return setError("Sila pilih mata pelajaran dan kelas.");

    const exists = assignments.some(
      (a) => a.subject === selectedSubject && a.class === selectedClass
    );
    if (!exists) return setError("Kombinasi ini tidak tersedia atau sudah dinilai.");

    if (!user?.id) return setError("Sila log masuk semula.");
    if (!tapakTemplate) return setError("Template TAPAK tidak dijumpai.");

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        templateId: tapakTemplate.id,
        period: currentPeriod.name,
        subject: selectedSubject,
        class: selectedClass,
      };

      const newTask = await startSelfEvaluation(payload);
      navigate(`/cerapan/task/${newTask._id}`);
    } catch (e: any) {
      if (e?.response?.status === 400 && e?.response?.data?.message)
        setError(e.response.data.message);
      else setError("Gagal memulakan penilaian.");

      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ maxWidth: "xl", mx: "auto", p: { xs: 2, md: 4 } }}>
      <Stack spacing={4}>
        {/* Header */}
          <Box>
            <Typography variant="h4" sx={{ mb: 0.5 }}>
              <ReceiptLongIcon color="primary" fontSize="large"/> Cerapan Guru — Penilaian Kendiri
            </Typography>
            <Typography color="text.secondary">
              Penilaian prestasi & pembangunan profesional
            </Typography>
          </Box>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2, mb: -2 }}>
            <Button
                variant="contained" // 使用 contained 样式更显眼
                color="primary"
                onClick={() => navigate('/cerapan/my-reports')} // 跳转到 TeacherReportHistory 页面
                startIcon={<BookOpen size={18} />}
            >
                Lihat Sejarah Laporan
            </Button>
          </Stack>

        {/* Period card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            background: "transparent",
          }}
        >
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              alignItems="center"
              justifyContent="space-between"
              spacing={2}
            >
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Tempoh Penilaian
                  </Typography>
                  <Chip
                    label={pendingTasks.length > 0 ? "Belum Selesai" : "Selesai"}
                    size="small"
                    sx={{
                      bgcolor: pendingTasks.length > 0
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Calendar size={16} />
                  <Typography variant="body2" color="text.secondary">
                    {currentPeriod.name} • Tarikh Akhir: {currentPeriod.deadline}
                  </Typography>
                </Stack>
              </Stack>

              <Button
                variant="contained"
                onClick={openSelection}
                sx={{
                  px: 3,
                  bgcolor: theme.palette.common.white,
                  color: theme.palette.text.primary,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                    bgcolor: theme.palette.grey[50],
                  },
                }}
              >
                Mula Penilaian Kendiri
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Divider />

        {/* Pending tasks */}
        {(pendingTasks.length > 0 || unstartedAssignments.length > 0) ? (
          <Stack spacing={4}>
            {/* <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Penilaian Belum Selesai
            </Typography> */}

            {/* 1. 正在进行的任务 (Pending tasks) */}
                {pendingTasks.length > 0 && (
                    <Stack spacing={2}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Penilaian Belum Selesai ({pendingTasks.length})
                        </Typography>
                        {pendingTasks.map((t) => (
                            <Card key={t._id} variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack spacing={0.5}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <BookOpen size={16} />
                                                <Typography sx={{ fontWeight: 600 }}>{t.subject}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Users size={14} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Kelas: {t.class} • Tempoh: {t.period}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Button variant="outlined" onClick={() => navigate(`/cerapan/task/${t._id}`)}>
                                            Sambung
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}

                {/* 2. 待开始的新任务 (Unstarted assignments) */}
                {unstartedAssignments.length > 0 && (
                    <Stack spacing={2}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mt: 3, color: theme.palette.info.main }}>
                            Sedia Untuk Mula Penilaian ({unstartedAssignments.length})
                        </Typography>
                        {unstartedAssignments.map((assignment, index) => (
                            <Card key={index} variant="outlined" sx={{ borderRadius: 2, bgcolor: theme.palette.info.light + '10' }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Stack spacing={0.5}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <BookOpen size={16} style={{ color: theme.palette.info.main }} />
                                                <Typography sx={{ fontWeight: 600, color: theme.palette.info.dark }}>{assignment.subject}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Users size={14} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Kelas: {assignment.class} • Tempoh: {currentPeriod.name}
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                        <Button 
                                            variant="outlined" 
                                            size="small"
                                            onClick={() => {
                                                setSelectedSubject(assignment.subject);
                                                setSelectedClass(assignment.class);
                                                setError(null);
                                                setDialogOpen(true);
                                            }}
                                        >
                                            Mula Sekarang
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Stack>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              Tiada penilaian kendiri yang perlu diselesaikan. Tahniah!
            </Typography>
          </>
        )}     

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={closeSelection} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          Pilih Mata Pelajaran & Kelas
          <IconButton size="small" onClick={closeSelection}>
            <X size={14} />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {!tapakTemplate ? (
              <Alert severity="warning">
                Template TAPAK tidak ditemui. Hubungi pentadbir jika anda perlu mula penilaian.
              </Alert>
            ) : (
              <Alert severity="info">
                Template: <strong>{tapakTemplate.name}</strong>
              </Alert>
            )}

            {/* Subject */}
            <TextField
              select
              label="Mata Pelajaran"
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setSelectedClass("");
              }}
              fullWidth
            >
              {subjects.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            {/* Class */}
            <TextField
              select
              label="Kelas"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              fullWidth
              disabled={!selectedSubject}
            >
              {classesForSelectedSubject.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <Typography variant="caption" color="text.secondary">
              Pilih kombinasi mata pelajaran dan kelas yang ingin anda nilai sendiri.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeSelection}>Batal</Button>
          <Button
            variant="contained"
            onClick={handleStart}
            disabled={submitting || !selectedSubject || !selectedClass || !tapakTemplate}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? "Memproses..." : "Teruskan"}
          </Button>
        </DialogActions>
      </Dialog>
      </Stack>
    </Box>
  );
}

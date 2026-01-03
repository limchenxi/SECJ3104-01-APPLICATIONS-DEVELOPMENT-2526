import { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";

import { Edit, Trash2, Plus } from "lucide-react";
// import { motion } from "framer-motion";

import {
  TeachingAssignmentAPI,
  type TeachingAssignment,
  type CreateTeachingAssignmentPayload,
} from "../api";

import { userApi } from "../../Users/api";
import { School } from "@mui/icons-material";
import type { UserItem } from "../../Users/type";

// ---------------------------------------------------------------
// Clean, organized subjects list
// ---------------------------------------------------------------
const subjects = [
  "Matematik",
  "Sains",
  "Bahasa Melayu",
  "Bahasa Inggeris",
  "Sejarah",
  "Geografi",
  "Pendidikan Islam",
  "Pendidikan Moral",
];

// ---------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------
export default function TeachingAssignmentPage() {
  const [assignments, setAssignments] = useState<TeachingAssignment[]>([]);
  const [teachers, setTeachers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [editing, setEditing] = useState<TeachingAssignment | null>(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState<CreateTeachingAssignmentPayload>({
    teacherId: "",
    subject: "",
    class: "",
    active: true,
  });

  // -------------------------------------------------------------
  // Load data
  // -------------------------------------------------------------
  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      setLoading(true);

      const [assign, teacherList] = await Promise.all([
        TeachingAssignmentAPI.getAll(),
        userApi.getAll(),
      ]);

      setAssignments(assign);
      // setTeachers(teacherList.filter((t) => t.role === "GURU"));
      setTeachers(teacherList.filter((t) => (t.role || []).includes("GURU")));
    } catch {
      setError("Gagal memuat data. Sila cuba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  const isDuplicate = (teacherId: string, subject: string, className: string) =>
    assignments.some(
      (a) =>
        a.teacherId === teacherId &&
        a.subject === subject &&
        a.class === className
    );

  const teacherName = (id: string) =>
    teachers.find((t) => t._id === id)?.name ?? id;

  // -------------------------------------------------------------
  // Dialog Open & Close
  // -------------------------------------------------------------
  const openForm = (item?: TeachingAssignment) => {
    if (item) {
      setEditing(item);
      setForm({
        teacherId: item.teacherId,
        subject: item.subject,
        class: item.class,
        active: item.active,
      });
    } else {
      setEditing(null);
      setForm({
        teacherId: "",
        subject: "",
        class: "",
        active: true,
      });
    }
    setError("");
    setOpenDialog(true);
  };

  const closeForm = () => {
    setOpenDialog(false);
    setEditing(null);
    setError("");
  };

  // -------------------------------------------------------------
  // Save Handler
  // -------------------------------------------------------------
  const handleSubmit = async () => {
    const { teacherId, subject, class: className } = form;

    if (!teacherId || !subject || !className) {
      setError("Sila lengkapkan semua maklumat.");
      return;
    }

    if (!editing && isDuplicate(teacherId, subject, className)) {
      setError("Tugasan tersebut sudah wujud.");
      return;
    }

    try {
      editing
        ? await TeachingAssignmentAPI.update(editing._id, form)
        : await TeachingAssignmentAPI.create(form);

      closeForm();
      loadAll();
    } catch {
      setError("Gagal menyimpan tugasan.");
    }
  };

  // -------------------------------------------------------------
  // Delete handler
  // -------------------------------------------------------------
  const handleDelete = async (id: string) => {
    if (!confirm("Padam tugasan ini?")) return;

    try {
      await TeachingAssignmentAPI.delete(id);
      loadAll();
    } catch {
      alert("Gagal memadam tugasan.");
    }
  };

  // -------------------------------------------------------------
  // Loading State
  // -------------------------------------------------------------
  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // -------------------------------------------------------------
  // Render UI
  // -------------------------------------------------------------
  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>  
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            <School color="primary" fontSize="large"/> Pengurusan Tugasan Mengajar
          </Typography>
        </Box>
        <Box>
          <Button
            variant="contained"
            startIcon={<Plus size={18} />}
            onClick={() => openForm()}
          >
            Tambah
          </Button>
        </Box>
      {/* Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              {["Guru", "Subjek", "Kelas", "Status", "Tindakan"].map((h) => (
                <TableCell key={h} sx={{ color: "white", fontWeight: "bold" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {assignments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Tiada tugasan.
                </TableCell>
              </TableRow>
            ) : (
              assignments.map((a) => (
                <TableRow key={a._id} hover>
                  <TableCell>{teacherName(a.teacherId)}</TableCell>
                  <TableCell>{a.subject}</TableCell>
                  <TableCell>{a.class}</TableCell>

                  <TableCell>
                    <Chip
                      label={a.active ? "Aktif" : "Tidak Aktif"}
                      color={a.active ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <IconButton color="primary" onClick={() => openForm(a)}>
                        <Edit size={18} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(a._id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog */}
      <Dialog open={openDialog} onClose={closeForm} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? "Edit Tugasan" : "Tambah Tugasan"}</DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            {/* Teacher */}
            <FormControl fullWidth required>
              <InputLabel>Guru</InputLabel>
              <Select
                label="Guru"
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              >
                {teachers.map((t) => (
                  <MenuItem key={t._id} value={t._id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Subject */}
            <FormControl fullWidth required>
              <InputLabel>Subjek</InputLabel>
              <Select
                label="Subjek"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                {subjects.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Class */}
            <TextField
              fullWidth
              label="Kelas"
              placeholder="Contoh: 5 Amanah"
              value={form.class}
              onChange={(e) => setForm({ ...form, class: e.target.value })}
            />

            {/* Status */}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={String(form.active)}
                label="Status"
                onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}
              >
                <MenuItem value="true">Aktif</MenuItem>
                <MenuItem value="false">Tidak Aktif</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeForm}>Batal</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editing ? "Simpan" : "Tambah"}
          </Button>
        </DialogActions>
      </Dialog>
      </Stack>
    </Box>
  );
}

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Grid,
} from "@mui/material";
import { Calendar, Clock } from "lucide-react";
import type { ScheduleFormData, ObservationType } from "../types/schedule";
import useAuth from "../../../hooks/useAuth";
import { pentadbirService } from "../api/pentadbirService";

interface ScheduleObservationModalProps {
  open: boolean;
  onClose: () => void;
  teacherName: string;
  initialData?: Partial<ScheduleFormData>;
  onSave: (data: ScheduleFormData) => void;
}

// Mock data for dropdowns
const mockSubjects = [
  "Matematik", "Bahasa Melayu", "English", "Sains", "Sejarah", 
  "Geografi", "Pendidikan Islam", "Pendidikan Moral", "Bahasa Cina", "Bahasa Tamil"
];

const mockClasses = [
  "1A", "1B", "1C", "2A", "2B", "2C", "3A", "3B", "3C",
  "4A", "4B", "4C", "5A", "5B", "5C", "6A", "6B", "6C"
];

export default function ScheduleObservationModal({
  open,
  onClose,
  teacherName,
  initialData,
  onSave,
}: ScheduleObservationModalProps) {
  const { user } = useAuth();
  const observerName = user?.name || "Pentadbir"; // Pentadbir is the observer
  
  const [formData, setFormData] = useState<ScheduleFormData>({
    observationType: "Cerapan 1",
    scheduledDate: "",
    scheduledTime: "",
    subject: "",
    class: "",
    observerName: observerName, // Auto-set to logged-in pentadbir
    templateRubric: "",
    notes: "",
    ...initialData,
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [templateRubrics, setTemplateRubrics] = useState<Array<{_id: string; name: string; version: string}>>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoadingTemplates(true);
        const templates = await pentadbirService.getTemplateRubrics();
        setTemplateRubrics(templates);
      } catch (error) {
        console.error("Failed to fetch template rubrics:", error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const handleChange = (field: keyof ScheduleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.observationType) {
      newErrors.push("Jenis cerapan diperlukan");
    }
    if (!formData.scheduledDate) {
      newErrors.push("Tarikh diperlukan");
    }
    if (!formData.scheduledTime) {
      newErrors.push("Masa diperlukan");
    }
    if (!formData.subject) {
      newErrors.push("Subjek diperlukan");
    }
    if (!formData.class) {
      newErrors.push("Kelas diperlukan");
    }
    if (!formData.templateRubric) {
      newErrors.push("Template rubrik diperlukan");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      observationType: "Cerapan 1",
      scheduledDate: "",
      scheduledTime: "",
      subject: "",
      class: "",
      observerName: observerName, // Reset to pentadbir's name
      templateRubric: "",
      notes: "",
      ...initialData,
    });
    setErrors([]);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Jadualkan Cerapan - {teacherName}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {errors.length > 0 && (
            <Alert severity="error">
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Jenis Cerapan</InputLabel>
                <Select
                  value={formData.observationType}
                  label="Jenis Cerapan"
                  onChange={(e) =>
                    handleChange("observationType", e.target.value as ObservationType)
                  }
                >
                  <MenuItem value="Cerapan 1">Cerapan 1</MenuItem>
                  <MenuItem value="Cerapan 2">Cerapan 2</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Tarikh"
                type="date"
                fullWidth
                value={formData.scheduledDate}
                onChange={(e) => handleChange("scheduledDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <Calendar size={20} style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Masa"
                type="time"
                fullWidth
                value={formData.scheduledTime}
                onChange={(e) => handleChange("scheduledTime", e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <Clock size={20} style={{ marginRight: 8 }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Subjek</InputLabel>
                <Select
                  value={formData.subject}
                  label="Subjek"
                  onChange={(e) => handleChange("subject", e.target.value)}
                >
                  {mockSubjects.map((subject) => (
                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Kelas</InputLabel>
                <Select
                  value={formData.class}
                  label="Kelas"
                  onChange={(e) => handleChange("class", e.target.value)}
                >
                  {mockClasses.map((className) => (
                    <MenuItem key={className} value={className}>{className}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth disabled={loadingTemplates}>
                <InputLabel>Template Rubrik</InputLabel>
                <Select
                  value={formData.templateRubric}
                  label="Template Rubrik"
                  onChange={(e) => handleChange("templateRubric", e.target.value)}
                >
                  {templateRubrics.map((rubric) => (
                    <MenuItem key={rubric._id} value={rubric.name}>
                      {rubric.name} ({rubric.version})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Nota Tambahan (Pilihan)"
                multiline
                rows={3}
                fullWidth
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Contoh: Fokus kepada penggunaan BBM, pengurusan kelas, dll."
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Batal
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          Simpan Jadual
        </Button>
      </DialogActions>
    </Dialog>
  );
}

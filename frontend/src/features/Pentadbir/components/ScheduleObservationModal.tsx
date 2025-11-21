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
  subjectOptions?: string[];
  classOptions?: string[];
  evaluationId?: string;
  initialData?: Partial<ScheduleFormData>;
  onSave: (data: ScheduleFormData) => void;
  evaluationData?: {
    subject: string;
    class: string;
    obs1Status: string;
  };
}

export default function ScheduleObservationModal({
  open,
  onClose,
  teacherName,
  subjectOptions = [],
  classOptions = [],
  evaluationId,
  initialData,
  onSave,
  evaluationData,
}: ScheduleObservationModalProps) {
  const { user } = useAuth();
  const observerName = user?.name || "Pentadbir"; // Pentadbir is the observer
  
  // Auto-detect observation type based on evaluation status
  const autoObservationType: ObservationType = evaluationData?.obs1Status === 'submitted' ? "Cerapan 2" : "Cerapan 1";
  const autoSubject = evaluationData?.subject || "";
  const autoClass = evaluationData?.class || "";
  
  const [formData, setFormData] = useState<ScheduleFormData>({
    observationType: autoObservationType,
    scheduledDate: "",
    scheduledTime: "",
    subject: autoSubject,
    class: autoClass,
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

  useEffect(() => {
    if (!open) return;
    // Reset form with auto-detected values when modal opens
    setFormData({
      observationType: autoObservationType,
      scheduledDate: "",
      scheduledTime: "",
      subject: autoSubject,
      class: autoClass,
      observerName: observerName,
      templateRubric: "",
      notes: "",
    });
  }, [open, autoObservationType, autoSubject, autoClass, observerName]);

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      console.log('Saving schedule with evaluationId:', evaluationId);
      console.log('Form data:', formData);
      
      // If evaluationId exists, save to backend
      if (evaluationId) {
        const response = await pentadbirService.updateSchedule(evaluationId, {
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          observerName: formData.observerName,
          templateRubric: formData.templateRubric,
          notes: formData.notes,
          observationType: formData.observationType,
        });
        console.log('Schedule saved successfully:', response);
      } else {
        console.warn('No evaluationId provided, skipping backend save');
      }
      
      onSave(formData);
      handleClose();
    } catch (error: any) {
      console.error('Failed to save schedule:', error);
      console.error('Error response:', error.response?.data);
      setErrors([`Gagal menyimpan jadual: ${error.response?.data?.message || error.message}`]);
    }
  };

  const handleClose = () => {
    setFormData({
      observationType: "Cerapan 1",
      scheduledDate: "",
      scheduledTime: "",
      subject: "",
      class: "",
      observerName: observerName, 
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

          {/* Auto-detected info display */}
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Jenis Cerapan:</strong> {formData.observationType} • 
            <strong>Subjek:</strong> {formData.subject} • 
            <strong>Kelas:</strong> {formData.class}
          </Alert>

          <Grid container spacing={2}>

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

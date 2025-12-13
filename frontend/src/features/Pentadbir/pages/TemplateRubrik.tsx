import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Plus,
  Edit,
  Delete,
  FileText,
  Eye,
  RefreshCw,
} from "lucide-react";
import type { TemplateRubric } from "../type";
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from "../api/templateService";
import { DocumentScanner } from "@mui/icons-material";

export default function TemplateRubrik() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<TemplateRubric[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<TemplateRubric | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [openTemplateDialog, setOpenTemplateDialog] = useState(false);
  
  // Form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    description: "",
    scaleSkor: 4
  });

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTemplates();
      setTemplates(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuatkan template. Sila cuba lagi.");
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  };

  // Template management functions
  const handleCreateTemplate = () => {
    setTemplateForm({ name: "", description: "", scaleSkor: 4 });
    setEditingTemplate(null);
    setOpenTemplateDialog(true);
  };

  const handleEditTemplate = (template: TemplateRubric) => {
    setTemplateForm({
      name: template.name,
      description: template.description,
      scaleSkor: template.scaleSkor
    });
    setEditingTemplate(template);
    setOpenTemplateDialog(true);
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      setError("Nama template tidak boleh kosong.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const templateData = {
        name: templateForm.name,
        description: templateForm.description,
        scaleSkor: templateForm.scaleSkor,
        categories: editingTemplate?.categories || []
      };

      let savedTemplate: TemplateRubric;
      
      if (editingTemplate) {
        // Update existing template
        savedTemplate = await updateTemplate(editingTemplate.id, templateData);
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? savedTemplate : t));
        setSuccess("Template berjaya dikemaskini!");
      } else {
        // Create new template
        savedTemplate = await createTemplate(templateData);
        setTemplates(prev => [...prev, savedTemplate]);
        setSuccess("Template baharu berjaya dicipta!");
      }

      setOpenTemplateDialog(false);
      
      // Broadcast update to all connected users (teachers)
      broadcastTemplateUpdate(savedTemplate);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan template. Sila cuba lagi.");
      console.error("Error saving template:", err);
    } finally {
      setSaving(false);
    }
  };

  
  const broadcastTemplateUpdate = (template: TemplateRubric) => {
    console.log("Template updated - notifying all users:", template);

  };

  const handleViewTemplate = (template: TemplateRubric) => {
    navigate(`/pentadbir/template-rubrik/${template.id}`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm("Adakah anda pasti ingin memadam template ini? Tindakan ini tidak boleh dibatalkan.")) {
      return;
    }

    try {
      setError(null);
      await deleteTemplate(templateId);
      setTemplates(prev => prev.filter(t => t.id !== templateId));
      setSuccess("Template berjaya dipadam!");
      
      // Notify all users about template deletion
      console.log("Template deleted - notifying all users:", templateId);
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memadam template. Sila cuba lagi.");
      console.error("Error deleting template:", err);
    }
  };

  const handleRefresh = () => {
    loadTemplates();
  };

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>        
        {/* Header */}
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}><DocumentScanner color="primary" fontSize="large"/> Template Rubrik</Typography>
          <Typography color="text.secondary">
            Urus template penilaian untuk cerapan guru. Perubahan akan dikongsi dengan semua pengguna.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Box sx={{p:3 }}>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={loading ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
                onClick={handleRefresh}
                disabled={loading}
              >
                {loading ? "Memuatkan..." : "Muat Semula"}
              </Button>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleCreateTemplate}
                disabled={loading}
              >
                Cipta Template Baharu
              </Button>
            </Stack>
          </Box>
        </Stack>
          <br />
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
          <CircularProgress size={40} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button size="small" onClick={loadTemplates} sx={{ ml: 2 }}>
            Cuba Lagi
          </Button>
        </Alert>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: "center", py: 8 }}>
              <FileText size={64} color="#ccc" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Belum Ada Template
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Cipta template rubrik pertama anda untuk mula menguruskan penilaian cerapan.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleCreateTemplate}
              >
                Cipta Template Pertama
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => {
            const totalItems = template.categories.reduce((total, cat) => 
              total + cat.subCategories.reduce((subTotal, sub) => subTotal + sub.items.length, 0), 0
            );
            
            return (
              <Grid key={template.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <Card 
                  sx={{ 
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {template.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mt: 1,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden"
                          }}
                        >
                          {template.description}
                        </Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip 
                          label={`Skala: ${template.scaleSkor}`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                        />
                        <Chip 
                          label={`${template.categories.length} Kategori`} 
                          size="small" 
                          variant="outlined"
                        />
                        <Chip 
                          label={`${totalItems} Item`} 
                          size="small" 
                          variant="outlined"
                        />
                      </Stack>

                      <Typography variant="caption" color="text.secondary">
                        Dikemaskini: {new Date(template.updatedAt).toLocaleDateString("ms-MY")}
                      </Typography>
                    </Stack>
                  </CardContent>
                  
                  <br />
                  <CardContent sx={{ pt: 0 }}>
                    <Stack direction="row" spacing={1} justifyContent="space-between">
                      <Button
                        variant="contained"
                        startIcon={<Eye size={16} />}
                        onClick={() => handleViewTemplate(template)}
                        sx={{ flex: 1 }}
                      >
                        Lihat & Edit
                      </Button>
                      <IconButton 
                        color="primary"
                        onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}
                        sx={{ border: 1, borderColor: "primary.main" }}
                      >
                        <Edit size={16} />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(template.id); }}
                        sx={{ border: 1, borderColor: "error.main" }}
                      >
                        <Delete size={16} />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Template Dialog */}
      <Dialog open={openTemplateDialog} onClose={() => setOpenTemplateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTemplate ? "Edit Template" : "Cipta Template Baharu"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Nama Template"
              fullWidth
              value={templateForm.name}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="contoh: TAPAK STANDARD 4 PEMBELAJARAN DAN PEMUDAHCARAAN"
            />
            <TextField
              label="Keterangan"
              fullWidth
              multiline
              rows={3}
              value={templateForm.description}
              onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Keterangan ringkas tentang template ini..."
            />
            <FormControl fullWidth>
              <InputLabel>Skala Skor</InputLabel>
              <Select
                value={templateForm.scaleSkor}
                label="Skala Skor"
                onChange={(e) => setTemplateForm(prev => ({ ...prev, scaleSkor: e.target.value as number }))}
              >
                <MenuItem value={4}>4 (0-4: Tidak Memuaskan hingga Cemerlang)</MenuItem>
                <MenuItem value={5}>5 (1-5: Sangat Lemah hingga Sangat Baik)</MenuItem>
                <MenuItem value={10}>10 (1-10: Skala Perpuluhan)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTemplateDialog(false)} disabled={saving}>
            Batal
          </Button>
          <Button 
            onClick={handleSaveTemplate} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : undefined}
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: "100%" }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

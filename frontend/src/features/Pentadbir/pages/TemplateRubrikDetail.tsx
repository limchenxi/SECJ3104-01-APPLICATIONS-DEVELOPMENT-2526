import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Breadcrumbs,
  Link,
  Snackbar,
} from "@mui/material";
import {
  ArrowLeft,
  Plus,
  Edit,
  Delete,
  ChevronDown,
  FileText,
} from "lucide-react";
import type { TemplateRubric, RubricCategory, RubricSubCategory, RubricItem, ScoreDescription } from "../type";
import { 
  getTemplate, 
  addCategory,
  updateCategory,
  deleteCategory,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
  addItem, 
  updateItem, 
  deleteItem 
} from "../api/templateService";

export default function TemplateRubrikDetail() {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  
  const [template, setTemplate] = useState<TemplateRubric | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Dialog states
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [openSubCategoryDialog, setOpenSubCategoryDialog] = useState(false);
  const [openItemDialog, setOpenItemDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<RubricItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<RubricCategory | null>(null);
  const [editingSubCategory, setEditingSubCategory] = useState<RubricSubCategory | null>(null);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    code: "",
    name: "",
    description: ""
  });
  
  const [subCategoryForm, setSubCategoryForm] = useState({
    code: "",
    name: "",
    description: ""
  });
  
  const [itemForm, setItemForm] = useState<{
    id: string;
    text: string;
    maxScore: number;
    scoreDescriptions: ScoreDescription[];
  }>({
    id: "",
    text: "",
    maxScore: 4,
    scoreDescriptions: []
  });
  
  const [selectedCategory, setSelectedCategory] = useState<RubricCategory | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<RubricSubCategory | null>(null);

  useEffect(() => {
    loadTemplate();
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await getTemplate(templateId);
      setTemplate(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuatkan template. Sila cuba lagi.");
      console.error("Error loading template:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <Typography>Memuat template...</Typography>
      </Box>
    );
  }

  if (!template) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Typography variant="h6" color="error">Template tidak dijumpai</Typography>
        <Button onClick={() => navigate("/pentadbir/template-rubrik")} sx={{ mt: 2 }}>
          Kembali ke Senarai Template
        </Button>
      </Box>
    );
  }

  // Category management functions
  const handleAddCategory = () => {
    setCategoryForm({ code: "", name: "", description: "" });
    setSelectedCategory(null);
    setEditingCategory(null);
    setOpenCategoryDialog(true);
  };

  const handleEditCategory = (category: RubricCategory) => {
    setCategoryForm({
      code: category.code,
      name: category.name,
      description: category.description
    });
    setEditingCategory(category);
    setOpenCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.code.trim() || !categoryForm.name.trim() || !template) return;

    try {
      setError(null);
      const categoryData = {
        code: categoryForm.code,
        name: categoryForm.name,
        description: categoryForm.description,
      };

      if (editingCategory) {
        // Update existing category
        await updateCategory(template.id, editingCategory.id, categoryData);
        setSuccess("Kategori berjaya dikemaskini!");
      } else {
        // Add new category
        await addCategory(template.id, { ...categoryData, subCategories: [] });
        setSuccess("Kategori berjaya ditambah!");
      }
      
      setOpenCategoryDialog(false);
      await loadTemplate(); // Reload to get updated data
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan kategori.");
      console.error("Error saving category:", err);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Adakah anda pasti ingin memadam kategori ini? Semua sub-kategori dan item di dalamnya akan turut dipadam.") || !template) return;

    try {
      setError(null);
      await deleteCategory(template.id, categoryId);
      setSuccess("Kategori berjaya dipadam!");
      await loadTemplate();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memadam kategori.");
      console.error("Error deleting category:", err);
    }
  };

  // Sub-category management functions
  const handleAddSubCategory = (category: RubricCategory) => {
    setSelectedCategory(category);
    setSubCategoryForm({ code: "", name: "", description: "" });
    setEditingSubCategory(null);
    setOpenSubCategoryDialog(true);
  };

  const handleEditSubCategory = (category: RubricCategory, subCategory: RubricSubCategory) => {
    setSelectedCategory(category);
    setSubCategoryForm({
      code: subCategory.code,
      name: subCategory.name,
      description: subCategory.description
    });
    setEditingSubCategory(subCategory);
    setOpenSubCategoryDialog(true);
  };

  const handleSaveSubCategory = async () => {
    if (!selectedCategory || !subCategoryForm.code.trim() || !template) return;

    try {
      setError(null);
      const subCategoryData = {
        code: subCategoryForm.code,
        name: subCategoryForm.name,
        description: subCategoryForm.description,
      };

      if (editingSubCategory) {
        // Update existing subcategory
        await updateSubCategory(template.id, selectedCategory.id, editingSubCategory.id, subCategoryData);
        setSuccess("Sub-kategori berjaya dikemaskini!");
      } else {
        // Add new subcategory
        await addSubCategory(template.id, selectedCategory.id, { ...subCategoryData, items: [] });
        setSuccess("Sub-kategori berjaya ditambah!");
      }
      
      setOpenSubCategoryDialog(false);
      await loadTemplate(); // Reload to get updated data
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan sub-kategori.");
      console.error("Error saving sub-category:", err);
    }
  };

  const handleDeleteSubCategory = async (categoryId: string, subCategoryId: string) => {
    if (!confirm("Adakah anda pasti ingin memadam sub-kategori ini? Semua item di dalamnya akan turut dipadam.") || !template) return;

    try {
      setError(null);
      await deleteSubCategory(template.id, categoryId, subCategoryId);
      setSuccess("Sub-kategori berjaya dipadam!");
      await loadTemplate();
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memadam sub-kategori.");
      console.error("Error deleting sub-category:", err);
    }
  };

  // Item management functions
  const handleAddItem = (category: RubricCategory, subCategory: RubricSubCategory) => {
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory);
    const scale = template?.scaleSkor || 4;
    const defaultScoreDescriptions: ScoreDescription[] = Array.from({ length: scale + 1 }, (_, i) => ({
      score: scale - i,
      label: scale - i === scale ? "Cemerlang" : scale - i === scale - 1 ? "Baik" : scale - i === scale - 2 ? "Sederhana" : scale - i === 1 ? "Lemah" : "Tidak Memuaskan",
      description: ""
    })).sort((a, b) => b.score - a.score);
    setItemForm({ id: "", text: "", maxScore: scale, scoreDescriptions: defaultScoreDescriptions });
    setEditingItem(null);
    setOpenItemDialog(true);
  };

  const handleEditItem = (category: RubricCategory, subCategory: RubricSubCategory, item: RubricItem) => {
    setSelectedCategory(category);
    setSelectedSubCategory(subCategory);
    const scale = template?.scaleSkor || 4;
    const defaultScoreDescriptions: ScoreDescription[] = Array.from({ length: scale + 1 }, (_, i) => ({
      score: scale - i,
      label: scale - i === scale ? "Cemerlang" : scale - i === scale - 1 ? "Baik" : scale - i === scale - 2 ? "Sederhana" : scale - i === 1 ? "Lemah" : "Tidak Memuaskan",
      description: ""
    })).sort((a, b) => b.score - a.score);
    setItemForm({
      id: item.id,
      text: item.text,
      maxScore: item.maxScore,
      scoreDescriptions: item.scoreDescriptions && item.scoreDescriptions.length === scale + 1 ? item.scoreDescriptions : defaultScoreDescriptions
    });
    setEditingItem(item);
    setOpenItemDialog(true);
  };

  const handleSaveItem = async () => {
    if (!selectedCategory || !selectedSubCategory || !itemForm.text.trim() || !template) return;

    try {
      setError(null);
      const itemData: any = {
        text: itemForm.text,
        maxScore: itemForm.maxScore,
        scoreDescriptions: itemForm.scoreDescriptions
      };
      
      // Only include ID if it's not empty (for new items with custom ID)
      if (itemForm.id && itemForm.id.trim() !== '') {
        itemData.id = itemForm.id.trim();
      }

      if (editingItem) {
        // Update existing item
        await updateItem(template.id, selectedCategory.id, selectedSubCategory.id, editingItem.id, itemData);
        setSuccess("Item berjaya dikemaskini!");
      } else {
        // Add new item
        await addItem(template.id, selectedCategory.id, selectedSubCategory.id, itemData);
        setSuccess("Item berjaya ditambah!");
      }

      setOpenItemDialog(false);
      await loadTemplate(); // Reload to get updated data
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal menyimpan item.");
      console.error("Error saving item:", err);
    }
  };

  const handleDeleteItem = async (categoryId: string, subCategoryId: string, itemId: string) => {
    if (!confirm("Adakah anda pasti ingin memadam item ini?") || !template) return;

    try {
      setError(null);
      await deleteItem(template.id, categoryId, subCategoryId, itemId);
      setSuccess("Item berjaya dipadam!");
      await loadTemplate(); // Reload to get updated data
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memadam item.");
      console.error("Error deleting item:", err);
    }
  };

  const totalItems = template.categories.reduce((total, cat) => 
    total + cat.subCategories.reduce((subTotal, sub) => subTotal + sub.items.length, 0), 0
  );

  return (
    <Box>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          component="button" 
          variant="body1" 
          onClick={() => navigate("/pentadbir/template-rubrik")}
          sx={{ textDecoration: "none" }}
        >
          Template Rubrik
        </Link>
        <Typography color="text.primary">{template.name}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 4 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Button
              startIcon={<ArrowLeft size={20} />}
              onClick={() => navigate("/pentadbir/template-rubrik")}
              variant="outlined"
            >
              Kembali
            </Button>
            <Typography variant="h4">{template.name}</Typography>
          </Stack>
          
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {template.description}
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Chip label={`Skala Skor: ${template.scaleSkor}`} color="primary" />
            <Chip label={`${template.categories.length} Kategori`} variant="outlined" />
            <Chip label={`${totalItems} Item`} variant="outlined" />
            <Chip 
              label={`Dikemaskini: ${new Date(template.updatedAt).toLocaleDateString("ms-MY")}`} 
              size="small" 
            />
          </Stack>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleAddCategory}
        >
          Tambah Kategori
        </Button>
      </Stack>

      {/* Content */}
      {template.categories.length === 0 ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: "center", py: 6 }}>
              <FileText size={64} color="#ccc" style={{ marginBottom: 16 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                Belum Ada Kategori
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Mulakan dengan menambah kategori pertama untuk template rubrik ini.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                onClick={handleAddCategory}
              >
                Tambah Kategori Pertama
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {template.categories.map((category) => (
            <Accordion key={category.id} defaultExpanded>
              <AccordionSummary 
                expandIcon={<ChevronDown />}
                sx={{ 
                  '& .MuiAccordionSummary-content': { 
                    alignItems: 'center' 
                  } 
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {category.code} - {category.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2 }}>
                  <Chip 
                    label={`${category.subCategories.length} Sub-kategori`} 
                    size="small" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`${category.subCategories.reduce((total, sub) => total + sub.items.length, 0)} Item`} 
                    size="small"
                  />
                  <Box
                    component="span"
                    sx={{ 
                      cursor: 'pointer', 
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      '&:hover': { opacity: 0.7 }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCategory(category);
                    }}
                  >
                    <Edit size={16} />
                  </Box>
                  <Box
                    component="span"
                    sx={{ 
                      cursor: 'pointer', 
                      color: 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px',
                      '&:hover': { opacity: 0.7 }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                  >
                    <Delete size={16} />
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={3}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Plus size={16} />}
                    onClick={() => handleAddSubCategory(category)}
                    sx={{ alignSelf: "flex-start" }}
                  >
                    Tambah Sub-kategori
                  </Button>

                  {category.subCategories.map((subCategory) => (
                    <Card key={subCategory.id} variant="outlined">
                      <CardContent>
                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {subCategory.code} - {subCategory.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {subCategory.description}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditSubCategory(category, subCategory)}
                              >
                                <Edit size={14} />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDeleteSubCategory(category.id, subCategory.id)}
                              >
                                <Delete size={14} />
                              </IconButton>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<Plus size={14} />}
                                onClick={() => handleAddItem(category, subCategory)}
                              >
                                Tambah Item
                              </Button>
                            </Stack>
                          </Stack>

                          {subCategory.items.length > 0 ? (
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell width="100"><strong>Kod</strong></TableCell>
                                    <TableCell><strong>Kriteria</strong></TableCell>
                                    <TableCell width="120" align="center"><strong>Markah Max</strong></TableCell>
                                    <TableCell width="120" align="center"><strong>Tindakan</strong></TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {subCategory.items.map((item) => (
                                    <TableRow key={item.id} hover>
                                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.875rem" }}>
                                        {item.id}
                                      </TableCell>
                                      <TableCell>{item.text}</TableCell>
                                      <TableCell align="center">
                                        <Chip label={item.maxScore} size="small" color="primary" />
                                      </TableCell>
                                      <TableCell align="center">
                                        <Stack direction="row" spacing={0.5} justifyContent="center">
                                          <IconButton 
                                            size="small" 
                                            color="primary"
                                            onClick={() => handleEditItem(category, subCategory, item)}
                                          >
                                            <Edit size={14} />
                                          </IconButton>
                                          <IconButton 
                                            size="small" 
                                            color="error"
                                            onClick={() => handleDeleteItem(category.id, subCategory.id, item.id)}
                                          >
                                            <Delete size={14} />
                                          </IconButton>
                                        </Stack>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Alert severity="info">
                              Belum ada item dalam sub-kategori ini. Klik "Tambah Item" untuk menambah kriteria pertama.
                            </Alert>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      )}

      {/* Category Dialog */}
      <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? "Edit Kategori" : "Tambah Kategori Baharu"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Kod Kategori"
              fullWidth
              value={categoryForm.code}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, code: e.target.value }))}
              placeholder="contoh: 4.1"
            />
            <TextField
              label="Nama Kategori"
              fullWidth
              value={categoryForm.name}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="contoh: GURU SEBAGAI PERANCANG"
            />
            <TextField
              label="Keterangan"
              fullWidth
              multiline
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Keterangan tentang kategori ini..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCategoryDialog(false)}>Batal</Button>
          <Button onClick={handleSaveCategory} variant="contained">
            {editingCategory ? "Kemaskini" : "Tambah"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sub-Category Dialog */}
      <Dialog open={openSubCategoryDialog} onClose={() => setOpenSubCategoryDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubCategory ? "Edit Sub-kategori" : "Tambah Sub-kategori Baharu"}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Kod Sub-kategori"
              fullWidth
              value={subCategoryForm.code}
              onChange={(e) => setSubCategoryForm(prev => ({ ...prev, code: e.target.value }))}
              placeholder="contoh: 4.1.1"
            />
            <TextField
              label="Nama Sub-kategori"
              fullWidth
              value={subCategoryForm.name}
              onChange={(e) => setSubCategoryForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="contoh: Perancangan Pengajaran"
            />
            <TextField
              label="Keterangan"
              fullWidth
              multiline
              rows={2}
              value={subCategoryForm.description}
              onChange={(e) => setSubCategoryForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Keterangan tentang sub-kategori ini..."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubCategoryDialog(false)}>Batal</Button>
          <Button onClick={handleSaveSubCategory} variant="contained">
            {editingSubCategory ? "Kemaskini" : "Tambah"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog 
        open={openItemDialog} 
        onClose={() => setOpenItemDialog(false)} 
        maxWidth="lg" 
        fullWidth
        PaperProps={{
          sx: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          {editingItem ? "Edit Item Kriteria" : "Tambah Item Kriteria"}
        </DialogTitle>
        <DialogContent sx={{ overflow: 'auto' }}>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              label="Kod Item (Pilihan)"
              fullWidth
              value={itemForm.id}
              onChange={(e) => setItemForm(prev => ({ ...prev, id: e.target.value }))}
              placeholder="contoh: 4.1.1a (kosongkan untuk auto-generate)"
              helperText="Kosongkan untuk penjanaan automatik berdasarkan urutan"
              disabled={!!editingItem}
            />
            <TextField
              label="Kriteria/Penyataan"
              fullWidth
              multiline
              rows={3}
              value={itemForm.text}
              onChange={(e) => setItemForm(prev => ({ ...prev, text: e.target.value }))}
              placeholder="contoh: Menyediakan RPH yang mengandungi objektif yang boleh diukur dan aktiviti pembelajaran yang sesuai"
            />
            {/* Removed Markah Maksimum field */}
            
            {/* Score Descriptions Section */}
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Penerangan Skor (0-4)
              </Typography>
              <Stack spacing={2}>
                {itemForm.scoreDescriptions.map((scoreDesc, index) => (
                  <Card key={scoreDesc.score} variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip 
                            label={`Skor ${scoreDesc.score}`} 
                            color={scoreDesc.score >= 3 ? "success" : scoreDesc.score >= 2 ? "warning" : "error"}
                            sx={{ minWidth: 80 }}
                          />
                          <TextField
                            label="Label"
                            size="small"
                            value={scoreDesc.label}
                            onChange={(e) => {
                              const newDescriptions = [...itemForm.scoreDescriptions];
                              newDescriptions[index].label = e.target.value;
                              setItemForm(prev => ({ ...prev, scoreDescriptions: newDescriptions }));
                            }}
                            sx={{ width: 200 }}
                          />
                        </Stack>
                        <TextField
                          label="Penerangan Kriteria"
                          multiline
                          rows={2}
                          fullWidth
                          value={scoreDesc.description}
                          onChange={(e) => {
                            const newDescriptions = [...itemForm.scoreDescriptions];
                            newDescriptions[index].description = e.target.value;
                            setItemForm(prev => ({ ...prev, scoreDescriptions: newDescriptions }));
                          }}
                          placeholder="Masukkan kriteria untuk skor ini..."
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenItemDialog(false)}>Batal</Button>
          <Button onClick={handleSaveItem} variant="contained">
            {editingItem ? "Kemaskini" : "Tambah"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}
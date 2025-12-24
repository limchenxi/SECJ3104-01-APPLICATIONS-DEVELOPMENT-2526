import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import type { RPHRequest } from "../type";

interface RPHDocument extends RPHRequest {
  _id?: string; // Add ID for edit mode
}

interface RPHFormProps {
  initialValues?: RPHRequest | RPHDocument;
  isSubmitting?: boolean;
  onSubmit: (values: RPHRequest) => void | Promise<void>;
}

const defaultValues: RPHRequest = {
  subject: "",
  level: "",
  topic: "",
  standardKandungan: "",
  standardPembelajaran: "",
  objectives: "",
  date: new Date().toISOString().split('T')[0],
  duration: "",
  minggu: "",
  kriteriaKejayaan: "",
  emk: "",
  bbm: "",
  pbd: "",
};

export default function RPHForm({
  initialValues,
  isSubmitting = false,
  onSubmit,
}: RPHFormProps) {
  const [form, setForm] = useState<RPHRequest>(initialValues || defaultValues);

  // Reset form when initialValues changes (for Edit mode)
  useEffect(() => {
    setForm(initialValues || defaultValues);
  }, [initialValues]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> |
    { target: { name: string; value: string } }
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
  };

  const isEditMode = !!(form as RPHDocument)?._id;


  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Grid container spacing={2}>
          <Grid size={4}>
            <TextField
              label="Minggu"
              name="minggu"
              value={form.minggu}
              onChange={handleChange}
              placeholder="e.g. 12"
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Tarikh"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Masa (Duration)"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              placeholder="9:10 AM - 9:40 AM"
              required
              fullWidth
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel>Subjek</InputLabel>
              <Select
                name="subject"
                label="Subjek"
                value={form.subject}
                onChange={handleChange}
                required
              >
                <MenuItem value="Matematik">Matematik</MenuItem>
                <MenuItem value="Sains">Sains</MenuItem>
                <MenuItem value="Bahasa Melayu">Bahasa Melayu</MenuItem>
                <MenuItem value="Bahasa Inggeris">Bahasa Inggeris</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {/* LEVEL */}
          <Grid size={6}>
            <FormControl fullWidth>
              <InputLabel>Tahap</InputLabel>
              <Select
                name="level"
                label="Tahap"
                value={form.level}
                onChange={handleChange}
                required
              >
                {[1, 2, 3, 4, 5, 6].map((l) => (
                  <MenuItem key={l} value={l.toString()}>Tahun {l}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TextField
          label="Topik"
          name="topic"
          value={form.topic}
          onChange={handleChange}
          required
          fullWidth
        />

        <TextField
          label="Standard Kandungan"
          name="standardKandungan"
          value={form.standardKandungan}
          onChange={handleChange}
          placeholder="e.g. 10.1 Sejarah Melayu"
          required
          fullWidth
        />

        <TextField
          label="Standard Pembelajaran"
          name="standardPembelajaran"
          value={form.standardPembelajaran}
          onChange={handleChange}
          placeholder="Contoh: 10.1.3 Mengenali sejarah Melayu"
          multiline
          required
          fullWidth
        />

        {/* OBJECTIVES */}
        <TextField
          label="Objektif Pembelajaran"
          name="objectives"
          value={form.objectives}
          onChange={handleChange}
          multiline
          minRows={3}
          required
          fullWidth
        />

        <TextField
          label="Kriteria Kejayaan"
          name="kriteriaKejayaan"
          value={form.kriteriaKejayaan}
          onChange={handleChange}
          placeholder="Murid dapat..."
          multiline
          fullWidth
        />

        {/* 2-Column fields */}
        <Grid container spacing={2}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <TextField
                label="BBM (Bahan Bantu Mengajar)"
                name="bbm"
                value={form.bbm}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel>EMK</InputLabel>
                <Select
                  name="emk"
                  label="EMK"
                  value={form.emk}
                  onChange={handleChange}
                >
                  {[
                    "01. Bahasa",
                    "02. Kelestarian Alam Sekitar",
                    "03. Nilai Murni",
                    "04. Sains dan Teknologi",
                    "05. Patriotisme",
                    "06. Kreativiti dan Inovasi",
                    "07. Keusahawanan",
                    "08. Teknologi Maklumat dan Komunikasi (TMK)",
                    "09. Kelestarian Global",
                    "10. Pendidikan Kewangan",
                    "11. -",
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField
            label="Pentaksiran (PBD)"
            name="pbd"
            value={form.pbd}
            onChange={handleChange}
            placeholder="e.g. Pemerhatian, Lisan"
            multiline
            minRows={3}
            fullWidth
          />
        </Grid>

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting || !form.subject || !form.level || !form.topic || !form.objectives}>
          {isSubmitting ? "Memproses..." : (isEditMode ? "Simpan Perubahan" : "Jana & Simpan RPH")}
        </Button>
      </Stack>
    </Box>
  );
}

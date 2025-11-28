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
  objectives: "",
  duration: "",
  materials: "",
};

export default function RPHForm({
  initialValues,
  isSubmitting = false,
  onSubmit,
}: RPHFormProps) {
  const [form, setForm] = useState<RPHRequest>(initialValues|| defaultValues);

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

        {/* SUBJECT */}
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

        {/* LEVEL */}
        <FormControl fullWidth>
          <InputLabel>Tahap</InputLabel>
          <Select
            name="level"
            label="Tahap"
            value={form.level}
            onChange={handleChange}
            required
          >
            <MenuItem value="1">Tahun 1</MenuItem>
            <MenuItem value="2">Tahun 2</MenuItem>
            <MenuItem value="3">Tahun 3</MenuItem>
            <MenuItem value="4">Tahun 4</MenuItem>
            <MenuItem value="5">Tahun 5</MenuItem>
            <MenuItem value="6">Tahun 6</MenuItem>
          </Select>
        </FormControl>

        {/* TOPIC */}
        <TextField
          label="Topik"
          name="topic"
          value={form.topic}
          onChange={handleChange}
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
          minRows={4}
          required
          fullWidth
        />

        {/* 2-Column fields */}
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField
              label="Tempoh Masa"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              fullWidth
            />
          </Grid>

          <Grid size={12}>
            <TextField
              label="BBM (Bahan Bantu Mengajar)"
              name="materials"
              value={form.materials}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>

        <Button type="submit" variant="contained" size="large" disabled={isSubmitting|| !form.subject || !form.level || !form.topic || !form.objectives}>
          {isSubmitting ? "Memproses..." : (isEditMode ? "Simpan Perubahan" : "Jana & Simpan RPH")}
        </Button>
      </Stack>
    </Box>
  );
}

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";
import type { RPHRequest } from "../api/rphService";

interface RPHFormProps {
  initialValues?: RPHRequest;
  isSubmitting?: boolean;
  onSubmit: (values: RPHRequest) => void | Promise<void>;
}

const defaultValues: RPHRequest = {
  subject: "",
  level: "",
  objectives: "",
};

export default function RPHForm({
  initialValues = defaultValues,
  isSubmitting = false,
  onSubmit,
}: RPHFormProps) {
  const [form, setForm] = useState<RPHRequest>(initialValues);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Subjek"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
        />
        <TextField
          label="Tahap"
          name="level"
          value={form.level}
          onChange={handleChange}
          required
        />
        <TextField
          label="Objektif"
          name="objectives"
          value={form.objectives}
          onChange={handleChange}
          multiline
          minRows={4}
          required
        />
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Menjana..." : "Jana RPH"}
        </Button>
      </Stack>
    </Box>
  );
}

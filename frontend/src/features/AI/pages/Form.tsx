import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { AIGenerationRequest } from "../type";

interface AIFormProps {
  initialValues?: AIGenerationRequest;
  isSubmitting?: boolean;
  onSubmit: (values: AIGenerationRequest) => void | Promise<void>;
}

const formats: AIGenerationRequest["format"][] = [
  "module",
  "idea",
  "quiz",
];

const defaultValues: AIGenerationRequest = {
  topic: "",
  objective: "",
  format: "module",
};

export default function AIForm({
  initialValues = defaultValues,
  isSubmitting = false,
  onSubmit,
}: AIFormProps) {
  const [values, setValues] = useState<AIGenerationRequest>(initialValues);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormatChange = (event: SelectChangeEvent) => {
    setValues((prev) => ({
      ...prev,
      format: event.target.value as AIGenerationRequest["format"],
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          label="Topik"
          name="topic"
          value={values.topic}
          onChange={handleChange}
          required
        />
        <TextField
          label="Objektif"
          name="objective"
          value={values.objective}
          onChange={handleChange}
          multiline
          minRows={3}
          required
        />
        <FormControl>
          <InputLabel id="ai-format-label">Format</InputLabel>
          <Select
            labelId="ai-format-label"
            value={values.format}
            label="Format"
            onChange={handleFormatChange}
          >
            {formats.map((format) => (
              <MenuItem key={format} value={format}>
                {format}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Menjana..." : "Jana Modul"}
        </Button>
      </Stack>
    </Box>
  );
}

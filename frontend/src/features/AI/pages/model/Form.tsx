import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { AIModule } from "../../type";

interface AIModuleFormProps {
  initialValues?: AIModule;
  isSubmitting?: boolean;
  onSubmit: (values: AIModule) => void | Promise<void>;
}

const defaultValues: AIModule = {
  _id: "",
  name: "",
  usageType: "",
  provider: "OpenAI",
  model: "",
  enabled: true,
};

export default function AIModuleForm({
  initialValues = defaultValues,
  isSubmitting = false,
  onSubmit,
}: AIModuleFormProps) {
  const [values, setValues] = useState<AIModule>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  function handleChange(field: keyof AIModule, value: any) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit(values);
  }

  return (
    <Card sx={{ borderRadius: 3, maxWidth: 600, mx: "auto" }}>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={600}>
            {values._id ? "Edit AI Module" : "Add AI Module"}
          </Typography>
        }
        subheader="Configure module name, provider, and model."
      />

      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            {/* Name */}
            <TextField
              label="Module Name"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              fullWidth
            />

            {/* Usage Type */}
            <TextField
              label="Usage Type (e.g., quiz / lesson_plan / cerapan)"
              value={values.usageType}
              onChange={(e) => handleChange("usageType", e.target.value)}
              required
              fullWidth
            />

            {/* Provider */}
            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={values.provider}
                label="Provider"
                onChange={(e) => handleChange("provider", e.target.value)}
              >
                <MenuItem value="OpenAI">OpenAI</MenuItem>
                <MenuItem value="Gemini">Gemini</MenuItem>
                <MenuItem value="Copilot">Copilot</MenuItem>
              </Select>
            </FormControl>

            {/* Model */}
            <TextField
              label="Model (e.g., gpt-4.1, gemini-1.5-pro)"
              value={values.model}
              onChange={(e) => handleChange("model", e.target.value)}
              required
              fullWidth
            />

            {/* Enabled */}
            <FormControlLabel
              control={
                <Switch
                  checked={values.enabled}
                  onChange={(e) => handleChange("enabled", e.target.checked)}
                />
              }
              label="Module Enabled"
            />

            {/* Submit */}
            <Button
              variant="contained"
              type="submit"
              disabled={isSubmitting}
              sx={{ py: 1.2, borderRadius: 2 }}
            >
              {isSubmitting ? "Saving..." : "Save Module"}
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

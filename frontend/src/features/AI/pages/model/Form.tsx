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
  Chip,
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
  usageTypes: [],
  enabled: true,
  provider: "Gemini",
  model: "",
  temperature: 0.7,
  maxToken: 2000,
  timeout: 30,
  updatedAt: "",
};

const USAGE_OPTIONS = [
  "eRPH",
  "AI Quiz",
  "Cerapan Comment"
];

export default function AIModuleForm({
  initialValues = defaultValues,
  isSubmitting = false,
  onSubmit,
}: AIModuleFormProps) {
  const [values, setValues] = useState<AIModule>({
        ...initialValues,
        // 确保 usageTypes 是数组，如果 initialValues.usageTypes 可能是 null/undefined
        usageTypes: initialValues.usageTypes || [], 
    } as AIModule); // 强制类型转换，因为 initialValues 总是提供了所有字段

    // 🌟 简化 useEffect 逻辑：当 initialValues 变化时，直接设置整个对象
    useEffect(() => {
        setValues({ 
            ...initialValues, 
            usageTypes: initialValues.usageTypes || [] 
        });
    }, [initialValues]);

  function handleChange(field: keyof typeof values, value: any) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { _id, ...dataToSend } = values;
    const finalData = values._id ? values : dataToSend;
    await onSubmit(finalData as unknown as AIModule);
    // await onSubmit({
    //     ...values,
    // } as unknown as AIModule); 
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
            <FormControl fullWidth required>
              <InputLabel id="usage-type-label">Usage Types</InputLabel>
              <Select
                labelId="usage-type-label"
                multiple // 启用多选
                value={values.usageTypes}
                onChange={(e) => handleChange("usageTypes", e.target.value)}
                label="Usage Types"
                // 渲染选中项为 Chip
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
              >
                {USAGE_OPTIONS.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Provider */}
            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={values.provider}
                label="Provider"
                onChange={(e) => handleChange("provider", e.target.value)}
              >
                <MenuItem value="Gemini">Gemini</MenuItem>
                {/* <MenuItem value="OpenAI">OpenAI</MenuItem>
                <MenuItem value="Copilot">Copilot</MenuItem> */}
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

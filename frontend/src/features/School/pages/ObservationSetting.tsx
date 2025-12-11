import { Button, Stack, TextField, Grid, Alert, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { useState, useMemo } from "react";
import type { ObservationSetting } from "../type";
import { updatePartialSettings } from "../stores";

type ObservationFormData = ObservationSetting & { 
  enableAutoAssignment?: boolean;
  enableObservationReminders?: boolean; 
};

type ObservationErrors = Partial<Record<keyof ObservationFormData, string>>;

function validateObservationInfo(values: ObservationFormData): ObservationErrors {
  const errors: ObservationErrors = {};
  
  if (values.defaultDurationMinutes === undefined || values.defaultDurationMinutes === null) {
    errors.defaultDurationMinutes = 'Default Duration is required';
  } else if (values.defaultDurationMinutes < 5) {
    errors.defaultDurationMinutes = 'Minimum 5 minutes';
  }
  
  if (values.reminderDaysBefore === undefined || values.reminderDaysBefore === null) {
    errors.reminderDaysBefore = 'Reminder Days is required';
  } else if (values.reminderDaysBefore < 0) {
    errors.reminderDaysBefore = 'Cannot be negative';
  }
  
  return errors;
}

type ObservationSettingsTabProps = {
  initialData: ObservationFormData;
};

export default function ObservationSettingsTab({ initialData }: ObservationSettingsTabProps) {
  const [formData, setFormData] = useState<ObservationFormData>(initialData);
  const [errors, setErrors] = useState<ObservationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    // 处理 Checkbox 的布尔值
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? undefined : Number(value)) : value);

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof ObservationFormData]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const isDirty = useMemo(() => JSON.stringify(initialData) !== JSON.stringify(formData), [initialData, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    const validationErrors = validateObservationInfo(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      // 提交所有字段，让后端处理过滤和存储
      await updatePartialSettings('observationSetting', formData); 
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000); 
    } catch (e) {
      setSaveStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={4}>
        {saveStatus === 'success' && <Alert severity="success">Observation Settings saved successfully!</Alert>}
        {saveStatus === 'error' && <Alert severity="error">Failed to save Observation Settings.</Alert>}
        
        <Grid container spacing={4}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Default Observation Duration (minutes)"
              name="defaultDurationMinutes"
              type="number"
              value={formData.defaultDurationMinutes ?? ''}
              onChange={handleChange}
              error={Boolean(errors.defaultDurationMinutes)}
              helperText={errors.defaultDurationMinutes}
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Reminder Days Before"
              name="reminderDaysBefore"
              type="number"
              value={formData.reminderDaysBefore ?? ''}
              onChange={handleChange}
              error={Boolean(errors.reminderDaysBefore)}
              helperText={errors.reminderDaysBefore}
            />
          </Grid>

          <Grid size={12}>
            <Stack spacing={1}>
                <FormControlLabel
                    control={<Checkbox 
                        name="enableAutoAssignment" 
                        checked={!!formData.enableAutoAssignment} 
                        onChange={handleChange} 
                    />}
                    label="Enable auto-assignment of observations"
                />
                <FormControlLabel
                    control={<Checkbox 
                        name="enableObservationReminders" 
                        checked={!!formData.enableObservationReminders} 
                        onChange={handleChange} 
                    />}
                    label="Enable observation reminders"
                />
            </Stack>
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button onClick={handleReset} disabled={isSubmitting}>
            Reset
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Stack>
      </Stack>
    </form>
  );
}
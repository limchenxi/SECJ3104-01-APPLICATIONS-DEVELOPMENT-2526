import { Button, Stack, TextField, Grid, Alert, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { useState, useMemo } from "react";
import type { ObservationSetting } from "../type";
import { updatePartialSettings } from "../stores";

type ObservationErrors = Partial<Record<keyof ObservationSetting, string>>;

const DEFAULT_OBSERVATION: ObservationSetting = {
    defaultDurationMinutes: 60,
    reminderDaysBefore: 1,
    enableReminder: true, 
};

function validateObservationInfo(values: ObservationSetting): ObservationErrors {
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
  initialData: ObservationSetting;
};

export default function ObservationSettingsTab({ initialData }: ObservationSettingsTabProps) {
  const validInitialData = initialData || DEFAULT_OBSERVATION;
  const [formData, setFormData] = useState<ObservationSetting>(validInitialData);
  const [errors, setErrors] = useState<ObservationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? undefined : Number(value)) : value);

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof ObservationSetting]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const isDirty = useMemo(() => JSON.stringify(initialData) !== JSON.stringify(formData), [initialData, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    const dataToSend = {
        ...formData,
        defaultDurationMinutes: Number(formData.defaultDurationMinutes) || 0,
        reminderDaysBefore: Number(formData.reminderDaysBefore) || 0,
        enableReminder: !!formData.enableReminder,
    };

    const validationErrors = validateObservationInfo(dataToSend);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePartialSettings('observationSetting', dataToSend); 
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
                {/* <FormControlLabel
                    control={<Checkbox 
                        name="enableAutoAssignment" 
                        checked={!!formData.enableAutoAssignment} 
                        onChange={handleChange} 
                    />}
                    label="Enable auto-assignment of observations"
                /> */}
                <FormControlLabel
                    control={<Checkbox 
                        name="enableReminder" 
                        checked={!!formData.enableReminder} 
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
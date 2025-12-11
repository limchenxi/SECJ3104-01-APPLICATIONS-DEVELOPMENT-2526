import { Button, Stack, TextField, Grid, Alert, FormControlLabel, Checkbox, Typography } from "@mui/material";
import { useState, useMemo } from "react";
import type { AttendanceSetting } from "../type";
import { updatePartialSettings } from "../stores";

const TimeFormatRegex = /^(0[1-9]|1[0-2]):[0-5][0-9]\s(AM|PM)$/; 

type AttendanceFormData = AttendanceSetting & {
  automaticallyMarkAbsent?: boolean; 
};

type AttendanceErrors = Partial<Record<keyof AttendanceFormData, string>>;

function validateAttendanceInfo(values: AttendanceFormData): AttendanceErrors {
  const errors: AttendanceErrors = {};
  
  if (!values.workStartTime) {
    errors.workStartTime = 'Work Start Time is required';
  } else if (!TimeFormatRegex.test(values.workStartTime)) {
    errors.workStartTime = 'Format must be HH:MM AM/PM (e.g., 08:00 AM)';
  }

  if (!values.workEndTime) {
    errors.workEndTime = 'Work End Time is required';
  } else if (!TimeFormatRegex.test(values.workEndTime)) {
    errors.workEndTime = 'Format must be HH:MM AM/PM (e.g., 05:00 PM)';
  }

  if (values.lateThresholdMinutes === undefined || values.lateThresholdMinutes === null) {
    errors.lateThresholdMinutes = 'Threshold is required';
  } else if (values.lateThresholdMinutes < 0) {
    errors.lateThresholdMinutes = 'Cannot be negative';
  }

  return errors;
}

type AttendanceSettingsTabProps = {
  initialData: AttendanceFormData;
};

export default function AttendanceSettingsTab({ initialData }: AttendanceSettingsTabProps) {
  const [formData, setFormData] = useState<AttendanceFormData>(initialData);
  const [errors, setErrors] = useState<AttendanceErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    // 处理 Checkbox 和数字
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? undefined : Number(value)) : value);

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof AttendanceFormData]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const isDirty = useMemo(() => JSON.stringify(initialData) !== JSON.stringify(formData), [initialData, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);

    const validationErrors = validateAttendanceInfo(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePartialSettings('attendanceSetting', formData); 
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
        {saveStatus === 'success' && <Alert severity="success">Attendance Settings saved successfully!</Alert>}
        {saveStatus === 'error' && <Alert severity="error">Failed to save Attendance Settings.</Alert>}
        
        <Grid container spacing={4}>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Work Start Time"
              name="workStartTime"
              value={formData.workStartTime}
              onChange={handleChange}
              error={Boolean(errors.workStartTime)}
              helperText={errors.workStartTime || 'Format: 07:40 AM'}
              placeholder="e.g. 07:40 AM"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Work End Time"
              name="workEndTime"
              value={formData.workEndTime}
              onChange={handleChange}
              error={Boolean(errors.workEndTime)}
              helperText={errors.workEndTime || 'Format: 05:00 PM'}
              placeholder="e.g. 05:00 PM"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              fullWidth
              label="Late Threshold (minutes)"
              name="lateThresholdMinutes"
              type="number"
              value={formData.lateThresholdMinutes ?? ''}
              onChange={handleChange}
              error={Boolean(errors.lateThresholdMinutes)}
              helperText={errors.lateThresholdMinutes}
            />
          </Grid>
          <Grid size={12}>
            <FormControlLabel
                control={<Checkbox 
                    name="automaticallyMarkAbsent" 
                    checked={!!formData.automaticallyMarkAbsent} 
                    onChange={handleChange} 
                />}
                label="Automatically mark as absent if no check-in"
            />
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
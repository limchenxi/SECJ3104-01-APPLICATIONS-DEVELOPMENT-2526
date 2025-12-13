import { Button, Stack, Alert, FormControlLabel, Checkbox, Divider, Typography, TextField } from "@mui/material";
import { useState, useMemo } from "react";
import type { NotificationSetting } from "../type";
import { updatePartialSettings } from "../stores";

type NotificationErrors = Partial<Record<keyof NotificationSetting, string>>;

const DEFAULT_NOTIFICATION: NotificationSetting = {
    emailEnabled: true,
    smsEnabled: false,
    inAppEnabled: true,
    retentionDays: 90, 
};

function validateNotificationInfo(values: NotificationSetting): NotificationErrors {
  const errors: NotificationErrors = {};
  
  if (values.retentionDays === undefined || values.retentionDays === null) {
    errors.retentionDays = 'Retention Days is required';
  } else if (values.retentionDays < 1) {
    errors.retentionDays = 'Minimum 1 day';
  }

  return errors;
}

type NotificationsTabProps = {
  initialData: NotificationSetting;
};

export default function NotificationsTab({ initialData }: NotificationsTabProps) {
  const validInitialData = initialData || DEFAULT_NOTIFICATION;
  const [formData, setFormData] = useState<NotificationSetting>(validInitialData);
  const [errors, setErrors] = useState<NotificationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    
    // 处理 Checkbox 和数字
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? undefined : Number(value)) : value);

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    if (errors[name as keyof NotificationSetting]) {
        setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const isDirty = useMemo(() => JSON.stringify(initialData) !== JSON.stringify(formData), [initialData, formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    const dataToSend = {
        ...formData,
        retentionDays: Number(formData.retentionDays || 0),
        emailEnabled: !!formData.emailEnabled,
        smsEnabled: !!formData.smsEnabled,
        inAppEnabled: !!formData.inAppEnabled,
    };

    const validationErrors = validateNotificationInfo(dataToSend);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePartialSettings('notificationSetting', dataToSend);
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
        {saveStatus === 'success' && <Alert severity="success">Notification Settings saved successfully!</Alert>}
        {saveStatus === 'error' && <Alert severity="error">Failed to save Notification Settings.</Alert>}
        
        {/* Email Notifications */}
        <Stack spacing={1}>
          <Typography variant="h6">Email Notifications</Typography>
          <FormControlLabel
              control={<Checkbox 
                  name="emailEnabled" 
                  checked={!!formData.emailEnabled} 
                  onChange={handleChange} 
              />}
              label="Enable email notifications"
          />
        </Stack>

        <Divider />

        {/* SMS Notifications */}
        <Stack spacing={1}>
          <Typography variant="h6">SMS Notifications</Typography>
          <FormControlLabel
              control={<Checkbox 
                  name="smsEnabled" 
                  checked={!!formData.smsEnabled} 
                  onChange={handleChange} 
              />}
              label="Enable SMS notifications"
          />
        </Stack>
        
        <Divider />

        {/* In-App Notifications */}
        <Stack spacing={2}>
          <Typography variant="h6">In-App Notifications</Typography>
          <FormControlLabel
              control={<Checkbox 
                  name="inAppEnabled" 
                  checked={!!formData.inAppEnabled} 
                  onChange={handleChange} 
              />}
              label="Enable in-app notifications"
          />
          <TextField
              label="Retention Days"
              name="retentionDays"
              type="number"
              sx={{ maxWidth: 300 }}
              value={formData.retentionDays ?? ''}
              onChange={handleChange}
              error={Boolean(errors.retentionDays)}
              helperText={errors.retentionDays}
          />
        </Stack>

        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ pt: 3 }}>
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
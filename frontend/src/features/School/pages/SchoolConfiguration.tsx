import { useState, useEffect, useMemo } from "react";
import { Stack, Box, Tabs, Tab, Typography, Alert, CircularProgress } from "@mui/material";
import { useStore } from '@tanstack/react-store';

import BasicInfoTab from "./BasicInfo";
import { fetchSettings, schoolSettingsStore } from "../stores";
import ObservationSettingsTab from "./ObservationSetting";
import AttendanceSettingsTab from "./AttendanceSetting";
import NotificationsTab from "./Notification";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function SchoolConfiguration() {
  const [activeTab, setActiveTab] = useState(0);
  const { settings, isLoading } = useStore(schoolSettingsStore, (state) => state);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings().catch(e => {
        setError("Failed to load school settings.");
        console.error(e);
    });
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isLoading && !settings) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!settings) return <Alert severity="info">No school settings found.</Alert>;

  return (
    <Stack spacing={3}>
      {/* HEADER */}
      <Typography variant="h4" fontWeight="bold">School Configuration</Typography>
      <Typography variant="body1" color="text.secondary">Manage your school settings and preferences</Typography>
      
      {/* TABS */}
      <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="school settings tabs">
          <Tab label="Basic Information" />
          <Tab label="Observation Settings" />
          <Tab label="Attendance Settings" />
          <Tab label="Notifications" />
        </Tabs>
      </Box>

      {/* TAB CONTENT */}
      <CustomTabPanel value={activeTab} index={0}>
        <BasicInfoTab initialData={settings.basicInfo} />
      </CustomTabPanel>
      <CustomTabPanel value={activeTab} index={1}>
        <ObservationSettingsTab initialData={settings.observationSetting} />
      </CustomTabPanel>
      <CustomTabPanel value={activeTab} index={2}>
        <AttendanceSettingsTab initialData={settings.attendanceSetting} />
      </CustomTabPanel>
      <CustomTabPanel value={activeTab} index={3}>
        <NotificationsTab initialData={settings.notificationSetting} />
      </CustomTabPanel>
    </Stack>
  );
}
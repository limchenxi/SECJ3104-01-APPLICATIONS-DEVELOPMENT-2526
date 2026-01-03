import { useState, useEffect } from "react";
import { Stack, Box, Tabs, Tab, Typography, Alert, CircularProgress } from "@mui/material";
import { useStore } from '@tanstack/react-store';

import BasicInfoTab from "./BasicInfo";
import { fetchSettings, schoolSettingsStore } from "../stores";
import AttendanceSettingsTab from "./AttendanceSetting";
// import NotificationsTab from "./Notification";
import { School } from "@mui/icons-material";

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
  // if (!settings || !settings.basicInfo || !settings.observationSetting || !settings.info ) {
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
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>  
        {/* Header */}
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            <School color="primary" fontSize="large"/> School Configuration
          </Typography>
          <Typography color="text.secondary">
            Manage school settings and preferences
          </Typography>
        </Box>

        {/* TABS */}
        <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="school settings tabs">
            <Tab label="Basic Information" />
            {/* <Tab label="Observation Settings" /> */}
            <Tab label="Attendance Settings" />
            {/* <Tab label="Notifications" /> */}
          </Tabs>
        </Box>

        {/* TAB CONTENT */}
        <CustomTabPanel value={activeTab} index={0}>
          <BasicInfoTab initialData={settings.basicInfo} />
        </CustomTabPanel>
        <CustomTabPanel value={activeTab} index={1}>
          <AttendanceSettingsTab initialData={settings.attendanceSetting} />
        </CustomTabPanel>
        {/* <CustomTabPanel value={activeTab} index={2}>
          <NotificationsTab initialData={settings.notificationSetting} />
        </CustomTabPanel> */}
      </Stack>
    </Box>
  );
}
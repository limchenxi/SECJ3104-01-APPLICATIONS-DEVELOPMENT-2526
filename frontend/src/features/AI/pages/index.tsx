import { useState } from "react";
import AIList from "./model/ai-list";
import AiUsageAnalytics from "./usage/ai-usage";
import { Box, Typography, Tabs, Stack, Tab } from "@mui/material";
import { Computer } from "@mui/icons-material";

// import AiModuleSettings from "./default/ai-default";

export default function AIManagementIndex() {
  const [activeTab, setActiveTab] = useState<"model" | "usage">(
    "model"
  );
  const handleTabChange = (event: React.SyntheticEvent, newValue: "model" | "usage") => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>  
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            <Computer color="primary" fontSize="large"/> Pengurusan AI
          </Typography>
        </Box>

      <Tabs
          value={activeTab}
          onChange={handleTabChange}
          // variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                Senarai Model AI
              </Stack>
            }
            value="model"
          />
          <Tab
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                Analitik Penggunaan AI
              </Stack>
            }
            value="usage"
          />
        </Tabs>

      <Box
        sx={{
          backgroundColor: 'white',
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 3,
          p: 3,
          boxShadow: 1,
        }}
      >
        {activeTab === "model" && <AIList items={[]} />}
        {activeTab === "usage" && <AiUsageAnalytics />}
      </Box>
      </Stack>
    </Box>
  );
}

import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import type { ActivityItem } from "../api/dashboardService";

const activityColors: Record<ActivityItem["type"], string> = {
  attendance: "#0284c7",
  cerapan: "#7c3aed",
  quiz: "#16a34a",
  rph: "#ea580c",
};

interface ActivityListProps {
  items: ActivityItem[];
}

export default function ActivityList({ items }: ActivityListProps) {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          Tiada aktiviti terbaru.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined">
      <List disablePadding>
        {items.map((activity) => (
          <ListItem
            key={activity.id}
            divider
            alignItems="flex-start"
            sx={{ py: 1.5, px: 2 }}
          >
            <ListItemAvatar>
              <Avatar
                sx={{
                  bgcolor: activityColors[activity.type],
                  width: 32,
                  height: 32,
                }}
              >
                {activity.type.charAt(0).toUpperCase()}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={activity.message}
              secondary={
                <Box component="span" color="text.secondary">
                  {new Date(activity.timestamp).toLocaleString()}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

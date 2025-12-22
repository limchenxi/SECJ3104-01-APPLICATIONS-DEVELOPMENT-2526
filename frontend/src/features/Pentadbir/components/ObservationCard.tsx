import {
  Card,
  CardContent,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import { Calendar, Clock, FileText, Edit, Trash2, PlayCircle } from "lucide-react";

interface ObservationCardProps {
  teacherName: string;
  subject: string;
  className: string;
  observationType: "Cerapan 1" | "Cerapan 2";
  observerName: string;
  observerTitle?: string;
  rubric: string;
  date: string;
  time: string;
  year: string;
  status?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onStart?: () => void;
}

export default function ObservationCard({
  teacherName,
  subject,
  className,
  observationType,
  observerName,
  observerTitle = "Guru Besar",
  rubric,
  date,
  time,
  year,
  status,
  onEdit,
  onDelete,
  onStart,
}: ObservationCardProps) {
  // Generate initials for avatar
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      "#1976d2",
      "#388e3c",
      "#d32f2f",
      "#7b1fa2",
      "#f57c00",
      "#0097a7",
    ];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  return (
    <Box>
      {/* Status Text and Start Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        {status && (
          <Typography
            variant="body2"
            sx={{
              color: status === "Telah dijadualkan" ? "success.main" : "text.secondary",
              fontWeight: status === "Telah dijadualkan" ? 600 : 400,
            }}
          >
            {status}
          </Typography>
        )}
        {onStart && (
          <Button
            variant="contained"
            size="small"
            startIcon={status === "Telah dijadualkan" ? <PlayCircle size={16} /> : undefined}
            onClick={status === "Telah dijadualkan" ? onStart : undefined}
            disabled={status !== "Telah dijadualkan"}
            sx={{ ml: 'auto' }}
          >
            {status === "Telah dijadualkan" ? `Mula ${observationType}` : "Belum Dijadualkan"}
          </Button>
        )}
      </Box>

      <Card
        sx={{
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }}
      >
        <CardContent>
          {/* Header Section */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            {/* Teacher Avatar */}
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: getAvatarColor(teacherName),
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {getInitials(teacherName)}
            </Avatar>

            {/* Teacher Info */}
            <Box sx={{ flex: 1, ml: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                {teacherName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subject} • {className}
              </Typography>
            </Box>

            {/* Observation Type Badge */}
            <Chip
              label={observationType}
              color={observationType === "Cerapan 1" ? "primary" : "secondary"}
              sx={{
                borderRadius: "16px",
                fontWeight: 500,
                mr: 1,
              }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={onEdit}
                  sx={{
                    border: "1px solid",
                    borderColor: "grey.400",
                    color: "grey.700",
                    "&:hover": {
                      borderColor: "grey.600",
                      bgcolor: "grey.50",
                    },
                  }}
                >
                  <Edit size={18} />
                </IconButton>
              )}
              {onDelete && (
                <IconButton
                  size="small"
                  onClick={onDelete}
                  sx={{
                    border: "1px solid",
                    borderColor: "error.main",
                    color: "error.main",
                    "&:hover": {
                      borderColor: "error.dark",
                      bgcolor: "error.50",
                    },
                  }}
                >
                  <Trash2 size={18} />
                </IconButton>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Grey Info Section */}
          <Box
            sx={{
              bgcolor: "grey.100",
              borderRadius: 1,
              p: 1.5,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2">
              <strong>Pemerhati:</strong> {observerName} ({observerTitle})
            </Typography>
            <Typography variant="body2">
              <strong>Rubrik:</strong> {rubric}
            </Typography>
          </Box>

          {/* Details Row */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Calendar size={16} color="#666" />
              <Typography variant="body2" color="text.secondary">
                {date}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Clock size={16} color="#666" />
              <Typography variant="body2" color="text.secondary">
                {time}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <FileText size={16} color="#666" />
              <Typography variant="body2" color="text.secondary">
                Tahun {year}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

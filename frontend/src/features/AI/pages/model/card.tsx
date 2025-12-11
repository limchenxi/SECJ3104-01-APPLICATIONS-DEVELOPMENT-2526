import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Stack,
  Typography,
  Chip,
  FormControlLabel,
  Switch,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { AIModule } from "../../type";

interface AIModuleCardProps {
  module: AIModule;
  onEdit?: (module: AIModule) => void;
  onDelete?: (id: string) => void;
  onToggleEnabled?: (id: string, enabled: boolean) => void;
}

export default function AIModuleCard({
  module,
  onEdit,
  onDelete,
  onToggleEnabled,
}: AIModuleCardProps) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3 }}>
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={600}>
            {module.name}
          </Typography>
        }
        subheader={`${module.provider} • ${module.model}`}
        action={
          <Stack direction="row" spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={module.enabled}
                  onChange={(e) =>
                    onToggleEnabled?.(module._id, e.target.checked)
                  }
                  size="small"
                />
              }
              label={module.enabled ? "Enabled" : "Disabled"}
              labelPlacement="start"
              sx={{ m: 0 }}
            />
            <IconButton onClick={() => onEdit?.(module)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton onClick={() => onDelete?.(module._id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        }
      />

      <CardContent>
        {module.description && (
          <Typography mb={1} color="text.secondary">
            {module.description}
          </Typography>
        )}

        {module.tags?.length ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" mb={1}>
            {module.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
            ))}
          </Stack>
        ) : null}

        <Typography variant="caption" color="text.secondary">
          Updated: {new Date(module.updatedAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}

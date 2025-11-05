import {
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import type { AIGeneratedItem } from "../type";

interface AIListProps {
  items: AIGeneratedItem[];
}

export default function AIList({ items }: AIListProps) {
  if (!items.length) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography color="text.secondary">
            Tiada kandungan dijana setakat ini.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {items.map((item) => (
        <Card key={item.id} variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="h6">{item.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {item.description}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {item.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Dijana pada {new Date(item.createdAt).toLocaleString()}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}

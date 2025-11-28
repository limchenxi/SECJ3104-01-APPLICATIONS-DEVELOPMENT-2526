import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { RPH } from "../type";

interface Props {
  onSelect: (item: RPH) => void;
  onDelete: (id: string) => void;
}

const History = forwardRef(({ onSelect, onDelete }: Props, ref) => {
  const [list, setList] = useState<RPH[]>([]);

  async function loadHistory() {
    const res = await fetch("/api/rph");
    const data = await res.json();
    setList(data);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // expose refresh() to parent component
  useImperativeHandle(ref, () => ({
    refresh() {
      loadHistory();
    }
  }));

  return (
    <Box sx={{ width: 350 }}>
      <Typography variant="h6" gutterBottom>
        Sejarah RPH
      </Typography>

      {list.map((item) => (
        <Card
          key={item._id}
          variant="outlined"
          sx={{
            mb: 2,
            borderRadius: 3,
            cursor: "pointer",
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
          onClick={() => onSelect(item)}
        >
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {item.title}
              </Typography>

              <Box>
                {/* <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(item);
                  }}
                >
                  <EditIcon />
                </IconButton> */}

                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item._id);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Typography variant="body2" color="text.secondary">
              {item.date} • {item.duration}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
});

export default History;

import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Divider,
} from "@mui/material";
import { Delete, Restore } from "@mui/icons-material";
import type { RPH } from "../type";
import { getAuthToken } from "../../../utils/auth";
import useAuth from "../../../hooks/useAuth";
import { backendClient } from "../../../utils/axios-client";

interface Props {
  onSelect: (item: RPH) => void;
  onDelete: (id: string) => void;
}

const History = forwardRef(({ onSelect, onDelete }: Props, ref) => {
  const { user } = useAuth();
  const [list, setList] = useState<RPH[]>([]);

  async function loadHistory() {
    try {
      const client = backendClient(); 
      const res = await client.get("/rph"); 
      setList(res.data);
    } catch (err) {
      console.error("Failed to load RPH history", err);
    }
    // const token = getAuthToken();
    // const res = await fetch("/api/rph", {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });
    // const data = await res.json();
    // setList(data);
  }

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setList([]); // Clear list on logout
    }
  }, [user]);

  // expose refresh() to parent component
  useImperativeHandle(ref, () => ({
    refresh() {
      loadHistory();
    }
  }));

  return (
    <Box sx={{ width: 350 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        <Restore /> Sejarah RPH
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
                    if (item._id) onDelete(item._id);
                  }}
                >
                  <Delete />
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

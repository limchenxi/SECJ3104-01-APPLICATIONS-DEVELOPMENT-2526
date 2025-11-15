import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { DataGrid, type GridColDef, type GridRenderCellParams } from "@mui/x-data-grid";
import { userApi } from "../api";
import type { UserItem } from "../stores";
import { Plus, Trash2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";

export default function UserListPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "GURU",
    ic: "",
    gender: "",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser() {
    try {
      await userApi.create(newUser);
      setOpenAddDialog(false);
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  async function handleEditUser(updatedRow: { [x: string]: string; id: string; }) {
  try {
    const { id, ...data } = updatedRow;
    await userApi.update(id, data); 
    enqueueSnackbar("User updated successfully", { variant: "success" });
    fetchUsers(); 
    return updatedRow; 
  } catch (error) {
    console.error("Error updating user:", error);
    enqueueSnackbar("Failed to update user", { variant: "error" });
    throw error;
  }
}

  async function handleDeleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await userApi.delete(id);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nama", flex: 1, editable: true },
    { field: "email", headerName: "Emel", flex: 1.2, editable: true },
    { field: "role", headerName: "Peranan", flex: 0.8, editable: true },
    { field: "ic", headerName: "IC", flex: 1, editable: true },
    { field: "gender", headerName: "Jantina", flex: 0.6, editable: true },
    {
      field: "actions",
      headerName: "Tindakan",
      flex: 0.6,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          color="error"
          size="small"
          startIcon={<Trash2 size={16} />}
          onClick={() => handleDeleteUser(params.row._id || params.row.id)}
        >
          Padam
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom color="primary">
        Senarai Pengguna
      </Typography>

      <Button
        variant="contained"
        startIcon={<Plus />}
        sx={{ mb: 2 }}
        onClick={() => setOpenAddDialog(true)}
      >
        Tambah Pengguna
      </Button>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={users.map((u) => ({ id: u._id || u.id, ...u }))}
          columns={columns}
          disableRowSelectionOnClick
          processRowUpdate={handleEditUser}
          autoHeight
          sx={{
            bgcolor: "background.paper",
            boxShadow: 2,
            borderRadius: 2,
            "& .MuiDataGrid-columnHeaders": {
              bgcolor: "primary.light",
              color: "white",
              fontWeight: "bold",
            },
          }}
        />
      )}

      {/* Dialog Tambah Pengguna */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)}>
        <DialogTitle>Tambah Pengguna Baru</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Nama"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <TextField
            label="Emel"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <TextField
            label="Kata Laluan"
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <TextField
            label="Peranan"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          />
          <TextField
            label="IC"
            value={newUser.ic}
            onChange={(e) => setNewUser({ ...newUser, ic: e.target.value })}
          />
          <TextField
            label="Jantina (Male/Female)"
            value={newUser.gender}
            onChange={(e) => setNewUser({ ...newUser, gender: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Batal</Button>
          <Button variant="contained" onClick={handleAddUser}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

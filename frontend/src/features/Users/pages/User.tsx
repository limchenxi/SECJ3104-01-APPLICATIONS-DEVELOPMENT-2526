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
  Stack,
  MenuItem, // Diimpor untuk select input
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowModel, // Diimpor untuk tipe processRowUpdate
} from "@mui/x-data-grid";
import { userApi } from "../api";
import type { UserItem, UpdateUserPayload } from "../stores"; // Import UpdateUserPayload
import { Plus, Trash2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { People } from "@mui/icons-material";

// Definisikan tipe untuk opsi role dan gender (sesuai dengan UserItem)
type Role = "GURU" | "PENTADBIR" | "SUPERADMIN";
type Gender = "Male" | "Female";

// Opsi untuk select input
const roleOptions: Role[] = ["GURU", "PENTADBIR", "SUPERADMIN"];
const genderOptions: Gender[] = ["Male", "Female"];

export default function UserList() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  // Perbarui inisialisasi untuk memastikan nilai role dan gender valid
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "GURU" as Role, // Tetapkan tipe Role
    ic: "",
    gender: "Male" as Gender, // Tetapkan tipe Gender
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      // Pastikan data yang diterima memiliki id yang tepat untuk DataGrid
      setUsers(data.map(u => ({ ...u, id: u._id || u.id! }))); 
    } catch (error) {
      console.error("Error fetching users:", error);
      enqueueSnackbar("Gagal memuat pengguna", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddUser() {
    try {
      if (!newUser.name || !newUser.email || !newUser.password) {
        enqueueSnackbar("Nama, Emel, dan Kata Laluan diperlukan.", { variant: "warning" });
        return;
      }
      // Payload yang sesuai dengan CreateUserPayload
      await userApi.create({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
        ic: newUser.ic,
        gender: newUser.gender,
      } as any); // Type assertion, as API expects some fields but allows others

      enqueueSnackbar("Pengguna berjaya ditambah", { variant: "success" });
      setOpenAddDialog(false);
      // Reset state untuk form tambah pengguna
      setNewUser({
        name: "", email: "", password: "", role: "GURU" as Role, ic: "", gender: "Male" as Gender,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      enqueueSnackbar("Gagal menambah pengguna", { variant: "error" });
    }
  }

  // Perbaiki implementasi untuk processRowUpdate
  const handleEditUser = async (newRow: GridRowModel, oldRow: GridRowModel): Promise<GridRowModel> => {
    const id = newRow.id as string; 
    const updatedFields: UpdateUserPayload = {};
    
    if (newRow.name !== oldRow.name) updatedFields.name = newRow.name;
    if (newRow.email !== oldRow.email) updatedFields.email = newRow.email; 
    if (newRow.role !== oldRow.role) updatedFields.role = newRow.role;    
    if (newRow.ic !== oldRow.ic) updatedFields.ic = newRow.ic;            
    if (newRow.gender !== oldRow.gender) updatedFields.gender = newRow.gender; 

    if (Object.keys(updatedFields).length === 0) {
      return oldRow; // 无变化
    }
    
    try {
      await userApi.update(id, updatedFields as any); 
      
      enqueueSnackbar("Pengguna berjaya dikemaskini", { variant: "success" });

      return newRow;
    } catch (error) {
      console.error("Error updating user:", error);
      // enqueueSnackbar("Gagal mengemaskini pengguna", { variant: "error" });
      throw error; 
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm("Adakah anda pasti ingin memadam pengguna ini?")) return;
    try {
      await userApi.delete(id);
      enqueueSnackbar("Pengguna berjaya dipadam", { variant: "success" });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      enqueueSnackbar("Gagal memadam pengguna", { variant: "error" });
    }
  }

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nama", flex: 1, editable: true },
    { field: "email", headerName: "Emel", flex: 1.2, editable: true },
    { 
      field: "role", 
      headerName: "Peranan", 
      flex: 0.8, 
      editable: true,
      type: 'singleSelect', // Mengaktifkan select input saat edit
      valueOptions: roleOptions, // Opsi untuk select
    },
    { field: "ic", headerName: "IC", flex: 1, editable: true },
    { 
      field: "gender", 
      headerName: "Jantina", 
      flex: 0.6, 
      editable: true,
      type: 'singleSelect', // Mengaktifkan select input saat edit
      valueOptions: genderOptions, // Opsi untuk select
    },
    {
      field: "actions",
      headerName: "Tindakan",
      flex: 0.6,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          color="error"
          size="small"
          startIcon={<Trash2 size={16} />}
          // Gunakan params.id yang telah dipetakan
          onClick={() => handleDeleteUser(params.id as string)} 
        >
          Padam
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, maxWidth: "xl", mx: "auto" }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            <People color="primary" fontSize="large"/> Senarai Pengguna
          </Typography>
        </Box>

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
            // Rows sudah di-map di fetchUsers
            rows={users} 
            columns={columns}
            disableRowSelectionOnClick
            processRowUpdate={handleEditUser}
            onProcessRowUpdateError={(error) => {
              console.error("DataGrid Rollback Error:", error);
              enqueueSnackbar("Gagal mengemaskini pengguna", { variant: "error" });
            }}
            autoHeight
            sx={{
              bgcolor: "background.paper",
              boxShadow: 2,
              borderRadius: 2,
              // 针对整个列头容器的样式
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "primary.light",
              },
              // 针对列头标题文本的样式
              "& .MuiDataGrid-columnHeaderTitle": {
                color: "black", // 字体颜色：黑色
                fontSize: "1rem", // 字体大小：改为 1rem (相当于默认的 h6 或 body1)
                fontWeight: 700, // 字体粗细：使用 700 或 800 (更粗)
                // 如果想要更大，可以尝试 1.1rem 或 1.2rem
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
              select // Diubah menjadi select
              label="Peranan"
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="IC"
              value={newUser.ic}
              onChange={(e) => setNewUser({ ...newUser, ic: e.target.value })}
            />
            <TextField
              select // Diubah menjadi select
              label="Jantina"
              value={newUser.gender}
              onChange={(e) => setNewUser({ ...newUser, gender: e.target.value as Gender })}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)}>Batal</Button>
            <Button variant="contained" onClick={handleAddUser}>
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}
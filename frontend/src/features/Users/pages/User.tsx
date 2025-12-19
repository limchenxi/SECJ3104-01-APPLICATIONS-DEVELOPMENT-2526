import { useCallback, useEffect, useState } from "react";
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
  MenuItem,
  useTheme,
  Chip,
  FormControl,
  Alert,
  Select,
  InputLabel, 
} from "@mui/material";
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  type GridRowModel, 
} from "@mui/x-data-grid";
import { userApi} from "../api";
import { Pen, Plus, Trash2 } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { Edit, People } from "@mui/icons-material";
import type { UserItem, UpdateUserPayload, UserRole, UserGender, CreateUserPayload } from "../type";

const roleOptions: UserRole[] = ["GURU", "PENTADBIR", "SUPERADMIN"];
const genderOptions: UserGender[] = ["Male", "Female"];

const initialNewUser = {
  name: "",
  email: "",
  password: "",
  role: ["GURU"],
  ic: "",
  gender: "Male",
};

const confirmDelete = (message: string) => {
    return window.confirm(message);
};
// const MOCK_USERS: UserItem[] = [
//     { id: 'u1', name: 'Alice Smith', email: 'alice@test.com', role: ['GURU'], ic: '111', gender: 'Female' },
//     { id: 'u2', name: 'Bob Johnson', email: 'bob@test.com', role: ['PENTADBIR', 'GURU'], ic: '222', gender: 'Male' },
//     { id: 'u3', name: 'Charlie Doe', email: 'charlie@test.com', role: ['SUPERADMIN'], ic: '333', gender: 'Male' },
//     { id: 'u4', name: 'Diana Prince', email: 'diana@test.com', role: ['GURU', 'SUPERADMIN'], ic: '444', gender: 'Female' },
//     { id: 'u5', name: 'Empty Role', email: 'empty@test.com', role: [], ic: '555', gender: 'Female' },
// ];

export default function UserList() {
  const theme = useTheme();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserItem | null>(null);
  // const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  // const [userToDeleteId, setUserToDeleteId] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<CreateUserPayload>(initialNewUser);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      // const data = MOCK_USERS as UserItem[];
      const data = await userApi.getAll();

      const mappedData = data.map(u => ({ 
          ...u, 
          role: u.role || [], 
          id: u.id || u._id || String(Math.random()) 
      }));      
      setUsers(mappedData); 
      
    } catch (error) {
      console.error("Error fetching users:", error);
      enqueueSnackbar("Gagal memuat pengguna", { variant: "error" });
      // setUsers(MOCK_USERS as UserItem[]);
    } finally {
      setLoading(false);
    }
  }
  async function handleAddUser() {
    try {
      if (!newUser.name || !newUser.email || !newUser.password || !newUser.ic || !newUser.gender || !newUser.role || newUser.role.length === 0) {
        enqueueSnackbar("Sila isi Nama, Emel, Kata Laluan, IC, Jantina dan sekurang-kurangnya satu Peranan.", { variant: 'warning' });
        return;
      }

      await userApi.create(newUser);

      enqueueSnackbar("Pengguna berjaya ditambah", { variant: "success" });
      setOpenAddDialog(false);

      setNewUser(initialNewUser);
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = (error as any).response?.data?.message || (error as any).message || "Gagal menambah pengguna. Sila semak konsol untuk butiran.";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  }

  const handleEditUser = useCallback(async (newRow: GridRowModel, oldRow: GridRowModel): Promise<GridRowModel> => {
    const id = newRow.id as string; 
    const updatedFields: UpdateUserPayload = {};

    if (newRow.name !== oldRow.name) updatedFields.name = newRow.name;
    if (newRow.email !== oldRow.email) updatedFields.email = newRow.email; 
    // if (newRow.role !== oldRow.role) updatedFields.role = newRow.role as UserRole[];
    if (newRow.ic !== oldRow.ic) updatedFields.ic = newRow.ic;
    if (newRow.gender !== oldRow.gender) updatedFields.gender = newRow.gender as UserGender; 
    
    if (Object.keys(updatedFields).length === 0) {
      return oldRow; 
    }

    try {
      await userApi.update(id, updatedFields); 
      enqueueSnackbar("Pengguna berjaya dikemaskini", { variant: "success" });
      return newRow;
    } catch (error) {
      console.error("Error updating user:", error);
      const errorMessage = (error as any).response?.data?.message || (error as any).message || "Gagal mengemaskini pengguna.";
      enqueueSnackbar(errorMessage, { variant: "error" });
      throw error; 
    }
   }, []);

  async function handleDeleteUser(id: string) {
    if (!confirmDelete("Adakah anda pasti ingin memadam pengguna ini?")) return;
    try {
      await userApi.delete(id);
      enqueueSnackbar("Pengguna berjaya dipadam", { variant: "success" });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      const errorMessage = (error as any).response?.data?.message || (error as any).message || "Gagal memadam pengguna.";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  }
  const handleOpenRoleEdit = (user: UserItem) => {
    setUserToEdit({...user});
    setOpenRoleDialog(true);
  };
  
  const handleSaveRoleEdit = async () => {
    if (!userToEdit || userToEdit.role.length === 0) {
        enqueueSnackbar("Pengguna mesti mempunyai sekurang-kurangnya satu peranan.", { variant: 'warning' });
        return;
    }
    
    try {
        const payload: UpdateUserPayload = { role: userToEdit.role };
        await userApi.update(userToEdit.id, payload); 
        
        enqueueSnackbar(`Peranan ${userToEdit.name} berjaya dikemaskini (Mock).`, { variant: 'success' });
        setOpenRoleDialog(false);
        setUserToEdit(null);
        fetchUsers(); 
    } catch(error) {
        const errorMessage = (error as any).response?.data?.message || (error as any).message || "Gagal mengemaskini peranan.";
        enqueueSnackbar(errorMessage, { variant: 'error' });
        console.error("Role update failed:", error);
    }
  };

  const columns: GridColDef[] = [
    { field: "name", headerName: "Nama", flex: 1, editable: true },
    { field: "email", headerName: "Emel", flex: 1.2, editable: true },
    { 
      field: "role", 
      headerName: "Peranan", 
      flex: 1, 
      editable: false, 
      renderCell: (params: GridRenderCellParams<UserItem, UserRole[]>) => {
        const roles = params.value;
        const hasRoles = roles && Array.isArray(roles) && roles.length > 0;
        
        return (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', py: 1, alignItems: 'center', height: '100%' }}>
            {hasRoles ? (
                roles.map((role) => (
                    <Chip 
                    key={role} 
                    label={role} 
                    size="small" 
                    sx={{
                        bgcolor: role === 'SUPERADMIN' ? theme.palette.error.main + '20' : (role === 'PENTADBIR' ? theme.palette.warning.main + '20' : theme.palette.info.main + '20'),
                        color: role === 'SUPERADMIN' ? theme.palette.error.dark : (role === 'PENTADBIR' ? theme.palette.warning.dark : theme.palette.info.dark),
                        fontWeight: 'bold',
                        height: 24,
                    }}
                    />
                ))
            ) : (
                <Typography variant="caption" sx={{ color: theme.palette.grey[400] }}>
                    Tiada Peranan
                </Typography>
            )}
          </Stack>
        );
      },
    },
    { field: "ic", headerName: "IC", flex: 1, editable: true },
    { 
      field: "gender", 
      headerName: "Jantina", 
      flex: 0.6, 
      editable: true,
      type: 'singleSelect', 
      valueOptions: genderOptions, 
    },
    {
      field: "actions",
      headerName: "Tindakan",
      flex: 0.8,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => {
        const user = params.row as UserItem;
        return (
          <Stack direction="row" spacing={1}>
            <Button
              color="primary"
              size="small"
              startIcon={<Pen size={16} />}
              onClick={() => handleOpenRoleEdit(user)}
              sx={{ minWidth: 0, p: '4px 8px' }}
            >
              Role
            </Button>
            <Button
              color="error"
              size="small"
              startIcon={<Trash2 size={16} />}
              onClick={() => handleDeleteUser(params.id as string)} 
              sx={{ minWidth: 0, p: '4px 8px' }}
            >
              Padam
            </Button>
          </Stack>
        );
      },
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
          <Typography variant="body2" color="text.secondary">
            Pengurusan akaun pengguna (Semua pengguna boleh diuruskan)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus />}
          sx={{ mb: 2, alignSelf: 'flex-start' }}
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
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: theme.palette.info.light,
              },
              "& .MuiDataGrid-columnHeaderTitle": {
                color: theme.palette.primary.dark,// 字体颜色：黑色
                fontSize: "1rem", // 字体大小：改为 1rem (相当于默认的 h6 或 body1)
                fontWeight: 700, // 字体粗细：使用 700 或 800 (更粗)
                // 如果想要更大，可以尝试 1.1rem 或 1.2rem
              },
              "& .MuiDataGrid-row": {
                  minHeight: '52px !important', 
                  maxHeight: 'none !important',
              }
            }}
          />
        )}

        {/* Dialog Tambah Pengguna */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} fullWidth maxWidth="sm">
          <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nama"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              required
            />
            <TextField
              label="Emel"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              required
            />
            <TextField
              label="Kata Laluan"
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              required
            />
            <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel id="add-role-select-label">Peranan</InputLabel>
                <Select
                    labelId="arole-select-label"
                    multiple 
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole[] })} 
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
                      </Box>
                    )}
                    label="Peranan"
                >
                        {roleOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            <TextField
              label="IC"
              value={newUser.ic}
              onChange={(e) => setNewUser({ ...newUser, ic: e.target.value })}
              required
            />
            <TextField
              select 
              label="Jantina"
              value={newUser.gender}
              onChange={(e) => setNewUser({ ...newUser, gender: e.target.value as UserGender })}
              required
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
        {/* Dialog Edit Peranan (Role) */}
        <Dialog open={openRoleDialog} onClose={() => setOpenRoleDialog(false)} fullWidth maxWidth="xs">
            <DialogTitle>Edit Peranan Pengguna: {userToEdit?.name}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel id="edit-role-select-label">Peranan</InputLabel>
                    <Select
                        labelId="edit-role-select-label"
                        multiple 
                        value={userToEdit?.role || []}
                        onChange={(e) => {
                            const newRoles = e.target.value as UserRole[];
                            setUserToEdit(prev => prev ? ({ ...prev, role: newRoles }) : null);
                        }}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                ))}
                            </Box>
                        )}
                        label="Peranan"
                    >
                        {roleOptions.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {userToEdit?.role.includes("SUPERADMIN") && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Peranan SUPERADMIN memerlukan kebenaran khas.
                    </Alert>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setOpenRoleDialog(false)}>Batal</Button>
                <Button variant="contained" onClick={handleSaveRoleEdit} color="primary" disabled={!userToEdit || userToEdit.role.length === 0}>
                    Simpan Perubahan
                </Button>
            </DialogActions>
        </Dialog>
      </Stack>
    </Box>
  );
}

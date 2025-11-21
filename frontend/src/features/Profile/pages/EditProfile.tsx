import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { enqueueSnackbar } from "notistack";
import { useStore } from "@tanstack/react-store";
import { profileStore } from "../store";
import { loadProfile, updateProfile } from "../api";

export default function EditProfile() {
  const profileState = useStore(profileStore);
  const { data: profile, isLoading } = profileState;

  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    ic: "",
    contactNumber: "",
    role: "",
    profilePicture: "",
  });

  const navigate = useNavigate();

  // Load profile
  useEffect(() => {
    loadProfile();
  }, []);

  // Sync profile -> form
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile.name || "",
        email: profile.email || "",
        gender: profile.gender || "",
        ic: profile.ic || "",
        contactNumber: profile.contactNumber || "",
        role: profile.role || "",
        profilePicture: profile.profilePicture || "",
      });
    }
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
  try {

    await updateProfile({
      name: form.name,
      email: form.email,
      gender: form.gender as "Male" | "Female",
      ic: form.ic,
      contactNumber: form.contactNumber,
      role: form.role as "GURU" | "PENTADBIR" | "SUPERADMIN",
      profilePicture: form.profilePicture,
    });

    enqueueSnackbar("Profil berjaya dikemas kini!", { variant: "success" });
    navigate("/profile");

  } catch (error) {
    enqueueSnackbar("Gagal menyimpan perubahan", { variant: "error" });
  }
};

  if (isLoading) return <CircularProgress />;

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Edit Profil
      </Typography>

      <Card sx={{ p: 3, maxWidth: 700 }}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* --- Personal Info --- */}
          <TextField
            label="Nama"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            fullWidth
          />

          <TextField
            label="Emel"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            fullWidth
          />

          <TextField
            label="No. Telefon"
            value={form.contactNumber}
            onChange={(e) => handleChange("contactNumber", e.target.value)}
            fullWidth
          />

          <TextField
            label="IC"
            value={form.ic}
            onChange={(e) => handleChange("ic", e.target.value)}
            fullWidth
          />

          <TextField
            select
            label="Jantina"
            value={form.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            fullWidth
          >
            <MenuItem value="Male">Lelaki</MenuItem>
            <MenuItem value="Female">Perempuan</MenuItem>
          </TextField>

          <TextField
            label="Peranan"
            value={form.role}
            fullWidth
            InputProps={{ readOnly: true }}
            helperText="Peranan tidak boleh diubah"
          />

          {/* --- Profile Picture --- */}
          <TextField
            label="Gambar Profil (URL)"
            value={form.profilePicture}
            onChange={(e) => handleChange("profilePicture", e.target.value)}
            fullWidth
            helperText="Masukkan pautan gambar profil"
          />

          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            {form.profilePicture && (
              <img
                src={form.profilePicture}
                alt="Profile"
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            )}
          </Box>

          {/* --- Buttons --- */}
          <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate("/profile")}>
              Batal
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Simpan
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

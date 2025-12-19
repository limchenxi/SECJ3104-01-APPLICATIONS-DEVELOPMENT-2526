import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from "@mui/material";
import axios, { AxiosError } from "axios";
import { resolveRedirectPath } from "../../../utils/navigation";
import useAuth from "../../../hooks/useAuth";
import type { UserRole } from "../../Users/type";
const getHighestRole = (roles: UserRole[] | undefined): UserRole | null => {
  if (!roles || roles.length === 0) return null;
  if (roles.includes("SUPERADMIN")) return "SUPERADMIN";
  if (roles.includes("PENTADBIR")) return "PENTADBIR";
  if (roles.includes("GURU")) return "GURU";
  return null;
};
export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = resolveRedirectPath(searchParams.get("redirect"), "/");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await login(form.email, form.password);

      // Role-based redirect
      // if (response?.user?.role === 'PENTADBIR') {
      //   navigate('/dashboard/pentadbir', { replace: true });
      // } else if (response?.user?.role === 'GURU') {
      //   navigate('/dashboard/guru', { replace: true });
      // } else if (response?.user?.role === 'SUPERADMIN') {
      //   navigate('/dashboard/superadmin', { replace: true });
      // } else {
      //   navigate(redirectTo, { replace: true });
      // }
      const roles = response?.user?.role;
      const highestRole = getHighestRole(roles);
      if (highestRole === "SUPERADMIN") {
        navigate("/dashboard/superadmin", { replace: true });
      } else if (highestRole === "PENTADBIR") {
        navigate("/dashboard/pentadbir", { replace: true });
      } else if (highestRole === "GURU") {
        navigate("/dashboard/guru", { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMsg = err?.response?.data?.message || err?.message || "Log masuk gagal. Sila semak emel dan kata laluan anda.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Paper sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>

        {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
                {error}
            </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            fullWidth
            margin="normal"
            onChange={handleChange}
             value={form.email}
             disabled={loading}
          />
          <TextField
            name="password"
            type="password"
            label="Password"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

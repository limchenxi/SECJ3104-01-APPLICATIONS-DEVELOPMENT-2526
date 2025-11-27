import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Button, TextField, Typography, Paper } from "@mui/material";
import axios, { AxiosError } from "axios";
import { resolveRedirectPath } from "../../../utils/navigation";
import useAuth from "../../../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = resolveRedirectPath(searchParams.get("redirect"), "/");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(form.email, form.password);
      
      // Role-based redirect
      if (response?.user?.role === 'PENTADBIR') {
        navigate('/dashboard/pentadbir', { replace: true });
      } else if (response?.user?.role === 'GURU') {
        navigate('/dashboard/guru', { replace: true });
      } else if (response?.user?.role === 'SUPERADMIN') {
        navigate('/superadmin/dashboard', { replace: true });
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err: any) {
      alert(err?.response?.data?.msg || "Login failed");
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
      <Paper sx={{ p: 4, width: 350 }}>
        <Typography variant="h5" gutterBottom>
          Login
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            fullWidth
            margin="normal"
            onChange={handleChange}
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
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

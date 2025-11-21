import { Avatar, Box, Button, Card, CardContent, CardHeader, CircularProgress, Grid, Typography } from "@mui/material";
import { User, Mail, Phone, Briefcase, Calendar, Edit, Lock, School } from "lucide-react";
import { loadProfile, profileStore } from "../store";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@tanstack/react-store";

export default function Profile() {
  const profileState = useStore(profileStore);
  const { data: profile, isLoading } = profileState;
  const navigate = useNavigate();

   useEffect(() => {
    loadProfile();
  }, []);


  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  // if (error) return <Typography color="error">{error}</Typography>;
  if (!profile) return <Typography>No profile found.</Typography>;

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Profil Pengguna
        </Typography>
        <Typography color="text.secondary">
          Maklumat peribadi dan tetapan akaun
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 3 }}>
          <Avatar
            src={profile.profilePicture}
            sx={{ width: 120, height: 120, fontSize: 48, bgcolor: "primary.main" }}
          >
            {profile.name[0]}
          </Avatar>

          <Box sx={{ textAlign: { xs: "center", md: "left" }, flexGrow: 1 }}>
            <Typography variant="h5" color="primary.dark">
              {profile.name}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {profile.role}
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: { xs: "center", md: "flex-start" } }}>
              {/* <Button variant="contained" startIcon={<Edit />}>Edit Profil</Button>
              <Button variant="outlined" startIcon={<Lock />}>Tukar Kata Laluan</Button> */}
              <Button
                variant="contained"
                startIcon={<Edit />}
                onClick={() => navigate("/profile/edit")}
              >
                Edit Profil
              </Button>
              {/* <Button variant="outlined" startIcon={<Lock />}>
                Tukar Kata Laluan
              </Button> */}
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        <Grid size={12}>
          <Card>
            <CardHeader
              title={<Box display="flex" alignItems="center" gap={1}><User size={20} /> Maklumat Peribadi</Box>}
            />
            <CardContent>
              <InfoItem icon={<User />} label="Nama Penuh" value={profile.name} />
              <InfoItem icon={<Mail />} label="Emel" value={profile.email} />
              <InfoItem icon={<Mail />} label="Jantina" value={profile.gender} />
              <InfoItem icon={<Phone />} label="No. Telefon" value={profile.contactNumber ?? "-"} />
              <InfoItem icon={<Briefcase />} label="Peranan" value={profile.role} />
              <InfoItem icon={<Calendar />} label="IC" value={profile.ic} />
            </CardContent>
          </Card>
        </Grid>

        {/* <Grid size={12}>
          <Card>
            <CardHeader
              title={<Box display="flex" alignItems="center" gap={1}><School size={20} /> Maklumat Sekolah</Box>}
            />
            <CardContent>
              <Typography fontWeight="bold">Nama Sekolah</Typography>
              <Typography sx={{ mb: 2 }}>{profile.school ?? "Tidak Ditetapkan"}</Typography>
              <Typography fontWeight="bold">Subjek</Typography>
              <Typography>{profile.subject ?? "-"}</Typography>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>
    </Box>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon}
      <Box>
        <Typography color="text.secondary" fontSize={14}>{label}</Typography>
        <Typography>{value}</Typography>
      </Box>
    </Box>
  );
}
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
} from "@mui/material";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Lock,
  School,
} from "lucide-react";

export default function ProfilePage() {
  return (
    <Box sx={{ p: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" color="primary" gutterBottom>
          Profil Pengguna
        </Typography>
        <Typography color="text.secondary">
          Maklumat peribadi dan tetapan akaun
        </Typography>
      </Box>

      {/* Profile Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", gap: 3 }}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              fontSize: 48,
              bgcolor: "primary.main",
            }}
          >
            CA
          </Avatar>

          <Box sx={{ textAlign: { xs: "center", md: "left" }, flexGrow: 1 }}>
            <Typography variant="h5" color="primary.dark">
              Cikgu Ahmad Abdullah
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Guru
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: { xs: "center", md: "flex-start" } }}>
              <Button variant="contained" startIcon={<Edit />}>
                Edit Profil
              </Button>
              <Button variant="outlined" startIcon={<Lock />}>
                Tukar Kata Laluan
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Personal Info + School Info */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Personal Information */}
        <Grid size={12}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <User size={20} /> Maklumat Peribadi
                </Box>
              }
            />
            <CardContent>
              <InfoItem icon={<User />} label="Nama Penuh" value="Ahmad bin Abdullah" />
              <InfoItem icon={<Mail />} label="Emel" value="ahmad.abdullah@skbandarjaya.edu.my" />
              <InfoItem icon={<Phone />} label="No. Telefon" value="+60 12-345 6789" />
              <InfoItem icon={<Briefcase />} label="Jawatan" value="Pentadbir / Guru Kanan" />
              <InfoItem icon={<Calendar />} label="Tarikh Mula Bertugas" value="15 Januari 2018" />
            </CardContent>
          </Card>
        </Grid>

        {/* School Information */}
        <Grid size={12}>
          <Card>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <School size={20} /> Maklumat Sekolah
                </Box>
              }
            />
            <CardContent>
              <Typography fontWeight="bold">Nama Sekolah</Typography>
              <Typography sx={{ mb: 2 }}>Sekolah Kebangsaan Bandar Jaya</Typography>

              <Typography fontWeight="bold">Alamat</Typography>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 2 }}>
                <MapPin size={18} />
                <Box>
                  <Typography>Jalan Pendidikan 1/1</Typography>
                  <Typography>Taman Bandar Jaya</Typography>
                  <Typography>43650 Bandar Baru Bangi</Typography>
                  <Typography>Selangor</Typography>
                </Box>
              </Box>

              <Typography fontWeight="bold">Kod Sekolah</Typography>
              <Typography sx={{ mb: 2 }}>BEA1234</Typography>

              <Typography fontWeight="bold">PPD / Daerah</Typography>
              <Typography sx={{ mb: 2 }}>
                Pejabat Pendidikan Daerah Hulu Langat
              </Typography>

              <Typography fontWeight="bold">Negeri</Typography>
              <Typography>Selangor</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* System Info */}
      <Card sx={{ mb: 4 }}>
        <CardHeader title="Maklumat Sistem" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={12}>
              <Typography color="text.secondary">ID Pengguna</Typography>
              <Typography>USR2025001</Typography>
            </Grid>
            <Grid size={12}>
              <Typography color="text.secondary">Peranan</Typography>
              <Typography>Pentadbir (Admin)</Typography>
            </Grid>
            <Grid size={12}>
              <Typography color="text.secondary">Log Masuk Terakhir</Typography>
              <Typography>20 Okt 2025, 08:15 AM</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Stats */}
      <Grid container spacing={3}>
        <StatCard emoji="📊" label="Cerapan Selesai" value="36" color="primary" />
        <StatCard emoji="✅" label="Laporan Dijana" value="12" color="success" />
        <StatCard emoji="📅" label="Hari Bertugas" value="247" color="secondary" />
      </Grid>
    </Box>
  );
}

/* ✅ Helper Components */

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon}
      <Box>
        <Typography color="text.secondary" fontSize={14}>
          {label}
        </Typography>
        <Typography>{value}</Typography>
      </Box>
    </Box>
  );
}

function StatCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: "primary" | "success" | "secondary";
}) {
  return (
    <Grid size={12}>
      <Card sx={{ borderColor: `${color}.light` }}>
        <CardContent sx={{ textAlign: "center" }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              bgcolor: `${color}.lighter`,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <Typography fontSize={32}>{emoji}</Typography>
          </Box>
          <Typography color="text.secondary" fontSize={14}>
            {label}
          </Typography>
          <Typography variant="h6" color={`${color}.main`}>
            {value}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

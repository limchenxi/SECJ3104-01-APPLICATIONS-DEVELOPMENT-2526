import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  TextField,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Edit,
  Lock,
  School,
  Settings as SettingsIcon,
  Save, 
} from 'lucide-react';

const DataRow = styled(Box)(({ theme, special }) => ({
  display: 'flex',
  alignItems: special ? 'flex-start' : 'center',
  gap: theme.spacing(1.5),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: special ? theme.palette.primary.light + '10' : theme.palette.grey[50], 
  border: special ? `1px solid ${theme.palette.primary.light}50` : 'none',
  minHeight: 48, 
}));

const Label = styled(Typography)({
  fontSize: '0.875rem', 
  color: '#4b5563',
  marginBottom: '0.5rem',
});


export const ProfileField = ({ icon: Icon, label, value, name, isEditing, onChange }) => {
  return (
    <Box>
      <Label>{label}</Label>
      {isEditing ? (
        <TextField
          fullWidth
          size="small"
          name={name}
          value={value}
          onChange={onChange}
          InputProps={{
            startAdornment: (
              <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                <Icon size={20} color="#9ca3af" />
              </Box>
            ),
          }}
          disabled={name === 'email' || name === 'position'}
        />
      ) : (
        <DataRow>
          <Icon size={20} color="#9ca3af" /> {/* gray-400 */}
          <Typography color="text.primary">{value}</Typography>
        </DataRow>
      )}
    </Box>
  );
};



export function Profil() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Ahmad bin Abdullah',
    email: 'ahmad.abdullah@skbandarjaya.edu.my',
    phone: '+60 12-345 6789',
    position: 'Pentadbir / Guru Kanan',
    joinDate: '15 Januari 2018',
  });

  // Simulating the blue primary color from the original Tailwind classes
  const PRIMARY_BLUE = '#1e3a8a'; // blue-900
  const PRIMARY_TEXT = '#0b163d'; // dark text color
  const ACCENT_BLUE = '#2563eb'; // blue-600

  // The custom AvatarFallback gradient can be applied directly using sx
  const avatarFallbackStyles = {
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', // from-blue-500 to-blue-600
    color: 'white',
    fontSize: '2rem',
  };

  const handleEditClick = () => {
    setIsEditing(prev => !prev);
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // 实际应用中：在这里调用 NestJS API (ST4)
    console.log('Saving profile data:', profileData);
    setIsEditing(false);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 'lg', mx: 'auto' }}>
      <Stack spacing={4}>
        {/* Page Header */}
        <Box>
          <Typography variant="h4" component="h2" sx={{ color: PRIMARY_BLUE, mb: 1 }}>
            Profil Pengguna
          </Typography>
          <Typography color="text.secondary">
            Maklumat peribadi dan tetapan akaun
          </Typography>
        </Box>

        {/* Profile Header Card */}
        <Card raised sx={{ border: `1px solid #bfdbfe`, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'center', md: 'flex-start' }} spacing={3}>
              {/* Avatar */}
              <Avatar sx={{ height: 128, width: 128, border: '4px solid #dbeafe', bgcolor: 'transparent' }}>
                <Box sx={avatarFallbackStyles}>CA</Box>
              </Avatar>

              <Stack flexGrow={1} alignItems={{ xs: 'center', md: 'flex-start' }} spacing={1}>
                <Typography variant="h5" sx={{ color: PRIMARY_BLUE }}>
                  {profileData.fullName}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Pentadbir
                </Typography>

                <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} flexWrap="wrap">
                  {isEditing ? (
                    <Button
                      variant="contained"
                      startIcon={<Save size={18} />}
                      onClick={handleSave}
                      sx={{ bgcolor: '#10b981', '&:hover': { bgcolor: '#059669' } }} // green-600
                    >
                      Simpan Perubahan
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      startIcon={<Edit size={18} />}
                      onClick={handleEditClick}
                      sx={{ bgcolor: ACCENT_BLUE, '&:hover': { bgcolor: '#1d4ed8' } }}
                    >
                      Edit Profil
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<Lock size={18} />}
                    onClick={handleEditClick}
                    sx={{
                      borderColor: '#bfdbfe', // blue-200
                      color: '#1d4ed8', // blue-700
                      '&:hover': { bgcolor: '#eff6ff', borderColor: '#bfdbfe' }, // blue-50
                    }}
                  >
                    {isEditing ? 'Batal' : 'Tukar Kata Laluan'}
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={3}>
          {/* Personal Information */}
          <Grid item xs={12} lg={6}>
            <Card raised sx={{ boxShadow: 1 }}>
              <CardHeader
                title={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <UserIcon size={20} sx={{ color: PRIMARY_BLUE }} />
                    <Typography variant="h6" sx={{ color: PRIMARY_BLUE }}>
                      Maklumat Peribadi
                    </Typography>
                  </Stack>
                }
              />
              <CardContent>
                <Stack spacing={3}>
                  <ProfileField
                    icon={UserIcon}
                    label="Nama Penuh"
                    name="fullName"
                    value={profileData.fullName}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />

                  <ProfileField
                    icon={Mail}
                    label="Emel"
                    name="email"
                    value={profileData.email}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />

                  <ProfileField
                    icon={Phone}
                    label="No. Telefon"
                    name="phone"
                    value={profileData.phone}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />

                  <ProfileField
                    icon={Briefcase}
                    label="Jawatan"
                    name="position"
                    value={profileData.position}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />

                  <ProfileField
                    icon={Calendar}
                    label="Tarikh Mula Bertugas"
                    name="joinDate"
                    value={profileData.joinDate}
                    isEditing={isEditing}
                    onChange={handleChange}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* School Information (Retained as read-only for now) */}
          <Grid item xs={12} lg={6}>
            <Card raised sx={{ boxShadow: 1 }}>
              <CardHeader
                title={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <School size={20} sx={{ color: PRIMARY_BLUE }} />
                    <Typography variant="h6" sx={{ color: PRIMARY_BLUE }}>
                      Maklumat Sekolah
                    </Typography>
                  </Stack>
                }
              />
              <CardContent>
                <Stack spacing={3}>
                  {/* Nama Sekolah */}
                  <Box>
                    <Label>Nama Sekolah</Label>
                    <DataRow special> {/* Use special style for the highlighted box */}
                      <Typography sx={{ color: PRIMARY_BLUE, fontWeight: 'medium' }}>
                        Sekolah Kebangsaan Bandar Jaya
                      </Typography>
                    </DataRow>
                  </Box>

                  {/* Alamat */}
                  <Box>
                    <Label>Alamat</Label>
                    <DataRow special={false}>
                      <MapPin size={20} color="#9ca3af" />
                      <Stack spacing={0} alignItems="flex-start">
                        <Typography color={PRIMARY_TEXT}>Jalan Pendidikan 1/1</Typography>
                        <Typography color={PRIMARY_TEXT}>Taman Bandar Jaya</Typography>
                        <Typography color={PRIMARY_TEXT}>43650 Bandar Baru Bangi</Typography>
                        <Typography color={PRIMARY_TEXT}>Selangor</Typography>
                      </Stack>
                    </DataRow>
                  </Box>

                  {/* Kod Sekolah, PPD, Negeri (Stacked on same style) */}
                  {[
                    { label: 'Kod Sekolah', value: 'BEA1234' },
                    { label: 'PPD / Daerah', value: 'Pejabat Pendidikan Daerah Hulu Langat' },
                    { label: 'Negeri', value: 'Selangor' },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Label>{item.label}</Label>
                      <DataRow>
                        <Typography color={PRIMARY_TEXT}>{item.value}</Typography>
                      </DataRow>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* System Information */}
        <Card raised sx={{ border: `1px solid #e9d5ff`, boxShadow: 1 }}> {/* purple-100 */}
          <CardHeader
            title={
              <Stack direction="row" alignItems="center" spacing={1}>
                <SettingsIcon size={20} sx={{ color: PRIMARY_BLUE }} />
                <Typography variant="h6" sx={{ color: PRIMARY_BLUE }}>
                  Maklumat Sistem
                </Typography>
              </Stack>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>ID Pengguna</Typography>
                <Typography color={PRIMARY_TEXT}>USR2025001</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>Peranan</Typography>
                <Typography color={PRIMARY_TEXT}>Pentadbir (Admin)</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>Log Masuk Terakhir</Typography>
                <Typography color={PRIMARY_TEXT}>20 Okt 2025, 08:15 AM</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Grid container spacing={3}>
          {[
            { icon: '📊', label: 'Cerapan Selesai', value: '36', color: '#dbeafe' }, // blue-100
            { icon: '✅', label: 'Laporan Dijana', value: '12', color: '#d1fae5' }, // green-100
            { icon: '📅', label: 'Hari Bertugas', value: '247', color: '#ede9fe' }, // purple-100
          ].map((stat) => (
            <Grid item xs={12} md={4} key={stat.label}>
              <Card raised sx={{ border: `1px solid ${stat.color}`, boxShadow: 1 }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack alignItems="center">
                    <Box sx={{
                      width: 64, height: 64, bgcolor: stat.color,
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5
                    }}>
                      <Typography variant="h5">{stat.icon}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" mb={0.5}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h6" sx={{ color: PRIMARY_BLUE }}>
                      {stat.value}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
}
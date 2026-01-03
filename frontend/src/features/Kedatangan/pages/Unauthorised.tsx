import {
    Container,
    Typography,
    Box,
    Paper,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material'; // A common icon for unauthorized/security issues

// You can define a style object or use the 'sx' prop directly
const unauthorizedStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh', // Full height of the viewport
    textAlign: 'center',
    padding: 3,
};

const iconStyles = {
    fontSize: 80,
    color: 'error.main', // Uses the primary error color from your theme
    marginBottom: 2,
};

const UnauthorizedPage = () => {

    return (
        <Container component="main" maxWidth="md">
            <Box sx={unauthorizedStyles}>
                <Paper elevation={3} sx={{ padding: 5, borderRadius: 2 }}>
                    {/* 1. Icon */}
                    <LockOutlined sx={iconStyles} />

                    {/* 2. Main Title */}
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        color="error.dark"
                    >
                        Unauthorized Access (401)
                    </Typography>

                    {/* 3. Subtitle/Message */}
                    <Typography variant="h5" component="p" paragraph>
                        You do not have permission to view this page.
                    </Typography>

                    {/* 4. Detailed Explanation (Optional) */}
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Please check your network.
                    </Typography>
                </Paper>
            </Box>
        </Container>
    );
};

export default UnauthorizedPage;
import React from 'react';
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon | React.ElementType;
  color: string;
}

export function StatCard({ title, value, icon: IconComponent, color }: StatCardProps) {
  return (
    <Card 
      sx={{ 
        boxShadow: 3, 
        borderLeft: `5px solid ${color}`, 
        transition: '0.3s', 
        height: '100%',
        '&:hover': { boxShadow: 6 } 
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="text.secondary" variant="subtitle2">
              {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {value}
            </Typography>
          </Box>
          <IconComponent size={36} color={color} />
        </Stack>
      </CardContent>
    </Card>
  );
}

interface QuickActionProps {
  label: string;
  to: string;
}

export function QuickAction({ label, to }: QuickActionProps) {
  return (
    <Box
      component={Link}
      to={to}
      sx={{
        p: 2,
        bgcolor: 'blue.50',
        border: '1px solid',
        borderColor: 'blue.200',
        borderRadius: 2,
        textAlign: 'center',
        fontWeight: 'medium',
        textDecoration: 'none',
        color: 'primary.main',
        display: 'block',
        transition: '0.2s',
        '&:hover': {
          bgcolor: 'blue.100',
        }
      }}
    >
      {label}
    </Box>
  );
}

import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';

interface Props {
  icon: ReactNode;
  iconColor: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export default function FormSection({ icon, iconColor, title, subtitle, children }: Props) {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            background: `${iconColor}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ color: iconColor, display: 'flex', fontSize: 22 }}>{icon}</Box>
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0F172A', lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>
      {children}
    </Box>
  );
}

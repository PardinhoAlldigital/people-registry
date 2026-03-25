'use client';

import {
  AppBar, Toolbar, Typography, Button, Box, Avatar,
  Divider, useScrollTrigger, Slide,
} from '@mui/material';
import { Logout, Groups, Dashboard } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

function HideOnScroll({ children }: { children: React.ReactElement }) {
  const trigger = useScrollTrigger();
  return <Slide appear={false} direction="down" in={!trigger}>{children}</Slide>;
}

export default function AppTopBar() {
  const { currentUser, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => { logout(); router.push('/login'); };

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <HideOnScroll>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #E2E8F0',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
          {/* Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
              }}
            >
              <Groups sx={{ color: 'white', fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1, color: '#0F172A' }}>
                Feira de saúde
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1 }}>
                iasd jd. Nakamura
              </Typography>
            </Box>
          </Box>

          {/* Nav links */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 4 }}>
            <Button
              component={Link}
              href="/dashboard"
              startIcon={<Dashboard fontSize="small" />}
              size="small"
              sx={{
                color: pathname === '/dashboard' ? '#4F46E5' : '#64748B',
                fontWeight: pathname === '/dashboard' ? 700 : 500,
                bgcolor: pathname === '/dashboard' ? 'rgba(79,70,229,0.08)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(79,70,229,0.06)', color: '#4F46E5', transform: 'none' },
                borderRadius: 2,
              }}
            >
              Dashboard
            </Button>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {currentUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A', lineHeight: 1.2 }}>
                  {currentUser.name}
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B' }}>
                  {currentUser.email}
                </Typography>
              </Box>
              <Avatar
                sx={{
                  bgcolor: 'transparent',
                  background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                  width: 36,
                  height: 36,
                  fontSize: 14,
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(79,70,229,0.3)',
                }}
              >
                {getInitials(currentUser.name)}
              </Avatar>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 28, alignSelf: 'center' }} />
              <Button
                onClick={handleLogout}
                startIcon={<Logout fontSize="small" />}
                size="small"
                sx={{
                  color: '#EF4444',
                  fontWeight: 600,
                  '&:hover': { bgcolor: 'rgba(239,68,68,0.06)', color: '#DC2626', transform: 'none' },
                }}
              >
                Sair
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}

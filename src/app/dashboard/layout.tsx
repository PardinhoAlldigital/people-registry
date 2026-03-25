'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSyncExternalStore } from 'react';
import AppTopBar from '@/components/layout/AppBar';
import { Box, CircularProgress } from '@mui/material';

function useHydrated() {
  return useSyncExternalStore(
    (cb) => { window.addEventListener('storage', cb); return () => window.removeEventListener('storage', cb); },
    () => true,
    () => false,
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuthStore();
  const router = useRouter();
  const hydrated = useHydrated();

  useEffect(() => {
    if (hydrated && !currentUser) router.replace('/login');
  }, [hydrated, currentUser, router]);

  if (!hydrated || !currentUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#4F46E5' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC' }}>
      <AppTopBar />
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
        {children}
      </Box>
    </Box>
  );
}

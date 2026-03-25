'use client';

import { useState } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import { People, MedicalServices, Groups } from '@mui/icons-material';
import PeopleTable from '@/components/people/PeopleTable';
import TeamSection from '@/components/team/TeamSection';
import ServicesDashboard from '@/components/services/ServicesDashboard';
import { useAuthStore } from '@/store/authStore';

export default function DashboardPage() {
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: 15 } }}
        >
          <Tab icon={<People fontSize="small" />} iconPosition="start" label="Cadastros" />
          <Tab icon={<MedicalServices fontSize="small" />} iconPosition="start" label="Serviços" />
          {isAdmin && (
            <Tab icon={<Groups fontSize="small" />} iconPosition="start" label="Equipe" />
          )}
        </Tabs>
      </Box>

      {tab === 0 && <PeopleTable />}
      {tab === 1 && <ServicesDashboard />}
      {tab === 2 && isAdmin && <TeamSection />}
    </Box>
  );
}

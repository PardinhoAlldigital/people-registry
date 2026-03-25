'use client';

import {
  Avatar, Box, Card, CardContent, Chip, Divider, IconButton,
  Stack, Tooltip, Typography, Button, CircularProgress,
} from '@mui/material';
import { Delete, PersonAdd, Groups } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useTeamStore } from '@/store/teamStore';
import { TeamMember } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AddMemberDialog from './AddMemberDialog';

export default function TeamSection() {
  const { members, loading, fetchMembers, removeMember } = useTeamStore();
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => { fetchMembers(); }, []);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  const handleRemove = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      await removeMember(removeTarget.id);
      setRemoveTarget(null);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0', mt: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(79,70,229,0.08)', display: 'flex' }}>
                <Groups sx={{ color: '#4F46E5', fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={800} sx={{ color: '#0F172A' }}>Minha Equipe</Typography>
                <Typography variant="caption" color="text.secondary">
                  {members.length} membro{members.length !== 1 ? 's' : ''} na equipe
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              size="small"
              onClick={() => setAddOpen(true)}
            >
              Adicionar Membro
            </Button>
          </Box>

          <Divider />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#4F46E5' }} size={28} />
            </Box>
          ) : members.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Typography variant="body2" color="text.secondary">Nenhum membro na equipe ainda.</Typography>
              <Button variant="outlined" startIcon={<PersonAdd />} sx={{ mt: 2 }} size="small" onClick={() => setAddOpen(true)}>
                Adicionar primeiro membro
              </Button>
            </Box>
          ) : (
            <Stack divider={<Divider />}>
              {members.map((m) => (
                <Box key={m.id} sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2, '&:hover': { bgcolor: '#FAFBFC' } }}>
                  <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
                    {getInitials(m.name)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A' }}>{m.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{m.email}</Typography>
                  </Box>
                  <Chip
                    label={`${m._count?.people ?? 0} cadastros`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#4F46E5', borderColor: '#C7D2FE' }}
                  />
                  <Tooltip title="Remover membro">
                    <IconButton size="small" onClick={() => setRemoveTarget(m)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      <AddMemberDialog open={addOpen} onClose={() => setAddOpen(false)} />

      <ConfirmDialog
        open={!!removeTarget}
        title="Remover membro"
        description={<>Deseja remover <strong>{removeTarget?.name}</strong> da equipe? Os cadastros feitos por ele serão mantidos.</>}
        confirmLabel="Remover"
        loading={removing}
        onConfirm={handleRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </>
  );
}

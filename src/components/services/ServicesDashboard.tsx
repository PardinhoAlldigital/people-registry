'use client';

import {
  Box, Card, CardContent, Typography, LinearProgress,
  Chip, Stack, CircularProgress, Divider, Tooltip,
} from '@mui/material';
import {
  Visibility, MedicalServices, ContentCut, LocalHospital,
  Restaurant, Spa, MonitorWeight, Psychology, MoreHoriz,
} from '@mui/icons-material';
import { usePeopleStore } from '@/store/peopleStore';
import { SERVICES } from '@/types';
import { useEffect } from 'react';

const CAPACITY = 100;

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  'Oculista': <Visibility fontSize="small" />,
  'Dentista': <MedicalServices fontSize="small" />,
  'Cabeleireiro': <ContentCut fontSize="small" />,
  'Enfermagem': <LocalHospital fontSize="small" />,
  'Nutrição': <Restaurant fontSize="small" />,
  'Esteticista': <Spa fontSize="small" />,
  'Bioimpedância': <MonitorWeight fontSize="small" />,
  'Psicólogo': <Psychology fontSize="small" />,
  'Outros': <MoreHoriz fontSize="small" />,
};

function getProgressColor(used: number): 'success' | 'warning' | 'error' {
  const pct = (used / CAPACITY) * 100;
  if (pct >= 90) return 'error';
  if (pct >= 70) return 'warning';
  return 'success';
}

function getStatusLabel(used: number): { label: string; color: 'success' | 'warning' | 'error' | 'default' } {
  const remaining = CAPACITY - used;
  if (remaining <= 0) return { label: 'Esgotado', color: 'error' };
  if (remaining <= 10) return { label: 'Quase cheio', color: 'warning' };
  return { label: `${remaining} disponíveis`, color: 'success' };
}

export default function ServicesDashboard() {
  const { people, loading, fetchPeople } = usePeopleStore();

  useEffect(() => {
    if (people.length === 0) fetchPeople();
  }, []);

  const serviceCounts = SERVICES.reduce<Record<string, number>>((acc, svc) => {
    acc[svc] = people.filter((p) => p.services?.includes(svc)).length;
    return acc;
  }, {});

  // tickets used per service: list of {name, ticket}
  const serviceTicketsByService = SERVICES.reduce<Record<string, { name: string; ticket: string }[]>>((acc, svc) => {
    acc[svc] = people
      .filter((p) => p.services?.includes(svc) && p.serviceTickets?.[svc])
      .map((p) => ({ name: p.fullName, ticket: p.serviceTickets![svc] }))
      .sort((a, b) => Number(a.ticket) - Number(b.ticket));
    return acc;
  }, {});

  const totalUsed = Object.values(serviceCounts).reduce((a, b) => a + b, 0);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Resumo geral */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: '1 1 180px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Total de fichas
            </Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main">
              {SERVICES.length * CAPACITY}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {SERVICES.length} serviços × {CAPACITY} fichas
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: '1 1 180px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Fichas utilizadas
            </Typography>
            <Typography variant="h4" fontWeight={800} color="warning.main">
              {totalUsed}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              de {SERVICES.length * CAPACITY} no total
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: '1 1 180px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Fichas disponíveis
            </Typography>
            <Typography variant="h4" fontWeight={800} color="success.main">
              {SERVICES.length * CAPACITY - totalUsed}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              restantes no total
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Cards por serviço */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 2,
        }}
      >
        {SERVICES.map((svc) => {
          const used = serviceCounts[svc] ?? 0;
          const remaining = Math.max(0, CAPACITY - used);
          const pct = Math.min(100, (used / CAPACITY) * 100);
          const color = getProgressColor(used);
          const status = getStatusLabel(used);
          const tickets = serviceTicketsByService[svc] ?? [];

          return (
            <Card
              key={svc}
              sx={{
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: remaining === 0 ? '1px solid' : 'none',
                borderColor: remaining === 0 ? 'error.light' : undefined,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1.5}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: `${color}.50`,
                        color: `${color}.main`,
                        display: 'flex',
                      }}
                    >
                      {SERVICE_ICONS[svc]}
                    </Box>
                    <Typography fontWeight={700} fontSize={15}>
                      {svc}
                    </Typography>
                  </Stack>
                  <Chip
                    label={status.label}
                    color={status.color}
                    size="small"
                    sx={{ fontWeight: 600, fontSize: 11 }}
                  />
                </Stack>

                {/* Números */}
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Box>
                    <Typography variant="h5" fontWeight={800} color={`${color}.main`} lineHeight={1}>
                      {remaining}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      restantes
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="h5" fontWeight={800} color="text.secondary" lineHeight={1}>
                      {used}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      utilizadas
                    </Typography>
                  </Box>
                </Stack>

                {/* Barra de progresso */}
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  color={color}
                  sx={{ borderRadius: 2, height: 8, bgcolor: 'grey.100' }}
                />
                <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
                  {used} de {CAPACITY} fichas utilizadas ({pct.toFixed(0)}%)
                </Typography>

                {/* Fichas registradas */}
                {tickets.length > 0 && (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.62rem' }}>
                      Fichas registradas
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.75 }}>
                      {tickets.slice(0, 10).map(({ name, ticket }) => (
                        <Tooltip key={ticket} title={name} arrow>
                          <Chip
                            label={`#${ticket}`}
                            size="small"
                            sx={{ fontSize: '0.68rem', fontWeight: 700, bgcolor: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', cursor: 'default' }}
                          />
                        </Tooltip>
                      ))}
                      {tickets.length > 10 && (
                        <Chip
                          label={`+${tickets.length - 10}`}
                          size="small"
                          sx={{ fontSize: '0.68rem', fontWeight: 600, bgcolor: '#F1F5F9', color: '#64748B' }}
                        />
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

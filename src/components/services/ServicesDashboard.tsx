'use client';

import {
  Box, Card, CardContent, Typography, LinearProgress,
  Chip, Stack, CircularProgress, Divider, Tooltip,
  TextField, Button, IconButton, InputAdornment, Alert,
} from '@mui/material';
import {
  Visibility, MedicalServices, ContentCut, LocalHospital,
  Restaurant, Spa, MonitorWeight, Psychology, MoreHoriz,
  Add, DeleteOutline,
} from '@mui/icons-material';
import { usePeopleStore } from '@/store/peopleStore';
import { useServicesStore } from '@/store/servicesStore';
import { Service } from '@/types';
import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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

function serviceIcon(name: string): React.ReactNode {
  return SERVICE_ICONS[name] ?? <MedicalServices fontSize="small" />;
}

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
  const { people, loading: peopleLoading, fetchPeople } = usePeopleStore();
  const { services, loading: servicesLoading, fetchServices, addService, removeService } = useServicesStore();

  const [newService, setNewService] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (people.length === 0) fetchPeople();
    fetchServices();
  }, []);

  const serviceCounts = services.reduce<Record<string, number>>((acc, svc) => {
    acc[svc.name] = people.filter((p) => p.services?.includes(svc.name)).length;
    return acc;
  }, {});

  // tickets used per service: list of {name, ticket}
  const serviceTicketsByService = services.reduce<Record<string, { name: string; ticket: string }[]>>((acc, svc) => {
    acc[svc.name] = people
      .filter((p) => p.services?.includes(svc.name) && p.serviceTickets?.[svc.name])
      .map((p) => ({ name: p.fullName, ticket: p.serviceTickets![svc.name] }))
      .sort((a, b) => Number(a.ticket) - Number(b.ticket));
    return acc;
  }, {});

  const totalUsed = Object.values(serviceCounts).reduce((a, b) => a + b, 0);

  const handleAdd = async () => {
    const name = newService.trim();
    if (name.length < 2) {
      setError('Informe um nome com ao menos 2 caracteres.');
      return;
    }
    setError('');
    setAdding(true);
    try {
      await addService(name);
      setNewService('');
    } catch (err: any) {
      setError(err.message ?? 'Erro ao adicionar serviço.');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeService(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao excluir serviço.');
    } finally {
      setDeleting(false);
    }
  };

  if (servicesLoading && services.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const usedByTarget = deleteTarget ? (serviceCounts[deleteTarget.name] ?? 0) : 0;

  return (
    <Box>
      {/* Resumo geral */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: '1 1 180px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Total de fichas
            </Typography>
            <Typography variant="h4" fontWeight={800} color="primary.main">
              {services.length * CAPACITY}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {services.length} serviços × {CAPACITY} fichas
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
              de {services.length * CAPACITY} no total
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: '1 1 180px' }}>
          <CardContent sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Fichas disponíveis
            </Typography>
            <Typography variant="h4" fontWeight={800} color="success.main">
              {services.length * CAPACITY - totalUsed}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              restantes no total
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Adicionar serviço */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0', mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#0F172A', mb: 1.5 }}>
            Gerenciar serviços
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <TextField
              size="small"
              placeholder="Nome do novo serviço..."
              value={newService}
              onChange={(e) => { setNewService(e.target.value); if (error) setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
              sx={{ flex: 1, maxWidth: 360, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><MedicalServices sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }}
            />
            <Button
              variant="contained"
              startIcon={adding ? <CircularProgress size={16} sx={{ color: 'white' }} /> : <Add />}
              onClick={handleAdd}
              disabled={adding}
              sx={{ px: 3 }}
            >
              Adicionar
            </Button>
          </Stack>
          {error && (
            <Alert severity="error" sx={{ mt: 1.5, borderRadius: 2 }}>{error}</Alert>
          )}
        </CardContent>
      </Card>

      {services.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" fontWeight={700} color="text.secondary">Nenhum serviço cadastrado</Typography>
          <Typography variant="body2" color="text.disabled">Adicione o primeiro serviço acima para começar</Typography>
        </Box>
      ) : (
      /* Cards por serviço */
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 2,
        }}
      >
        {services.map((svc) => {
          const used = serviceCounts[svc.name] ?? 0;
          const remaining = Math.max(0, CAPACITY - used);
          const pct = Math.min(100, (used / CAPACITY) * 100);
          const color = getProgressColor(used);
          const status = getStatusLabel(used);
          const tickets = serviceTicketsByService[svc.name] ?? [];

          return (
            <Card
              key={svc.id}
              sx={{
                borderRadius: 3,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                border: remaining === 0 ? '1px solid' : 'none',
                borderColor: remaining === 0 ? 'error.light' : undefined,
                position: 'relative',
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
                      {serviceIcon(svc.name)}
                    </Box>
                    <Typography fontWeight={700} fontSize={15}>
                      {svc.name}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: 11 }}
                    />
                    <Tooltip title="Excluir serviço" arrow>
                      <IconButton
                        size="small"
                        onClick={() => setDeleteTarget(svc)}
                        sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' } }}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
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
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Excluir serviço"
        description={
          <>
            Deseja excluir o serviço{' '}
            <Typography component="span" fontWeight={700} color="text.primary">{deleteTarget?.name}</Typography>?
            {usedByTarget > 0 && (
              <>
                {' '}Ele está registrado em{' '}
                <Typography component="span" fontWeight={700} color="text.primary">{usedByTarget}</Typography>{' '}
                cadastro{usedByTarget !== 1 ? 's' : ''}, que serão mantidos. O serviço apenas deixará de aparecer para novos cadastros.
              </>
            )}
          </>
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </Box>
  );
}

'use client';

import {
  Box, Button, Card, CardContent, Chip, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Tooltip, TextField, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, Divider, Stack,
  Avatar, CircularProgress,
} from '@mui/material';
import {
  Delete, PictureAsPdf, TableChart, Search,
  PersonAdd, Info, People, TrendingUp, Church, LocationCity, ConfirmationNumber,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { usePeopleStore } from '@/store/peopleStore';
import { useAuthStore } from '@/store/authStore';
import { exportToPDF } from '@/lib/exportPDF';
import { exportToExcel } from '@/lib/exportExcel';
import { Person } from '@/types';
import { useRouter } from 'next/navigation';

function StatCard({ icon, label, value, color, bg }: { icon: React.ReactNode; label: string; value: number; color: string; bg: string }) {
  return (
    <Card sx={{ borderRadius: 3, border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', flex: 1, minWidth: 0 }}>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: bg, display: 'flex' }}>{icon}</Box>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ color, lineHeight: 1 }}>{value}</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function getDenominationColor(denomination?: string): 'primary' | 'secondary' | 'success' | 'info' | 'warning' {
  if (!denomination) return 'primary';
  const map: Record<string, 'primary' | 'secondary' | 'success' | 'info' | 'warning'> = {
    'Católico': 'secondary',
    'Evangélico / Cristão': 'primary',
    'Adventista do Sétimo Dia': 'success',
    'Batista': 'info',
    'Espírita': 'warning',
  };
  return map[denomination] ?? 'primary';
}

export default function PeopleTable() {
  const { people, removePerson, fetchPeople, loading } = usePeopleStore();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'ADMIN';
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Person | null>(null);
  const [detailTarget, setDetailTarget] = useState<Person | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { fetchPeople(); }, []);

  const filtered = people.filter(p =>
    p.fullName.toLowerCase().includes(search.toLowerCase()) ||
    p.city.toLowerCase().includes(search.toLowerCase()) ||
    p.idNumber.toLowerCase().includes(search.toLowerCase())
  );

  const withDenomination = people.filter(p => p.hasDenomination).length;
  const cities = new Set(people.map(p => p.city)).size;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removePerson(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      {/* Stats */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <StatCard icon={<People sx={{ color: '#4F46E5', fontSize: 22 }} />} label="Total Cadastros" value={people.length} color="#4F46E5" bg="rgba(79,70,229,0.1)" />
        <StatCard icon={<Church sx={{ color: '#7C3AED', fontSize: 22 }} />} label="Com Religião" value={withDenomination} color="#7C3AED" bg="rgba(124,58,237,0.1)" />
        <StatCard icon={<LocationCity sx={{ color: '#06B6D4', fontSize: 22 }} />} label="Cidades" value={cities} color="#06B6D4" bg="rgba(6,182,212,0.1)" />
        <StatCard icon={<TrendingUp sx={{ color: '#10B981', fontSize: 22 }} />} label="Este mês" value={people.filter(p => new Date(p.createdAt).getMonth() === new Date().getMonth()).length} color="#10B981" bg="rgba(16,185,129,0.1)" />
      </Stack>

      <Card sx={{ borderRadius: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
        <CardContent sx={{ p: 0 }}>
          {/* Header */}
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h5" fontWeight={800} sx={{ color: '#0F172A' }}>Lista de Cadastros</Typography>
              <Typography variant="body2" color="text.secondary">
                {filtered.length} de {people.length} registro{people.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5} flexWrap="wrap">
              <Button variant="outlined" startIcon={<PictureAsPdf />} onClick={() => exportToPDF(filtered)} disabled={filtered.length === 0} size="small" sx={{ borderColor: '#EF4444', color: '#EF4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.06)', borderColor: '#DC2626' }, transform: 'none !important' }}>
                PDF
              </Button>
              <Button variant="outlined" startIcon={<TableChart />} onClick={() => exportToExcel(filtered)} disabled={filtered.length === 0} size="small" sx={{ borderColor: '#10B981', color: '#10B981', '&:hover': { bgcolor: 'rgba(16,185,129,0.06)', borderColor: '#059669' }, transform: 'none !important' }}>
                Excel
              </Button>
              <Button variant="contained" startIcon={<PersonAdd />} onClick={() => router.push('/dashboard/new')} size="small" sx={{ px: 2 }}>
                Novo Cadastro
              </Button>
            </Stack>
          </Box>

          <Divider />

          {/* Search */}
          <Box sx={{ p: 2, bgcolor: '#FAFBFC' }}>
            <TextField
              placeholder="Buscar por nome, cidade ou RG..."
              fullWidth size="small" value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: 2.5, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#4F46E5' }, '&.Mui-focused': { boxShadow: '0 0 0 3px rgba(79,70,229,0.1)' } } }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }}
            />
          </Box>

          {/* Content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#4F46E5' }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 10 }}>
              <Box sx={{ display: 'inline-flex', p: 3, borderRadius: '50%', bgcolor: 'rgba(79,70,229,0.06)', mb: 2 }}>
                <People sx={{ fontSize: 48, color: '#C7D2FE' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                {search ? 'Nenhum resultado encontrado' : 'Nenhum cadastro ainda'}
              </Typography>
              <Typography variant="body2" color="text.disabled" mb={3}>
                {search ? 'Tente buscar por outro termo' : 'Adicione a primeira pessoa para começar'}
              </Typography>
              {!search && (
                <Button variant="contained" startIcon={<PersonAdd />} onClick={() => router.push('/dashboard/new')}>
                  Adicionar Pessoa
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    {['Pessoa', 'Endereço', 'Contato', 'Serviços', 'Religião', 'Cadastro', ''].map(h => (
                      <TableCell key={h} sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.06em', py: 1.5, borderBottom: '1px solid #E2E8F0' }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map(p => (
                    <TableRow key={p.id} sx={{ '&:hover': { bgcolor: 'rgba(79,70,229,0.03)' }, '&:last-child td': { border: 0 }, transition: 'background 0.15s' }}>
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 700, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 2px 8px rgba(79,70,229,0.25)' }}>
                            {getInitials(p.fullName)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#0F172A' }}>{p.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">RG: {p.idNumber}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#374151' }}>{p.city}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.state} · {p.cep}</Typography>
                      </TableCell>
                      <TableCell><Typography variant="body2">{p.phone}</Typography></TableCell>
                      <TableCell>
                        {p.services && p.services.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {p.services.map((svc) => {
                              const ticket = p.serviceTickets?.[svc];
                              return (
                                <Chip
                                  key={svc}
                                  size="small"
                                  icon={ticket ? <ConfirmationNumber sx={{ fontSize: '13px !important' }} /> : undefined}
                                  label={ticket ? `${svc} #${ticket}` : svc}
                                  sx={{ fontSize: '0.68rem', fontWeight: 600, bgcolor: '#FEF3C7', color: '#92400E', border: '1px solid #F59E0B' }}
                                />
                              );
                            })}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.hasDenomination
                          ? <Chip label={p.denomination} size="small" color={getDenominationColor(p.denomination)} sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                          : <Chip label="Não informado" size="small" variant="outlined" sx={{ color: '#94A3B8', borderColor: '#E2E8F0', fontSize: '0.7rem' }} />
                        }
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{new Date(p.createdAt).toLocaleDateString('pt-BR')}</Typography>
                        {isAdmin && p.createdBy && (
                          <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                            por {p.createdBy.name}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Tooltip title="Ver detalhes">
                            <IconButton size="small" onClick={() => setDetailTarget(p)} sx={{ color: '#4F46E5', '&:hover': { bgcolor: 'rgba(79,70,229,0.08)' } }}>
                              <Info fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Excluir">
                            <IconButton size="small" onClick={() => setDeleteTarget(p)} sx={{ color: '#94A3B8', '&:hover': { color: '#EF4444', bgcolor: 'rgba(239,68,68,0.08)' } }}>
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle><Typography fontWeight={700} variant="h6">Confirmar exclusão</Typography></DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Deseja excluir o cadastro de{' '}
            <Typography component="span" fontWeight={700} color="text.primary">{deleteTarget?.fullName}</Typography>?{' '}
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button onClick={() => setDeleteTarget(null)} variant="outlined" sx={{ flex: 1, borderColor: '#E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1', transform: 'none' } }}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleDelete} disabled={deleting} sx={{ flex: 1, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626', transform: 'translateY(-1px)' } }}>
            {deleting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailTarget} onClose={() => setDetailTarget(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 0 }}>
          {detailTarget && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ width: 48, height: 48, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', fontWeight: 700, fontSize: 18 }}>
                {detailTarget.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
              </Avatar>
              <Box>
                <Typography fontWeight={800}>{detailTarget.fullName}</Typography>
                <Typography variant="caption" color="text.secondary">Detalhes do cadastro</Typography>
              </Box>
            </Box>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ mt: 1 }}>
          {detailTarget && (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {([
                ['RG', detailTarget.idNumber, false],
                ['Telefone', detailTarget.phone, false],
                ['CEP', detailTarget.cep, false],
                ['UF', detailTarget.state, false],
                ['Cidade', detailTarget.city, false],
                ['Bairro', detailTarget.neighborhood, false],
                ['Rua', detailTarget.street + (detailTarget.complement ? `, ${detailTarget.complement}` : ''), true],
                ['Religião', detailTarget.hasDenomination ? detailTarget.denomination! : 'Não informado', false],
                ['Estuda Bíblia', detailTarget.acceptsBibleStudy ? 'Sim' : 'Não', false],
                ['Aceita Visita', detailTarget.acceptsVisit ? 'Sim' : 'Não', false],
                ['Cadastrado em', new Date(detailTarget.createdAt).toLocaleDateString('pt-BR'), false],
                ...(detailTarget.createdBy ? [['Registrado por', detailTarget.createdBy.name, false] as [string, string, boolean]] : []),
              ] as [string, string, boolean][]).map(([label, value, full]) => (
                <Box key={label} sx={{ gridColumn: full ? '1 / -1' : 'auto' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ mt: 0.25, color: '#0F172A' }}>{value}</Typography>
                </Box>
              ))}
              {detailTarget.services && detailTarget.services.length > 0 && (
                <Box sx={{ gridColumn: '1 / -1' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem' }}>
                    Serviços
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                    {detailTarget.services.map((s) => {
                      const ticket = detailTarget.serviceTickets?.[s];
                      return (
                        <Chip
                          key={s}
                          size="small"
                          icon={ticket ? <ConfirmationNumber sx={{ fontSize: '14px !important' }} /> : undefined}
                          label={ticket ? `${s} — Ficha #${ticket}` : s}
                          sx={{ fontSize: '0.7rem', fontWeight: 600, color: '#92400E', bgcolor: '#FEF3C7', border: '1px solid #F59E0B' }}
                        />
                      );
                    })}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDetailTarget(null)} variant="contained" sx={{ px: 3 }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

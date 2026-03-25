'use client';

import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, Typography, InputAdornment, IconButton, Alert,
} from '@mui/material';
import { Email, Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTeamStore } from '@/store/teamStore';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AddMemberDialog({ open, onClose }: Props) {
  const { addMember } = useTeamStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await addMember(data.name, data.email, data.password);
      reset();
      onClose();
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar membro.');
    }
  };

  const handleClose = () => { reset(); setError(''); onClose(); };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle>
        <Typography fontWeight={800} variant="h6">Adicionar Membro</Typography>
        <Typography variant="caption" color="text.secondary">O membro poderá fazer login e cadastrar pessoas</Typography>
      </DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}
        <Box component="form" id="add-member-form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <TextField label="Nome completo" fullWidth margin="normal" {...register('name')} error={!!errors.name} helperText={errors.name?.message}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }} />
          <TextField label="E-mail" fullWidth margin="normal" {...register('email')} error={!!errors.email} helperText={errors.email?.message}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Email sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }} />
          <TextField label="Senha" fullWidth margin="normal" type={showPassword ? 'text' : 'password'} {...register('password')} error={!!errors.password} helperText={errors.password?.message}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowPassword(v => !v)} edge="end" size="small">{showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></InputAdornment> } }} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={handleClose} variant="outlined" sx={{ flex: 1, borderColor: '#E2E8F0', color: '#64748B', '&:hover': { transform: 'none' } }}>Cancelar</Button>
        <Button type="submit" form="add-member-form" variant="contained" disabled={isSubmitting} sx={{ flex: 1 }}>
          {isSubmitting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Criar Membro'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

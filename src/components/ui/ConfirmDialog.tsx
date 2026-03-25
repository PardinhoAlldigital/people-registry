import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';

interface Props {
  open: boolean;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  confirmColor = 'error',
  loading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle>
        <Typography fontWeight={700} variant="h6">{title}</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">{description}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ flex: 1, borderColor: '#E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', transform: 'none' } }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          color={confirmColor}
          sx={{ flex: 1, '&:hover': { transform: 'translateY(-1px)' } }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

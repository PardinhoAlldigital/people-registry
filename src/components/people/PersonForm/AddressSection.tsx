import { Alert, CircularProgress, Grid, InputAdornment, TextField } from '@mui/material';
import { CheckCircle, LocationOn, Search } from '@mui/icons-material';
import { FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { useState } from 'react';
import { fetchAddressByCEP } from '@/lib/viacep';
import FormSection from '@/components/ui/FormSection';

function maskCEP(v: string) {
  return v.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');
}

interface Props {
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
  errors: FieldErrors<FieldValues>;
}

export default function AddressSection({ register, setValue, errors }: Props) {
  const [loading, setLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [cepOk, setCepOk] = useState(false);

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskCEP(e.target.value);
    setValue('cep', masked);
    setCepError('');
    setCepOk(false);
    if (masked.replace(/\D/g, '').length === 8) {
      setLoading(true);
      const address = await fetchAddressByCEP(masked);
      setLoading(false);
      if (address) {
        setValue('street', address.logradouro);
        setValue('neighborhood', address.bairro);
        setValue('city', address.localidade);
        setValue('state', address.uf);
        setValue('complement', address.complemento);
        setCepOk(true);
      } else {
        setCepError('CEP não encontrado.');
      }
    }
  };

  return (
    <FormSection
      icon={<LocationOn />}
      iconColor="#06B6D4"
      title="Endereço"
      subtitle="Localização e endereço completo"
    >
      {cepOk && (
        <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 2.5, borderRadius: 2, py: 0.5 }}>
          Endereço preenchido automaticamente via CEP!
        </Alert>
      )}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="CEP"
            fullWidth
            placeholder="00000-000"
            {...register('cep')}
            onChange={handleCEPChange}
            error={!!errors.cep || !!cepError}
            helperText={(errors.cep?.message as string) || cepError}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>,
                endAdornment: loading ? <InputAdornment position="end"><CircularProgress size={18} sx={{ color: '#4F46E5' }} /></InputAdornment> : null,
              },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField label="Rua / Logradouro" fullWidth {...register('street')} error={!!errors.street} helperText={errors.street?.message as string} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField label="Complemento" fullWidth {...register('complement')} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField label="Bairro" fullWidth {...register('neighborhood')} error={!!errors.neighborhood} helperText={errors.neighborhood?.message as string} />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField label="Cidade" fullWidth {...register('city')} error={!!errors.city} helperText={errors.city?.message as string} />
        </Grid>
        <Grid size={{ xs: 12, sm: 1 }}>
          <TextField label="UF" fullWidth {...register('state')} error={!!errors.state} helperText={errors.state?.message as string} slotProps={{ htmlInput: { maxLength: 2, style: { textTransform: 'uppercase' } } }} />
        </Grid>
      </Grid>
    </FormSection>
  );
}

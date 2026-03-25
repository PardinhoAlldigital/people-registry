import { Grid, TextField, InputAdornment } from '@mui/material';
import { Person, Badge, Phone } from '@mui/icons-material';
import { Control, Controller, FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import FormSection from '@/components/ui/FormSection';

function maskPhone(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.length <= 10
    ? d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    : d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

interface Props {
  register: UseFormRegister<FieldValues>;
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
}

export default function PersonalSection({ register, control, errors }: Props) {
  return (
    <FormSection
      icon={<Person />}
      iconColor="#4F46E5"
      title="Dados Pessoais"
      subtitle="Informações de identificação"
    >
      <Grid container spacing={2.5}>
        <Grid size={12}>
          <TextField
            label="Nome Completo"
            fullWidth
            {...register('fullName')}
            error={!!errors.fullName}
            helperText={errors.fullName?.message as string}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Person sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="RG (Número de Identidade)"
            fullWidth
            {...register('idNumber')}
            error={!!errors.idNumber}
            helperText={errors.idNumber?.message as string}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Badge sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Controller
            name="phone"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                label="Telefone"
                fullWidth
                {...field}
                onChange={(e) => field.onChange(maskPhone(e.target.value))}
                error={!!errors.phone}
                helperText={errors.phone?.message as string}
                placeholder="(00) 00000-0000"
                slotProps={{ input: { startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment> } }}
              />
            )}
          />
        </Grid>
      </Grid>
    </FormSection>
  );
}

import { TextField, InputAdornment } from '@mui/material';
import { Campaign } from '@mui/icons-material';
import { FieldValues, UseFormRegister } from 'react-hook-form';
import FormSection from '@/components/ui/FormSection';

interface Props {
  register: UseFormRegister<FieldValues>;
}

export default function ReferralSection({ register }: Props) {
  return (
    <FormSection
      icon={<Campaign />}
      iconColor="#0EA5E9"
      title="Divulgação"
      subtitle="De onde veio o interesse pela feira de saúde"
    >
      <TextField
        label="Como você ficou sabendo da feira de saúde?"
        fullWidth
        multiline
        minRows={2}
        placeholder="Ex.: indicação de um amigo, redes sociais, cartaz na rua, igreja..."
        {...register('howHeard')}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                <Campaign sx={{ color: '#94A3B8', fontSize: 20 }} />
              </InputAdornment>
            ),
          },
        }}
      />
    </FormSection>
  );
}

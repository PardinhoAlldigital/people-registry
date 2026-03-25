import {
  Box, FormControl, FormHelperText, FormLabel, InputLabel,
  MenuItem, Paper, Radio, RadioGroup, FormControlLabel, Select, Typography,
} from '@mui/material';
import { Church } from '@mui/icons-material';
import { Control, Controller, FieldErrors, FieldValues } from 'react-hook-form';
import { DENOMINATIONS } from '@/types';
import FormSection from '@/components/ui/FormSection';

interface Props {
  control: Control<FieldValues>;
  errors: FieldErrors<FieldValues>;
  hasDenomination: string;
}

export default function DenominationSection({ control, errors, hasDenomination }: Props) {
  return (
    <FormSection
      icon={<Church />}
      iconColor="#7C3AED"
      title="Religião / Denominação"
      subtitle="Informação sobre crença religiosa"
    >
      <FormControl>
        <FormLabel sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151', mb: 1 }}>
          Possui religião ou denominação?
        </FormLabel>
        <Controller
          name="hasDenomination"
          control={control}
          render={({ field }) => (
            <RadioGroup row {...field} sx={{ gap: 1 }}>
              {[{ value: 'yes', label: 'Sim' }, { value: 'no', label: 'Não' }].map((opt) => (
                <Paper
                  key={opt.value}
                  variant="outlined"
                  onClick={() => field.onChange(opt.value)}
                  sx={{
                    px: 2, py: 1, borderRadius: 2.5, cursor: 'pointer',
                    border: '2px solid',
                    borderColor: field.value === opt.value ? '#7C3AED' : '#E2E8F0',
                    bgcolor: field.value === opt.value ? 'rgba(124,58,237,0.06)' : 'white',
                    transition: 'all 0.15s',
                  }}
                >
                  <FormControlLabel
                    value={opt.value}
                    control={<Radio size="small" sx={{ color: '#7C3AED' }} />}
                    label={<Typography variant="body2" fontWeight={600}>{opt.label}</Typography>}
                    sx={{ m: 0 }}
                  />
                </Paper>
              ))}
            </RadioGroup>
          )}
        />
      </FormControl>

      {hasDenomination === 'yes' && (
        <Box sx={{ mt: 3 }}>
          <FormControl fullWidth error={!!errors.denomination} sx={{ maxWidth: 400 }}>
            <InputLabel>Denominação / Religião</InputLabel>
            <Controller
              name="denomination"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <Select {...field} label="Denominação / Religião" sx={{ borderRadius: 2.5 }}>
                  {DENOMINATIONS.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.denomination && <FormHelperText>{errors.denomination.message as string}</FormHelperText>}
          </FormControl>
        </Box>
      )}
    </FormSection>
  );
}

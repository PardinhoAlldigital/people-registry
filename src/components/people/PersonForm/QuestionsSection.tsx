import { Box, FormLabel, Grid, Paper, Radio, RadioGroup, FormControlLabel, Typography } from '@mui/material';
import { QuestionAnswer } from '@mui/icons-material';
import { Control, Controller, FieldValues } from 'react-hook-form';
import FormSection from '@/components/ui/FormSection';

interface YesNoFieldProps {
  name: string;
  label: string;
  control: Control<FieldValues>;
}

function YesNoField({ name, label, control }: YesNoFieldProps) {
  return (
    <Box>
      <FormLabel sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#374151', display: 'block', mb: 1 }}>
        {label}
      </FormLabel>
      <Controller
        name={name}
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
                  borderColor: field.value === opt.value ? '#10B981' : '#E2E8F0',
                  bgcolor: field.value === opt.value ? 'rgba(16,185,129,0.06)' : 'white',
                  transition: 'all 0.15s',
                }}
              >
                <FormControlLabel
                  value={opt.value}
                  control={<Radio size="small" sx={{ color: '#10B981' }} />}
                  label={<Typography variant="body2" fontWeight={600}>{opt.label}</Typography>}
                  sx={{ m: 0 }}
                />
              </Paper>
            ))}
          </RadioGroup>
        )}
      />
    </Box>
  );
}

interface Props {
  control: Control<FieldValues>;
}

export default function QuestionsSection({ control }: Props) {
  return (
    <FormSection
      icon={<QuestionAnswer />}
      iconColor="#10B981"
      title="Perguntas"
      subtitle="Interesse em atividades espirituais"
    >
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <YesNoField name="acceptsBibleStudy" label="Aceita estudar a Bíblia?" control={control} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <YesNoField name="acceptsVisit" label="Aceita uma visita?" control={control} />
        </Grid>
      </Grid>
    </FormSection>
  );
}

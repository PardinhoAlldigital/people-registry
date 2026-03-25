import { Autocomplete, Box, Chip, Stack, TextField, Typography } from '@mui/material';
import { ConfirmationNumber, MedicalServices } from '@mui/icons-material';
import { Controller, Control, UseFormRegister, UseFormSetValue, useWatch, FieldValues } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { SERVICES } from '@/types';
import { usePeopleStore } from '@/store/peopleStore';
import FormSection from '@/components/ui/FormSection';

interface Props {
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
}

export default function ServicesSection({ control, register, setValue }: Props) {
  const selectedServices: string[] = useWatch({ control, name: 'services' }) ?? [];
  const { people, fetchPeople, loading } = usePeopleStore();

  // Serviços aguardando dados carregarem para auto-preencher
  const pendingRef = useRef<string[]>([]);
  const prevServicesRef = useRef<string[]>([]);

  // Garante dados frescos ao abrir o formulário
  useEffect(() => {
    fetchPeople();
  }, []);

  function getNextTicket(svc: string): string {
    const numbers = people
      .filter((p) => p.services?.includes(svc) && p.serviceTickets?.[svc])
      .map((p) => Number(p.serviceTickets![svc]))
      .filter((n) => !isNaN(n) && n > 0);

    return numbers.length === 0 ? '20' : String(Math.max(...numbers) + 1);
  }

  // Quando um serviço é adicionado: preenche imediatamente se já carregou,
  // ou coloca na fila para quando os dados chegarem
  useEffect(() => {
    const prev = prevServicesRef.current;
    const added = selectedServices.filter((svc) => !prev.includes(svc));

    if (!loading) {
      added.forEach((svc) => {
        setValue(`serviceTickets.${svc}`, getNextTicket(svc), { shouldDirty: true });
      });
    } else {
      pendingRef.current = [...new Set([...pendingRef.current, ...added])];
    }

    prevServicesRef.current = selectedServices;
  }, [selectedServices]);

  // Quando os dados carregam, preenche os serviços que estavam na fila
  useEffect(() => {
    if (loading) return;
    const pending = pendingRef.current.filter((svc) => selectedServices.includes(svc));
    pending.forEach((svc) => {
      setValue(`serviceTickets.${svc}`, getNextTicket(svc), { shouldDirty: true });
    });
    pendingRef.current = [];
  }, [loading]);

  return (
    <FormSection
      icon={<MedicalServices />}
      iconColor="#F59E0B"
      title="Serviços Utilizados"
      subtitle="Selecione os serviços e informe o número da ficha de cada um"
    >
      <Controller
        name="services"
        control={control}
        defaultValue={[]}
        render={({ field }) => (
          <Autocomplete
            multiple
            options={[...SERVICES]}
            value={field.value ?? []}
            onChange={(_, newValue) => field.onChange(newValue)}
            disableCloseOnSelect
            renderTags={(value: string[], getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  sx={{
                    fontWeight: 600,
                    bgcolor: '#FEF3C7',
                    color: '#92400E',
                    border: '1px solid #F59E0B',
                    '& .MuiChip-deleteIcon': { color: '#B45309' },
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Serviços"
                placeholder={field.value?.length === 0 ? 'Selecione os serviços...' : ''}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
              />
            )}
            sx={{ maxWidth: 600 }}
          />
        )}
      />

      {selectedServices.length > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
            <ConfirmationNumber sx={{ fontSize: 18, color: '#F59E0B' }} />
            <Typography variant="body2" fontWeight={700} color="text.secondary">
              Número da ficha por serviço
            </Typography>
            <Typography variant="caption" color="text.disabled">
              — preenchido automaticamente, pode editar se necessário
            </Typography>
          </Stack>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: 1.5,
            }}
          >
            {selectedServices.map((svc) => (
              <TextField
                key={svc}
                label={svc}
                size="small"
                {...register(`serviceTickets.${svc}`)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5, whiteSpace: 'nowrap' }}>
                        #
                      </Typography>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2.5,
                    bgcolor: '#FFFBEB',
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#F59E0B' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#F59E0B' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#F59E0B' },
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </FormSection>
  );
}

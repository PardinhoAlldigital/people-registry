'use client';

import { Alert, Box, Button, Card, CardContent, Typography } from '@mui/material';
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { useState } from 'react';
import { useForm, FieldValues } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePeopleStore } from '@/store/peopleStore';
import { useRouter } from 'next/navigation';
import PersonalSection from './PersonalSection';
import AddressSection from './AddressSection';
import DenominationSection from './DenominationSection';
import QuestionsSection from './QuestionsSection';
import ReferralSection from './ReferralSection';
import ServicesSection from './ServicesSection';

const schema = z.object({
  fullName: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
  cep: z.string().min(9, 'CEP inválido'),
  street: z.string().min(1, 'Rua obrigatória'),
  complement: z.string(),
  neighborhood: z.string().min(1, 'Bairro obrigatório'),
  city: z.string().min(1, 'Cidade obrigatória'),
  state: z.string().min(2, 'UF obrigatório'),
  idNumber: z.string().optional(),
  phone: z.string().min(14, 'Telefone inválido'),
  hasDenomination: z.enum(['yes', 'no']),
  denomination: z.string().optional(),
  acceptsBibleStudy: z.enum(['yes', 'no']),
  acceptsVisit: z.enum(['yes', 'no']),
  howHeard: z.string().optional(),
  services: z.array(z.string()),
  serviceTickets: z.record(z.string(), z.string()).optional(),
}).refine(
  (d) => d.hasDenomination !== 'yes' || (!!d.denomination && d.denomination.length > 0),
  { message: 'Selecione uma denominação', path: ['denomination'] }
);

type FormData = z.infer<typeof schema>;

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <Card sx={{ borderRadius: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}>
      <CardContent sx={{ p: 3 }}>{children}</CardContent>
    </Card>
  );
}

export default function PersonForm() {
  const { addPerson } = usePeopleStore();
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      hasDenomination: 'no',
      acceptsBibleStudy: 'no',
      acceptsVisit: 'no',
      complement: '',
      idNumber: '',
      howHeard: '',
      services: [],
    },
  });

  const hasDenomination = watch('hasDenomination');

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await addPerson({
        fullName: data.fullName,
        cep: data.cep,
        street: data.street,
        complement: data.complement ?? '',
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        idNumber: data.idNumber ?? '',
        phone: data.phone,
        hasDenomination: data.hasDenomination === 'yes',
        denomination: data.hasDenomination === 'yes' ? data.denomination : undefined,
        acceptsBibleStudy: data.acceptsBibleStudy === 'yes',
        acceptsVisit: data.acceptsVisit === 'yes',
        howHeard: data.howHeard ?? '',
        services: data.services,
      serviceTickets: data.serviceTickets ?? {},
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      setApiError(err.message ?? 'Erro ao salvar cadastro.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/dashboard')}
          size="small"
          sx={{ color: '#64748B', fontWeight: 500, mb: 1.5, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)', transform: 'none' } }}
        >
          Voltar para Dashboard
        </Button>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A' }}>Novo Cadastro</Typography>
        <Typography variant="body2" color="text.secondary">Preencha os dados da pessoa abaixo</Typography>
      </Box>

      {success && (
        <Alert icon={<CheckCircle />} severity="success" sx={{ mb: 3, borderRadius: 2.5, fontWeight: 600 }}>
          Cadastro realizado com sucesso! Redirecionando...
        </Alert>
      )}
      {apiError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }}>{apiError}</Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <SectionCard>
          <PersonalSection register={register as any} control={control as any} errors={errors} />
        </SectionCard>
        <SectionCard>
          <AddressSection register={register as any} setValue={setValue as any} errors={errors} />
        </SectionCard>
        <SectionCard>
          <DenominationSection control={control as any} errors={errors} hasDenomination={hasDenomination} />
        </SectionCard>
        <SectionCard>
          <ServicesSection control={control as any} register={register as any} setValue={setValue as any} />
        </SectionCard>
        <SectionCard>
          <QuestionsSection control={control as any} />
        </SectionCard>
        <SectionCard>
          <ReferralSection register={register as any} />
        </SectionCard>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => router.push('/dashboard')}
            sx={{ px: 4, borderColor: '#E2E8F0', color: '#64748B', '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1', transform: 'none' } }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isSubmitting || success}
            startIcon={success ? <CheckCircle /> : undefined}
            sx={{ px: 5 }}
          >
            {success ? 'Salvo!' : 'Salvar Cadastro'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export const personSchema = z
  .object({
    fullName: z.string().min(3, 'Nome deve ter ao menos 3 caracteres'),
    cep: z.string().min(8, 'CEP inválido'),
    street: z.string().min(1, 'Rua obrigatória'),
    complement: z.string().optional().default(''),
    neighborhood: z.string().min(1, 'Bairro obrigatório'),
    city: z.string().min(1, 'Cidade obrigatória'),
    state: z.string().length(2, 'UF deve ter 2 caracteres'),
    idNumber: z.string().optional().default(''),
    phone: z.string().min(10, 'Telefone inválido'),
    hasDenomination: z.boolean(),
    denomination: z.string().optional(),
    acceptsBibleStudy: z.boolean(),
    acceptsVisit: z.boolean(),
    howHeard: z.string().optional().default(''),
    services: z.array(z.string()).default([]),
    serviceTickets: z.record(z.string(), z.string()).optional().default({}),
  })
  .refine(
    (d) => !d.hasDenomination || (d.denomination && d.denomination.length > 0),
    { message: 'Selecione uma denominação', path: ['denomination'] }
  );

export const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Nome do serviço deve ter ao menos 2 caracteres').max(40, 'Nome muito longo'),
});

export const createMemberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PersonInput = z.infer<typeof personSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type CreateMemberInput = z.infer<typeof createMemberSchema>;

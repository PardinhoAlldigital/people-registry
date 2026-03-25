export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'MEMBER';
  createdAt: string;
  _count?: { people: number };
}

export interface Person {
  id: string;
  fullName: string;
  cep: string;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  idNumber: string;
  phone: string;
  hasDenomination: boolean;
  denomination?: string;
  acceptsBibleStudy: boolean;
  acceptsVisit: boolean;
  services: string[];
  serviceTickets?: Record<string, string>;
  groupId: string;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
}

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export const DENOMINATIONS = [
  'Católico',
  'Evangélico / Cristão',
  'Adventista do Sétimo Dia',
  'Batista',
  'Presbiteriano',
  'Metodista',
  'Pentecostal',
  'Luterano',
  'Ortodoxo',
  'Espírita',
  'Outro',
] as const;

export const SERVICES = [
  'Oculista',
  'Dentista',
  'Cabeleireiro',
  'Enfermagem',
  'Nutrição',
  'Esteticista',
  'Bioimpedância',
  'Psicólogo',
  'Outros',
] as const;

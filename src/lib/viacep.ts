import axios from 'axios';
import { ViaCEPResponse } from '@/types';

export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length !== 8) return null;
  try {
    const { data } = await axios.get<ViaCEPResponse>(
      `https://viacep.com.br/ws/${cleanCEP}/json/`
    );
    if (data.erro) return null;
    return data;
  } catch {
    return null;
  }
}

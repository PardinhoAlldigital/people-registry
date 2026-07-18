import * as XLSX from 'xlsx';
import { Person } from '@/types';

export function exportToExcel(people: Person[]) {
  const rows = people.map((p) => ({
    'Nome Completo': p.fullName,
    CEP: p.cep,
    Rua: p.street,
    Complemento: p.complement,
    Bairro: p.neighborhood,
    Cidade: p.city,
    Estado: p.state,
    RG: p.idNumber,
    Telefone: p.phone,
    'Possui Religião': p.hasDenomination ? 'Sim' : 'Não',
    Religião: p.hasDenomination ? (p.denomination ?? '-') : '-',
    'Como soube da feira': p.howHeard ?? '',
    'Data de Cadastro': new Date(p.createdAt).toLocaleDateString('pt-BR'),
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cadastros');

  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, 'cadastros.xlsx');
}

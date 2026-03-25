import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Person } from '@/types';

export function exportToPDF(people: Person[]) {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(16);
  doc.text('Lista de Cadastros', 14, 15);
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [['Nome Completo', 'Endereço', 'RG', 'Telefone', 'Religião']],
    body: people.map((p) => [
      p.fullName,
      `${p.street}, ${p.neighborhood}, ${p.city}/${p.state} - CEP: ${p.cep}`,
      p.idNumber,
      p.phone,
      p.hasDenomination ? (p.denomination ?? '-') : 'Não informado',
    ]),
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [25, 118, 210], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 247, 255] },
  });

  doc.save('cadastros.pdf');
}

//lib/gerarPDFeUpload.ts

'use client';

import { uploadCertificadoPDF } from '@/lib/certificadoStorage';
import jsPDF from 'jspdf';

export async function gerarPDFeUpload(certificado: {
  usuario: { nome: string; email: string };
  curso: { titulo: string };
  data_emissao: string;
}, token: string): Promise<string> {
  // Criar documento PDF com layout paisagem
  const doc = new jsPDF({ orientation: 'landscape' });

  // Cabeçalho
  doc.setFontSize(24);
  doc.text('Certificado de Conclusão', 105, 30, { align: 'center' });

  // Conteúdo
  doc.setFontSize(16);
  doc.text(`Certificamos que ${certificado.usuario.nome}`, 105, 50, { align: 'center' });
  doc.text(`concluiu com êxito o curso "${certificado.curso.titulo}"`, 105, 60, { align: 'center' });
  doc.text(`em ${new Date(certificado.data_emissao).toLocaleDateString()}`, 105, 70, { align: 'center' });

  // Rodapé
  doc.setFontSize(10);
  const url = typeof window !== 'undefined' ? window.location.href : 'https://chefdocotidiano.com';
  doc.text(`Verifique este certificado em: ${url}`, 105, 90, { align: 'center' });

  // Gerar Blob do PDF
  const pdfBlob = doc.output('blob');

  // Fazer upload para Supabase Storage
  const publicUrl = await uploadCertificadoPDF(pdfBlob, `${token}.pdf`);

  console.log('✅ PDF gerado e enviado:', publicUrl);
  return publicUrl;
}

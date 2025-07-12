// Diretório: app/certificado/[token]/page.tsx — Página pública do certificado
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode.react';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';

export default function PaginaCertificado() {
  const { token } = useParams();
  const [certificado, setCertificado] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarCertificado = async () => {
      const { data, error } = await supabase
        .from('certificado')
        .select('id, curso(titulo), usuario(nome, email), data_emissao')
        .eq('token', token)
        .single();

      setCertificado(data);
      setCarregando(false);

      if (data?.id) {
        await supabase.from('auditoria_certificado').insert({
          certificadoId: data.id,
          acessado_em: new Date().toISOString(),
          email: data.usuario.email
        });
      }
    };

    buscarCertificado();
  }, [token]);

  const urlAtual = typeof window !== 'undefined' ? window.location.href : '';

  const gerarPDF = () => {
    if (!certificado) return;
    const doc = new jsPDF({ orientation: 'landscape' });

    doc.setFontSize(24);
    doc.text('Certificado de Conclusão', 105, 30, { align: 'center' });

    doc.setFontSize(16);
    doc.text(`Certificamos que ${certificado.usuario.nome}`, 105, 50, { align: 'center' });
    doc.text(`concluiu com êxito o curso "${certificado.curso.titulo}"`, 105, 60, { align: 'center' });
    doc.text(`em ${new Date(certificado.data_emissao).toLocaleDateString()}`, 105, 70, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Verifique este certificado em: ${urlAtual}`, 105, 90, { align: 'center' });

    doc.save('certificado.pdf');
  };

  if (carregando) return <p className="p-8">🔄 Carregando certificado...</p>;
  if (!certificado) return <p className="p-8 text-red-600">❌ Certificado não encontrado.</p>;

  return (
    <div className="min-h-screen bg-white p-10 text-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🎓 Certificado de Conclusão</h1>
      <p className="text-lg text-gray-700">Certificamos que</p>
      <h2 className="text-2xl font-semibold text-black">{certificado.usuario.nome}</h2>
      <p className="text-lg text-gray-700">concluiu com êxito o curso</p>
      <h3 className="text-xl italic text-gray-800">"{certificado.curso.titulo}"</h3>
      <p className="text-sm text-gray-500">em {new Date(certificado.data_emissao).toLocaleDateString()}</p>

      <div className="mt-8">
        <QRCode value={urlAtual} size={128} />
        <p className="text-xs text-gray-500 mt-2">Verificação via QR Code</p>
      </div>

      <div className="flex gap-4 justify-center mt-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🖨️ Imprimir Certificado
        </button>
        <button
          onClick={gerarPDF}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          📥 Baixar PDF
        </button>
      </div>
    </div>
  );
}

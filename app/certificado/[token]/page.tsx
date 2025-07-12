// Diretório: app/certificado/[token]/page.tsx — Página pública do certificado
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode.react';
import { supabase } from '@/lib/supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function PaginaCertificado() {
  const { token } = useParams();
  const [certificado, setCertificado] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const buscarCertificado = async () => {
      const { data, error } = await supabase
        .from('certificado')
        .select('id, curso(titulo), usuario(nome, email), data_emissao')
        .eq('token', token)
        .single();

      if (!data || error) {
        setErro('❌ Certificado não encontrado ou inválido.');
        setCarregando(false);
        return;
      }

      const ip = await fetch('/api/ip').then(res => res.text()).catch(() => '');

      const { data: bloqueado } = await supabase
        .from('ip_bloqueado')
        .select('id')
        .eq('certificadoId', data.id)
        .eq('ip', ip)
        .maybeSingle();

      if (bloqueado) {
        setErro('⚠️ Acesso bloqueado por excesso de verificações deste IP.');
        setCarregando(false);
        return;
      }

      setCertificado(data);
      setCarregando(false);

      await supabase.from('auditoria_certificado').insert({
        certificadoId: data.id,
        acessado_em: new Date().toISOString(),
        email: data.usuario.email,
        ip,
      });

      const { count } = await supabase
        .from('auditoria_certificado')
        .select('*', { count: 'exact', head: true })
        .eq('certificadoId', data.id)
        .eq('ip', ip);

      if (count >= 5) {
        await supabase.from('ip_bloqueado').upsert({
          certificadoId: data.id,
          ip,
          bloqueadoEm: new Date().toISOString(),
        });
      }
    };

    buscarCertificado();
  }, [token]);

  const urlAtual = typeof window !== 'undefined' ? window.location.href : '';

  const gerarPDF = async () => {
    if (!certificado) return;

    const doc = new jsPDF({ orientation: 'landscape' });
    const largura = doc.internal.pageSize.getWidth();
    const altura = doc.internal.pageSize.getHeight();

    // Borda
    doc.setDrawColor(0);
    doc.rect(10, 10, largura - 20, altura - 20);

    // Logotipo
    const logo = new Image();
    logo.src = '/logo-certificado.png'; // coloque a imagem em public/logo-certificado.png

    logo.onload = async () => {
      doc.addImage(logo, 'PNG', largura / 2 - 25, 15, 50, 20);

      // Texto
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Certificado de Conclusão', largura / 2, 50, { align: 'center' });

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text(`Certificamos que ${certificado.usuario.nome}`, largura / 2, 70, { align: 'center' });
      doc.text(
        `concluiu com êxito o curso "${certificado.curso.titulo}"`,
        largura / 2,
        80,
        { align: 'center' }
      );
      doc.text(
        `em ${new Date(certificado.data_emissao).toLocaleDateString()}`,
        largura / 2,
        90,
        { align: 'center' }
      );

      // QR Code
      const canvas = document.createElement('canvas');
      const qr = new QRCode(canvas, {
        text: urlAtual,
        width: 100,
        height: 100,
      });

      setTimeout(() => {
        const qrDataUrl = canvas.toDataURL();
        doc.addImage(qrDataUrl, 'PNG', largura / 2 - 15, 110, 30, 30);
        doc.setFontSize(10);
        doc.text('Verificação online', largura / 2, 145, { align: 'center' });

        // Assinatura
        doc.setFontSize(12);
        doc.text('Rodrigo Borges', largura - 60, altura - 35);
        doc.setFontSize(10);
        doc.text('Instrutor Chef do Cotidiano', largura - 60, altura - 30);
        doc.line(largura - 80, altura - 40, largura - 30, altura - 40);

        doc.save('certificado.pdf');
      }, 200);
    };
  };

  if (carregando) return <p className="p-8">🔄 Carregando certificado...</p>;
  if (erro) return <p className="p-8 text-red-600">{erro}</p>;

  return (
    <div className="min-h-screen bg-white p-10 text-center space-y-6 print:bg-white">
      <style>{`
        @media print {
          button {
            display: none;
          }
        }
      `}</style>

      <h1 className="text-3xl font-bold text-gray-800">🎓 Certificado de Conclusão</h1>
      <p className="text-lg text-gray-700">Certificamos que</p>
      <h2 className="text-2xl font-semibold text-black">{certificado.usuario.nome}</h2>
      <p className="text-lg text-gray-700">concluiu com êxito o curso</p>
      <h3 className="text-xl italic text-gray-800">"{certificado.curso.titulo}"</h3>
      <p className="text-sm text-gray-500">
        em {new Date(certificado.data_emissao).toLocaleDateString()}
      </p>

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


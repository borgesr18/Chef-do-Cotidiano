// Diretório: app/certificado/[token]/page.tsx — Página pública do certificado
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode.react';
import { supabase } from '@/lib/supabaseClient';

export default function PaginaCertificado() {
  const { token } = useParams();
  const [certificado, setCertificado] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarCertificado = async () => {
      const { data } = await supabase
        .from('certificado')
        .select('id, curso(titulo), usuario(nome), data_emissao')
        .eq('token', token)
        .single();

      setCertificado(data);
      setCarregando(false);
    };

    buscarCertificado();
  }, [token]);

  if (carregando) return <p className="p-8">🔄 Carregando certificado...</p>;
  if (!certificado) return <p className="p-8 text-red-600">❌ Certificado não encontrado.</p>;

  const urlAtual = typeof window !== 'undefined' ? window.location.href : '';

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

      <button
        onClick={() => window.print()}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 print:hidden"
      >
        🖨️ Imprimir Certificado
      </button>
    </div>
  );
}

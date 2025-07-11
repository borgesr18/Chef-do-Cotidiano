//app/certificado/[id]/page.tsx — Certificado público e verificável
import { supabase } from '@/lib/supabaseClient';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode.react';

export default async function CertificadoPublico({ params }: { params: { id: string } }) {
  const certificadoId = params.id;
  const urlPublica = `${process.env.NEXT_PUBLIC_BASE_URL}/certificado/${certificadoId}`;

  const { data: registro, error } = await supabase
    .from('certificados_publicos')
    .select('user:nome, curso:titulo, curso:autor, criado_em')
    .eq('id', certificadoId)
    .single();

  if (!registro || error) return notFound();

  return (
    <div className="p-10 max-w-3xl mx-auto border border-gray-400 shadow-xl rounded text-center bg-white">
      <h1 className="text-2xl font-bold mb-6">🎓 Certificado de Conclusão</h1>
      <p className="mb-4">Certificamos que</p>
      <h2 className="text-2xl font-semibold mb-4">{registro.user.nome}</h2>
      <p className="mb-4">concluiu com êxito o curso</p>
      <h3 className="text-xl font-semibold mb-4">"{registro.curso.titulo}"</h3>
      <p className="text-gray-600">Autor: {registro.curso.autor}</p>
      <p className="mt-6 text-sm text-gray-500">Emitido em {new Date(registro.criado_em).toLocaleDateString()}</p>

      <div className="mt-10">
        <p className="text-sm text-gray-500 mb-2">Verificação pública:</p>
        <QRCode value={urlPublica} size={100} />
        <p className="text-xs text-gray-400 mt-2">ID do certificado: {certificadoId}</p>
      </div>
    </div>
  );
}

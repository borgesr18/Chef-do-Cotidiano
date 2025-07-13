//app/cursos/[cursoId]/certificado/page.tsx — Certificado de conclusão
'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import html2pdf from 'html2pdf.js';

export default function CertificadoPage() {
  const { cursoId } = useParams();
  const router = useRouter();
  const certificadoRef = useRef<HTMLDivElement>(null);
  const [nomeUsuario, setNomeUsuario] = useState('');
  const [curso, setCurso] = useState<any>(null);
  const [concluiu, setConcluiu] = useState(false);

  useEffect(() => {
    const verificarConclusao = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return router.push('/login');
      setNomeUsuario(user.user_metadata?.nome || user.email);

      const { data: aulas } = await supabase
        .from('aulas')
        .select('id')
        .eq('cursoId', cursoId);

      const { data: progresso } = await supabase
        .from('progresso')
        .select('aulaId')
        .eq('userId', user.id)
        .eq('concluida', true);

      if (aulas && progresso && aulas.length > 0) {
        const concluiuTudo = aulas.every((aula) =>
          progresso.find((p) => p.aulaId === aula.id)
        );
        setConcluiu(concluiuTudo);
      }

      const { data: cursoData } = await supabase
        .from('cursos')
        .select('titulo, autor')
        .eq('id', cursoId)
        .single();

      if (cursoData) setCurso(cursoData);
    };

    verificarConclusao();
  }, [cursoId, router]);

  const imprimir = () => {
    if (certificadoRef.current) window.print();
  };

  const gerarPDF = () => {
    if (certificadoRef.current) {
      html2pdf()
        .from(certificadoRef.current)
        .set({ margin: 1, filename: 'certificado.pdf', html2canvas: { scale: 2 } })
        .save();
    }
  };

  if (!concluiu) {
    return <p className="p-8 text-center">Você ainda não concluiu todas as aulas deste curso.</p>;
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <div ref={certificadoRef} className="border border-gray-400 shadow-xl rounded text-center bg-white p-10">
        <h1 className="text-2xl font-bold mb-6">🎓 Certificado de Conclusão</h1>
        <p className="mb-4">Certificamos que</p>
        <h2 className="text-2xl font-semibold mb-4">{nomeUsuario}</h2>
        <p className="mb-4">concluiu com êxito o curso</p>
        <h3 className="text-xl font-semibold mb-4">"{curso?.titulo}"</h3>
        <p className="text-gray-600">Autor: {curso?.autor}</p>
        <p className="mt-6 text-sm text-gray-500">Emitido em {new Date().toLocaleDateString()}</p>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button
          onClick={imprimir}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          🖨️ Imprimir Certificado
        </button>
        <button
          onClick={gerarPDF}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          📄 Baixar PDF
        </button>
      </div>
    </div>
  );
}


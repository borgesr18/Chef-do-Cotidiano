//app/aluno/certificados/page.tsx — Lista de certificados do aluno
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CertificadosAluno() {
  const [certificados, setCertificados] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const carregarCertificados = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: cursos } = await supabase
        .from('cursos')
        .select('id, titulo, autor')
        .in('id', [
          ...(await supabase
            .from('progresso')
            .select('aulaId')
            .eq('userId', user.id)
            .eq('concluida', true))?.data?.map((p) => p.aulaId) ?? []
        ]);

      const { data: aulas } = await supabase
        .from('aulas')
        .select('id, cursoId');

      const progresso = await supabase
        .from('progresso')
        .select('aulaId')
        .eq('userId', user.id)
        .eq('concluida', true);

      const cursosCompletos = cursos?.filter((curso) => {
        const aulasCurso = aulas?.filter((a) => a.cursoId === curso.id);
        const concluidas = aulasCurso?.filter((aula) =>
          progresso?.data?.find((p) => p.aulaId === aula.id)
        );
        return aulasCurso && aulasCurso.length > 0 && concluidas && aulasCurso.length === concluidas.length;
      });

      setCertificados(cursosCompletos || []);
      setCarregando(false);
    };

    carregarCertificados();
  }, [router]);

  if (carregando) return <p className="p-8">Carregando certificados...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🎓 Meus Certificados</h1>
      {certificados.length === 0 ? (
        <p>Você ainda não concluiu nenhum curso.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificados.map((curso) => (
            <li key={curso.id} className="border rounded p-4">
              <h2 className="text-lg font-semibold mb-2">{curso.titulo}</h2>
              <p className="text-sm text-gray-500 mb-3">Autor: {curso.autor}</p>
              <button
                onClick={() => router.push(`/cursos/${curso.id}/certificado`)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                📜 Ver Certificado
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

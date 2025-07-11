//app/cursos/[cursoId]/aulas/[aulaId]/page.tsx — Página de Aula com botão de conclusão
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AulaPage() {
  const { aulaId } = useParams();
  const [aula, setAula] = useState<any>(null);
  const [concluida, setConcluida] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const carregarAula = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUserId(user.id);

      const { data, error } = await supabase
        .from('aulas')
        .select('id, titulo, video_url, descricao')
        .eq('id', aulaId)
        .single();

      if (data) setAula(data);

      const { data: prog } = await supabase
        .from('progresso')
        .select('concluida')
        .eq('userId', user.id)
        .eq('aulaId', aulaId)
        .maybeSingle();

      if (prog?.concluida) setConcluida(true);
    };

    carregarAula();
  }, [aulaId, router]);

  const marcarComoConcluida = async () => {
    if (!userId || !aulaId) return;
    await supabase
      .from('progresso')
      .upsert({ userId, aulaId, concluida: true });
    setConcluida(true);
  };

  if (!aula) return <p className="p-8">Carregando aula...</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">{aula.titulo}</h1>

      <div className="mb-4">
        <iframe
          src={aula.video_url}
          className="w-full h-64 rounded border"
          allowFullScreen
        ></iframe>
      </div>

      <p className="mb-6 text-gray-700 whitespace-pre-line">{aula.descricao}</p>

      <div className="mt-6">
        {concluida ? (
          <p className="text-green-600 font-semibold">✅ Aula concluída</p>
        ) : (
          <button
            onClick={marcarComoConcluida}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            ✅ Marcar como concluída
          </button>
        )}
      </div>
    </div>
  );
}

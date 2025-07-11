//app/aluno/dashboard/page.tsx — Área do Aluno
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardAluno() {
  const [favoritas, setFavoritas] = useState<any[]>([]);
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [progresso, setProgresso] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const carregarDados = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (!user) return router.push('/login');

      const { data: favs } = await supabase
        .from('favoritos')
        .select('id, receita:receitaId(titulo, imagem_url, id)')
        .eq('userId', user.id);

      const { data: cursos } = await supabase
        .from('inscricoes')
        .select('curso:cursoId(titulo, imagem_url, id, aulas(id))')
        .eq('userId', user.id);

      const { data: progressoData } = await supabase
        .from('progresso')
        .select('aulaId, concluida, aula(cursoId)')
        .eq('userId', user.id);

      setFavoritas(favs || []);
      setInscricoes(cursos || []);
      setProgresso(progressoData || []);
      setCarregando(false);
    };

    carregarDados();
  }, [router]);

  const removerFavorito = async (id: string) => {
    await supabase.from('favoritos').delete().eq('id', id);
    setFavoritas((prev) => prev.filter((f) => f.id !== id));
  };

  const calcularProgresso = (cursoId: string, totalAulas: number) => {
    const concluidas = progresso.filter(
      (p) => p.concluida && p.aula?.cursoId === cursoId
    ).length;
    return totalAulas > 0 ? Math.round((concluidas / totalAulas) * 100) : 0;
  };

  if (carregando) return <p className="p-8">Carregando...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Área do Aluno</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">🍽️ Receitas Favoritas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoritas.map((fav) => (
            <div key={fav.id} className="border rounded p-4 hover:shadow">
              <img
                src={fav.receita.imagem_url}
                alt={fav.receita.titulo}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h3 className="text-lg font-medium cursor-pointer" onClick={() => router.push(`/receitas/${fav.receita.id}`)}>
                {fav.receita.titulo}
              </h3>
              <button
                onClick={() => removerFavorito(fav.id)}
                className="mt-2 text-red-600 text-sm underline"
              >
                Remover dos favoritos
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">🎓 Cursos Inscritos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inscricoes.map((insc) => {
            const curso = insc.curso;
            const totalAulas = curso.aulas?.length || 0;
            const progressoPercentual = calcularProgresso(curso.id, totalAulas);

            return (
              <div
                key={curso.id}
                className="border rounded p-4 hover:shadow cursor-pointer"
                onClick={() => router.push(`/cursos/${curso.id}`)}
              >
                <img
                  src={curso.imagem_url}
                  alt={curso.titulo}
                  className="w-full h-40 object-cover rounded mb-2"
                />
                <h3 className="text-lg font-medium">{curso.titulo}</h3>
                <div className="mt-2 text-sm text-gray-700">
                  Progresso: {progressoPercentual}%
                </div>
                {progressoPercentual > 0 && progressoPercentual < 100 && (
                  <div className="text-blue-600 text-sm mt-1 underline">
                    Continuar assistindo
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

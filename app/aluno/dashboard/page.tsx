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
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">Área do Aluno</h1>
        <p className="text-xl text-neutral-600">Acompanhe seu progresso e gerencie seus favoritos</p>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-display font-semibold text-neutral-900 mb-8 flex items-center">
          <span className="mr-3">🍽️</span>
          Receitas Favoritas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {favoritas.map((fav) => (
            <div key={fav.id} className="card group">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img
                  src={fav.receita.imagem_url}
                  alt={fav.receita.titulo}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <h3 
                className="text-xl font-semibold text-neutral-900 mb-2 cursor-pointer group-hover:text-primary-600 transition-colors" 
                onClick={() => router.push(`/receitas/${fav.receita.id}`)}
              >
                {fav.receita.titulo}
              </h3>
              <button
                onClick={() => removerFavorito(fav.id)}
                className="text-red-600 text-sm hover:text-red-700 transition-colors font-medium"
              >
                Remover dos favoritos
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-display font-semibold text-neutral-900 mb-8 flex items-center">
          <span className="mr-3">🎓</span>
          Cursos Inscritos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {inscricoes.map((insc) => {
            const curso = insc.curso;
            const totalAulas = curso.aulas?.length || 0;
            const progressoPercentual = calcularProgresso(curso.id, totalAulas);

            return (
              <div
                key={curso.id}
                className="card group cursor-pointer"
                onClick={() => router.push(`/cursos/${curso.id}`)}
              >
                <div className="relative overflow-hidden rounded-lg mb-4">
                  <img
                    src={curso.imagem_url}
                    alt={curso.titulo}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-neutral-700">
                    {progressoPercentual}% concluído
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">{curso.titulo}</h3>
                <div className="mb-3">
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-600 to-primary-700 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progressoPercentual}%` }}
                    ></div>
                  </div>
                </div>
                {progressoPercentual > 0 && progressoPercentual < 100 && (
                  <div className="text-primary-600 text-sm font-medium">
                    Continuar assistindo →
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

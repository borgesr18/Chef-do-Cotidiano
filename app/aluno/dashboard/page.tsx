//app/aluno/dashboard/page.tsx — Área do Aluno
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function DashboardAluno() {
  const [favoritas, setFavoritas] = useState<any[]>([]);
  const [inscricoes, setInscricoes] = useState<any[]>([]);
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
        .select('receita:receitaId(titulo, imagem_url, id)')
        .eq('userId', user.id);

      const { data: cursos } = await supabase
        .from('inscricoes')
        .select('curso:cursoId(titulo, imagem_url, id)')
        .eq('userId', user.id);

      setFavoritas(favs || []);
      setInscricoes(cursos || []);
      setCarregando(false);
    };

    carregarDados();
  }, [router]);

  if (carregando) return <p className="p-8">Carregando...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Área do Aluno</h1>

      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-2">🍽️ Receitas Favoritas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoritas.map((fav) => (
            <div
              key={fav.receita.id}
              className="border rounded p-4 hover:shadow cursor-pointer"
              onClick={() => router.push(`/receitas/${fav.receita.id}`)}
            >
              <img src={fav.receita.imagem_url} alt={fav.receita.titulo} className="w-full h-40 object-cover rounded mb-2" />
              <h3 className="text-lg font-medium">{fav.receita.titulo}</h3>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">🎓 Cursos Inscritos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inscricoes.map((insc) => (
            <div
              key={insc.curso.id}
              className="border rounded p-4 hover:shadow cursor-pointer"
              onClick={() => router.push(`/cursos/${insc.curso.id}`)}
            >
              <img src={insc.curso.imagem_url} alt={insc.curso.titulo} className="w-full h-40 object-cover rounded mb-2" />
              <h3 className="text-lg font-medium">{insc.curso.titulo}</h3>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

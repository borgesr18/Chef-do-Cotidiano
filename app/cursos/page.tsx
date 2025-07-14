//app/cursos/page.tsx (exemplo com inscrever-se)
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  imagem_url: string;
}

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    const fetchCursos = async () => {
      const { data, error } = await supabase.from('cursos').select('*');
      if (data) setCursos(data);
    };
    fetchCursos();
  }, []);

  const handleInscrever = async (id: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return alert('Você precisa estar logado.');

    const { error } = await supabase.from('inscricoes').insert({
      user_id: user.data.user.id,
      curso_id: id
    });

    if (error) alert('Erro ao se inscrever');
    else alert('Inscrição realizada com sucesso!');
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Nossos Cursos
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Aprenda culinária prática com nossos cursos especializados
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cursos.map((curso) => (
          <div key={curso.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] group">
            <div className="relative overflow-hidden rounded-lg mb-4">
              <img src={curso.imagem_url} alt={curso.titulo} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{curso.titulo}</h3>
            <p className="text-gray-600 text-sm mb-4">{curso.descricao}</p>
            <button
              onClick={() => handleInscrever(curso.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full"
            >
              Inscrever-se
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

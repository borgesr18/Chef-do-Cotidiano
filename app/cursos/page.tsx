//app/cursos/page.tsx (exemplo com inscrever-se)
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Curso {
  id: string;
  titulo: string;
  descricao: string;
  imagem: string;
}

export default function Cursos() {
  const [cursos, setCursos] = useState<Curso[]>([]);

  useEffect(() => {
    setCursos([
      { id: '1', titulo: 'Curso Gratuito', descricao: 'Do Zero ao Prato Feito', imagem: '/imagens/curso.jpg' }
    ]);
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Cursos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cursos.map((curso) => (
          <div key={curso.id} className="bg-white rounded shadow p-4">
            <img src={curso.imagem} alt={curso.titulo} className="w-full h-40 object-cover rounded" />
            <h3 className="mt-2 font-bold">{curso.titulo}</h3>
            <p className="text-sm text-gray-600">{curso.descricao}</p>
            <button
              onClick={() => handleInscrever(curso.id)}
              className="mt-2 bg-black text-white px-4 py-2 rounded"
            >
              Inscrever-se
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

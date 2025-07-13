//app/admin/cursos/page.tsx — Cadastro de Curso
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function GerenciarCursos() {
  const router = useRouter();
  const [cursos, setCursos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarCursos = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return router.push('/login');

      const { data: perfil } = await supabase
        .from('perfis_usuarios')
        .select('tipo')
        .eq('user_id', user.id)
        .single();

      if (perfil?.tipo !== 'admin') return router.push('/');

      const { data } = await supabase.from('cursos').select('*').order('criado_em', { ascending: false });
      setCursos(data || []);
      setCarregando(false);
    };
    carregarCursos();
  }, [router]);

  const excluirCurso = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;
    await supabase.from('cursos').delete().eq('id', id);
    setCursos(cursos.filter((c) => c.id !== id));
  };

  if (carregando) return <p className="p-8">Carregando cursos...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎓 Cursos Cadastrados</h1>
        <button
          onClick={() => router.push('/admin/cursos/novo')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          ➕ Novo Curso
        </button>
      </div>
      {cursos.length === 0 ? (
        <p>Nenhum curso cadastrado.</p>
      ) : (
        <table className="w-full border mt-4">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Título</th>
              <th className="p-2 border">Autor</th>
              <th className="p-2 border">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cursos.map((curso) => (
              <tr key={curso.id}>
                <td className="p-2 border">{curso.titulo}</td>
                <td className="p-2 border">{curso.autor}</td>
                <td className="p-2 border">
                  <button
                    className="text-blue-600 hover:underline mr-3"
                    onClick={() => router.push(`/admin/cursos/${curso.id}`)}
                  >
                    Editar
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => excluirCurso(curso.id)}
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

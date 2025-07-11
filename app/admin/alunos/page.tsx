// Diretório: app/admin/alunos/page.tsx — Gerenciar Alunos
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function GerenciarAlunos() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const carregar = async () => {
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data: perfil } = await supabase
        .from('perfis_usuarios')
        .select('tipo')
        .eq('user_id', user.id)
        .single();

      if (perfil?.tipo !== 'admin') return router.push('/');

      const { data } = await supabase
        .from('usuarios')
        .select('id, nome, email, tipo')
        .order('nome');

      setAlunos(data || []);
      setCarregando(false);
    };

    carregar();
  }, [router]);

  const promoverAdmin = async (id: string) => {
    await supabase.from('usuarios').update({ tipo: 'ADMIN' }).eq('id', id);
    setAlunos((prev) => prev.map((a) => (a.id === id ? { ...a, tipo: 'ADMIN' } : a)));
  };

  if (carregando) return <p className="p-8">Carregando alunos...</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👨‍🎓 Alunos Cadastrados</h1>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Perfil</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunos.map((aluno) => (
            <tr key={aluno.id}>
              <td className="p-2 border">{aluno.nome}</td>
              <td className="p-2 border">{aluno.email}</td>
              <td className="p-2 border">{aluno.tipo}</td>
              <td className="p-2 border">
                {aluno.tipo !== 'ADMIN' && (
                  <button
                    onClick={() => promoverAdmin(aluno.id)}
                    className="text-blue-600 hover:underline"
                  >
                    Promover a Admin
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

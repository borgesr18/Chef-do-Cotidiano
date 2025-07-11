// Diretório: app/admin/alunos/page.tsx — Gerenciar Alunos
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function GerenciarAlunos() {
  const [alunos, setAlunos] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('');
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

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id, nome, email, tipo')
        .order('nome');

      const alunosComProgresso = await Promise.all(
        (usuarios || []).map(async (aluno) => {
          const [{ count: inscritos }, { count: concluidas }, { count: certificados }] = await Promise.all([
            supabase.from('inscricoes').select('*', { count: 'exact', head: true }).eq('userId', aluno.id),
            supabase.from('conclusaoaula').select('*', { count: 'exact', head: true }).eq('usuarioId', aluno.id),
            supabase.from('certificado').select('*', { count: 'exact', head: true }).eq('usuarioId', aluno.id),
          ]);
          return {
            ...aluno,
            cursos: inscritos || 0,
            aulas: concluidas || 0,
            certificados: certificados || 0,
          };
        })
      );

      setAlunos(alunosComProgresso);
      setCarregando(false);
    };

    carregar();
  }, [router]);

  const promoverAdmin = async (id: string) => {
    await supabase.from('usuarios').update({ tipo: 'ADMIN' }).eq('id', id);
    setAlunos((prev) =>
      prev.map((a) => (a.id === id ? { ...a, tipo: 'ADMIN' } : a))
    );
  };

  const alunosFiltrados = alunos.filter(
    (a) =>
      a.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      a.email.toLowerCase().includes(filtro.toLowerCase())
  );

  if (carregando) return <p className="p-8">Carregando alunos...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👨‍🎓 Alunos Cadastrados</h1>

      <input
        type="text"
        placeholder="🔎 Buscar por nome ou email"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
        className="border p-2 mb-4 w-full max-w-md rounded"
      />

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nome</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Perfil</th>
            <th className="p-2 border">Cursos</th>
            <th className="p-2 border">Aulas</th>
            <th className="p-2 border">Certificados</th>
            <th className="p-2 border">Ações</th>
          </tr>
        </thead>
        <tbody>
          {alunosFiltrados.map((aluno) => (
            <tr key={aluno.id}>
              <td className="p-2 border">{aluno.nome}</td>
              <td className="p-2 border">{aluno.email}</td>
              <td className="p-2 border">{aluno.tipo}</td>
              <td className="p-2 border text-center">{aluno.cursos}</td>
              <td className="p-2 border text-center">{aluno.aulas}</td>
              <td className="p-2 border text-center">{aluno.certificados}</td>
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


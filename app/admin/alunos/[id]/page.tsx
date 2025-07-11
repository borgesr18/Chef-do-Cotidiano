// Diretório: app/admin/alunos/[id]/page.tsx — Perfil do Aluno (Admin)
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PerfilAlunoAdmin() {
  const params = useParams();
  const router = useRouter();
  const [aluno, setAluno] = useState<any>(null);
  const [carregando, setCarregando] = useState(true);

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

      const { data: usuario } = await supabase
        .from('usuarios')
        .select('id, nome, email, tipo')
        .eq('id', params.id)
        .single();

      const [{ count: inscritos }, { count: aulas }, { count: certificados }] = await Promise.all([
        supabase.from('inscricoes').select('*', { count: 'exact', head: true }).eq('userId', params.id),
        supabase.from('conclusaoaula').select('*', { count: 'exact', head: true }).eq('usuarioId', params.id),
        supabase.from('certificado').select('*', { count: 'exact', head: true }).eq('usuarioId', params.id),
      ]);

      setAluno({
        ...usuario,
        cursos: inscritos || 0,
        aulas: aulas || 0,
        certificados: certificados || 0
      });

      setCarregando(false);
    };

    carregar();
  }, [params.id, router]);

  if (carregando) return <p className="p-8">🔄 Carregando informações do aluno...</p>;

  if (!aluno) return <p className="p-8 text-red-600">❌ Aluno não encontrado.</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">👤 Perfil do Aluno</h1>

      <div className="bg-white border rounded shadow p-6 space-y-2">
        <p><strong>Nome:</strong> {aluno.nome}</p>
        <p><strong>Email:</strong> {aluno.email}</p>
        <p><strong>Tipo:</strong> {aluno.tipo}</p>
        <p><strong>Cursos inscritos:</strong> {aluno.cursos}</p>
        <p><strong>Aulas concluídas:</strong> {aluno.aulas}</p>
        <p><strong>Certificados emitidos:</strong> {aluno.certificados}</p>
      </div>

      <button
        onClick={() => router.push('/admin/alunos')}
        className="mt-6 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
      >
        ⬅️ Voltar para a lista de alunos
      </button>
    </div>
  );
}

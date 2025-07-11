// Diretório: app/admin/alunos/[id]/page.tsx — Perfil do Aluno (Admin)
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function PerfilAlunoAdmin() {
  const params = useParams();
  const router = useRouter();
  const [aluno, setAluno] = useState<any>(null);
  const [inscricoes, setInscricoes] = useState<any[]>([]);
  const [aulasConcluidas, setAulasConcluidas] = useState<any[]>([]);
  const [certificados, setCertificados] = useState<any[]>([]);
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

      const { data: cursos } = await supabase
        .from('inscricoes')
        .select('curso:cursoId(titulo, id)')
        .eq('userId', params.id);

      const { data: aulas } = await supabase
        .from('conclusaoaula')
        .select('aula:aulaId(titulo, cursoId)')
        .eq('usuarioId', params.id);

      const { data: certs } = await supabase
        .from('certificado')
        .select('cursoId, url')
        .eq('usuarioId', params.id);

      setAluno(usuario);
      setInscricoes(cursos || []);
      setAulasConcluidas(aulas || []);
      setCertificados(certs || []);
      setCarregando(false);
    };

    carregar();
  }, [params.id, router]);

  if (carregando) return <p className="p-8">🔄 Carregando informações do aluno...</p>;
  if (!aluno) return <p className="p-8 text-red-600">❌ Aluno não encontrado.</p>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">👤 Perfil do Aluno</h1>

      <div className="bg-white border rounded shadow p-6 space-y-2">
        <p><strong>Nome:</strong> {aluno.nome}</p>
        <p><strong>Email:</strong> {aluno.email}</p>
        <p><strong>Tipo:</strong> {aluno.tipo}</p>
        <p><strong>Cursos inscritos:</strong> {inscricoes.length}</p>
        <p><strong>Aulas concluídas:</strong> {aulasConcluidas.length}</p>
        <p><strong>Certificados emitidos:</strong> {certificados.length}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">🎓 Cursos Inscritos</h2>
        <ul className="list-disc pl-6">
          {inscricoes.map((i) => (
            <li key={i.curso.id}>{i.curso.titulo}</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold">📚 Aulas Concluídas</h2>
        <ul className="list-disc pl-6">
          {aulasConcluidas.map((a, idx) => (
            <li key={idx}>{a.aula.titulo}</li>
          ))}
        </ul>

        <h2 className="text-xl font-semibold">📄 Certificados Emitidos</h2>
        <ul className="list-disc pl-6">
          {certificados.map((c, idx) => (
            <li key={idx}>
              Curso ID: {c.cursoId} — <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Certificado</a>
            </li>
          ))}
        </ul>
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


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
        .select('curso:cursoId(id, titulo, aulas:aulas(id))')
        .eq('userId', params.id);

      const { data: aulas } = await supabase
        .from('conclusaoaula')
        .select('aula:aulaId(id, titulo, cursoId)')
        .eq('usuarioId', params.id);

      const { data: certs } = await supabase
        .from('certificado')
        .select('id, cursoId, url')
        .eq('usuarioId', params.id);

      setAluno(usuario);
      setInscricoes(cursos || []);
      setAulasConcluidas(aulas || []);
      setCertificados(certs || []);
      setCarregando(false);
    };

    carregar();
  }, [params.id, router]);

  const reemitirCertificado = async (certId: string) => {
    // Aqui pode chamar endpoint para regenerar PDF ou atualizar token
    alert(`Reemissão de certificado ID: ${certId}`);
  };

  const invalidarCertificado = async (certId: string) => {
    await supabase.from('certificado').delete().eq('id', certId);
    setCertificados((prev) => prev.filter((c) => c.id !== certId));
  };

  const enviarCertificado = async (email: string, url: string) => {
    await fetch('/api/enviar-certificado', {
      method: 'POST',
      body: JSON.stringify({ email, url }),
      headers: { 'Content-Type': 'application/json' }
    });
    alert('Certificado enviado!');
  };

  const progressoCurso = (curso: any) => {
    const aulasTotais = curso.curso.aulas?.length || 0;
    const aulasFeitas = aulasConcluidas.filter(
      (a) => a.aula.cursoId === curso.curso.id
    ).length;
    return aulasTotais > 0 ? Math.round((aulasFeitas / aulasTotais) * 100) : 0;
  };

  if (carregando) return <p className="p-8">🔄 Carregando informações do aluno...</p>;
  if (!aluno) return <p className="p-8 text-red-600">❌ Aluno não encontrado.</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">👤 Perfil do Aluno</h1>

      <div className="bg-white border rounded shadow p-6 space-y-2">
        <p><strong>Nome:</strong> {aluno.nome}</p>
        <p><strong>Email:</strong> {aluno.email}</p>
        <p><strong>Tipo:</strong> {aluno.tipo}</p>
        <p><strong>Cursos inscritos:</strong> {inscricoes.length}</p>
        <p><strong>Aulas concluídas:</strong> {aulasConcluidas.length}</p>
        <p><strong>Certificados emitidos:</strong> {certificados.length}</p>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">🎓 Cursos Inscritos</h2>
          <ul className="list-disc pl-6">
            {inscricoes.map((i) => (
              <li key={i.curso.id}>
                {i.curso.titulo} — <span className="text-sm text-gray-600">Progresso: {progressoCurso(i)}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">📚 Aulas Concluídas</h2>
          <ul className="list-disc pl-6">
            {aulasConcluidas.map((a, idx) => (
              <li key={idx}>{a.aula.titulo}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">📄 Certificados Emitidos</h2>
          <ul className="list-disc pl-6">
            {certificados.map((c, idx) => (
              <li key={idx} className="mb-2">
                Curso ID: {c.cursoId} — <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Certificado</a>
                <div className="flex gap-4 mt-1">
                  <button
                    onClick={() => reemitirCertificado(c.id)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    🔁 Reemitir
                  </button>
                  <button
                    onClick={() => invalidarCertificado(c.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    ❌ Invalidar
                  </button>
                  <button
                    onClick={() => enviarCertificado(aluno.email, c.url)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    📧 Enviar por Email
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
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


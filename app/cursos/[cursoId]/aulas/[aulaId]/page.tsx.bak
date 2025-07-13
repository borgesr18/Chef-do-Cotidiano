//app/cursos/[cursoId]/aulas/[aulaId]/page.tsx — Página de Aula com botão de conclusão
'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AulaPage() {
  const { cursoId, aulaId } = useParams();
  const [aula, setAula] = useState<any>(null);
  const [aulasCurso, setAulasCurso] = useState<any[]>([]);
  const [concluida, setConcluida] = useState(false);
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [novoComentario, setNovoComentario] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [editandoComentarioId, setEditandoComentarioId] = useState<string | null>(null);
  const [textoEditado, setTextoEditado] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const carregarAula = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return router.push('/login');
      setUserId(user.id);
      setUserEmail(user.email);

      const { data } = await supabase
        .from('aulas')
        .select('id, titulo, video_url, descricao, ordem')
        .eq('id', aulaId)
        .single();

      if (data) setAula(data);

      const { data: prog } = await supabase
        .from('progresso')
        .select('concluida')
        .eq('userId', user.id)
        .eq('aulaId', aulaId)
        .maybeSingle();

      if (prog?.concluida) setConcluida(true);

      const { data: todasAulas } = await supabase
        .from('aulas')
        .select('id, titulo, ordem')
        .eq('cursoId', cursoId)
        .order('ordem', { ascending: true });

      setAulasCurso(todasAulas || []);

      await carregarComentarios();
    };

    carregarAula();
  }, [aulaId, cursoId, router]);

  const carregarComentarios = async () => {
    const { data: comentariosData } = await supabase
      .from('comentarios')
      .select('id, conteudo, created_at, usuarioId, user:usuarioId(email)')
      .eq('aulaId', aulaId)
      .order('created_at', { ascending: true });
    setComentarios(comentariosData || []);
  };

  const marcarComoConcluida = async () => {
    if (!userId || !aulaId) return;
    await supabase.from('progresso').upsert({ userId, aulaId, concluida: true });
    setConcluida(true);
    await fetch('/api/notificar-conclusao', {
      method: 'POST',
      body: JSON.stringify({ aulaId, userEmail }),
    });
  };

  const irParaProxima = () => {
    if (!aula || !aulasCurso.length) return;
    const atualIndex = aulasCurso.findIndex((a) => a.id === aula.id);
    const proxima = aulasCurso[atualIndex + 1];
    if (proxima) router.push(`/cursos/${cursoId}/aulas/${proxima.id}`);
  };

  const enviarComentario = async () => {
    if (!novoComentario.trim()) return;
    await supabase.from('comentarios').insert({ aulaId, usuarioId: userId, conteudo: novoComentario });
    setNovoComentario('');
    await carregarComentarios();
  };

  const excluirComentario = async (id: string) => {
    await supabase.from('comentarios').delete().eq('id', id);
    await carregarComentarios();
  };

  const salvarEdicao = async (id: string) => {
    await supabase.from('comentarios').update({ conteudo: textoEditado }).eq('id', id);
    setEditandoComentarioId(null);
    setTextoEditado('');
    await carregarComentarios();
  };

  if (!aula) return <p className="p-8">Carregando aula...</p>;

  return (
    <div className="flex">
      <aside className="w-64 p-4 border-r h-screen overflow-y-auto hidden md:block">
        <h2 className="text-lg font-bold mb-3">Aulas do Curso</h2>
        <ul className="space-y-2">
          {aulasCurso.map((a) => (
            <li
              key={a.id}
              onClick={() => router.push(`/cursos/${cursoId}/aulas/${a.id}`)}
              className={`cursor-pointer px-3 py-2 rounded hover:bg-gray-100 ${
                a.id === aula.id ? 'bg-blue-100 font-semibold' : ''
              }`}
            >
              {a.titulo}
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">{aula.titulo}</h1>

        <div className="mb-4">
          <iframe
            src={aula.video_url}
            className="w-full h-64 rounded border"
            allowFullScreen
            onLoad={() => window.scrollTo(0, 0)}
          ></iframe>
        </div>

        <p className="mb-6 text-gray-700 whitespace-pre-line">{aula.descricao}</p>

        <div className="mt-6 flex flex-col gap-3">
          {concluida ? (
            <p className="text-green-600 font-semibold">✅ Aula concluída</p>
          ) : (
            <button
              onClick={marcarComoConcluida}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              ✅ Marcar como concluída
            </button>
          )}

          {aulasCurso.length > 1 && (
            <button
              onClick={irParaProxima}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              ➡️ Próxima aula
            </button>
          )}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">💬 Comentários</h2>

          <div className="mb-4">
            <textarea
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              placeholder="Digite seu comentário..."
              className="w-full border rounded p-2 mb-2"
              rows={3}
            ></textarea>
            <button
              onClick={enviarComentario}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Enviar comentário
            </button>
          </div>

          <div className="space-y-4">
            {comentarios.map((c) => (
              <div key={c.id} className="border rounded p-3">
                <p className="text-sm text-gray-700 mb-1">{c.user.email} • {new Date(c.created_at).toLocaleString()}</p>

                {editandoComentarioId === c.id ? (
                  <>
                    <textarea
                      value={textoEditado}
                      onChange={(e) => setTextoEditado(e.target.value)}
                      className="w-full border rounded p-2 mb-2"
                      rows={3}
                    ></textarea>
                    <button
                      onClick={() => salvarEdicao(c.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                    >Salvar</button>
                    <button
                      onClick={() => setEditandoComentarioId(null)}
                      className="text-sm text-gray-600"
                    >Cancelar</button>
                  </>
                ) : (
                  <>
                    <p className="mb-1">{c.conteudo}</p>
                    {c.usuarioId === userId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditandoComentarioId(c.id);
                            setTextoEditado(c.conteudo);
                          }}
                          className="text-blue-600 text-sm"
                        >Editar</button>
                        <button
                          onClick={() => excluirComentario(c.id)}
                          className="text-red-600 text-sm"
                        >Excluir</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

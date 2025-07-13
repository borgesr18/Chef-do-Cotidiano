// app/admin/cursos/[id]/page.tsx — Edição de Curso Existente
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/auth-client';

export default function EditarCurso() {
  const router = useRouter();
  const params = useParams();
  const cursoId = params?.id as string;

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [autor, setAutor] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const carregarCurso = async () => {
      const { data, error } = await supabase
        .from('cursos')
        .select('*')
        .eq('id', cursoId)
        .single();

      if (error || !data) return setErro('Curso não encontrado');

      setTitulo(data.titulo);
      setDescricao(data.descricao);
      setImagemUrl(data.imagem_url);
      setAutor(data.autor);
      setCarregando(false);
    };

    if (cursoId) carregarCurso();
  }, [cursoId]);

  const handleSalvar = async () => {
    if (!titulo || !descricao || !imagemUrl || !autor) {
      return setErro('Preencha todos os campos');
    }

    const { error } = await supabase
      .from('cursos')
      .update({
        titulo,
        descricao,
        imagem_url: imagemUrl,
        autor,
      })
      .eq('id', cursoId);

    if (error) return setErro(error.message);

    router.push('/admin/cursos');
  };

  if (carregando) return <p className="p-8">Carregando curso...</p>;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">✏️ Editar Curso</h1>
      {erro && <p className="text-red-600 mb-4">{erro}</p>}
      <div className="space-y-4">
        <input
          placeholder="Título do curso"
          className="w-full border p-2 rounded"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <textarea
          placeholder="Descrição do curso"
          className="w-full border p-2 rounded"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        <input
          placeholder="URL da imagem (capa)"
          className="w-full border p-2 rounded"
          value={imagemUrl}
          onChange={(e) => setImagemUrl(e.target.value)}
        />
        <input
          placeholder="Autor do curso"
          className="w-full border p-2 rounded"
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSalvar}
        >
          Salvar Alterações
        </button>
      </div>
    </div>
  );
}


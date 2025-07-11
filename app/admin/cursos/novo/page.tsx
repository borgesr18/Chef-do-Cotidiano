//app/admin/cursos/novo/page.tsx — Cadastro de Novo Curso
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NovoCurso() {
  const router = useRouter();
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagemUrl, setImagemUrl] = useState('');
  const [autor, setAutor] = useState('');
  const [erro, setErro] = useState('');

  const handleSalvar = async () => {
    if (!titulo || !descricao || !imagemUrl || !autor) {
      return setErro('Preencha todos os campos');
    }
    const { error } = await supabase.from('cursos').insert({
      titulo,
      descricao,
      imagem_url: imagemUrl,
      autor,
      criado_em: new Date().toISOString(),
    });
    if (error) return setErro(error.message);
    router.push('/admin/cursos');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">➕ Novo Curso</h1>
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
          Salvar Curso
        </button>
      </div>
    </div>
  );
}

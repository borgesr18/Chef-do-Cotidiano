//app/admin/cursos/page.tsx — Cadastro de Curso
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CadastroCurso() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [imagem, setImagem] = useState('');
  const [slug, setSlug] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('cursos').insert({
      titulo,
      descricao,
      imagem_url: imagem,
      slug
    });

    if (error) alert('Erro ao cadastrar curso');
    else alert('Curso cadastrado com sucesso!');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cadastrar Novo Curso</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className="w-full p-2 border" />
        <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (ex: curso-gratuito)" className="w-full p-2 border" />
        <input type="text" value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="URL da Imagem" className="w-full p-2 border" />
        <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Descrição" className="w-full p-2 border h-24" />
        <button type="submit" className="bg-black text-white px-6 py-2">Cadastrar Curso</button>
      </form>
    </div>
  );
}

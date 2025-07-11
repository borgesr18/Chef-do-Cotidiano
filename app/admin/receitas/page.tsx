//app/admin/receitas/page.tsx — Cadastro de Receita
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function CadastroReceita() {
  const [titulo, setTitulo] = useState('');
  const [tempo, setTempo] = useState('');
  const [imagem, setImagem] = useState('');
  const [modoPreparo, setModoPreparo] = useState('');
  const [ingredientes, setIngredientes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    if (!user.data.user) return alert('Você precisa estar logado.');

    const { error } = await supabase.from('receitas').insert({
      titulo,
      tempo_preparo: tempo,
      imagem_url: imagem,
      modo_preparo: modoPreparo,
      ingredientes,
      autor_id: user.data.user.id
    });

    if (error) alert('Erro ao cadastrar');
    else alert('Receita cadastrada com sucesso!');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Cadastrar Nova Receita</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className="w-full p-2 border" />
        <input type="text" value={tempo} onChange={(e) => setTempo(e.target.value)} placeholder="Tempo de Preparo" className="w-full p-2 border" />
        <input type="text" value={imagem} onChange={(e) => setImagem(e.target.value)} placeholder="URL da Imagem" className="w-full p-2 border" />
        <textarea value={ingredientes} onChange={(e) => setIngredientes(e.target.value)} placeholder="Ingredientes" className="w-full p-2 border h-24" />
        <textarea value={modoPreparo} onChange={(e) => setModoPreparo(e.target.value)} placeholder="Modo de Preparo" className="w-full p-2 border h-24" />
        <button type="submit" className="bg-black text-white px-6 py-2">Cadastrar Receita</button>
      </form>
    </div>
  );
}

//app/receitas/page.tsx (exemplo com salvar receita)
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Receita {
  id: string;
  titulo: string;
  tempo_preparo: string;
  imagem_url: string;
}

export default function Receitas() {
  const [receitas, setReceitas] = useState<Receita[]>([]);

  useEffect(() => {
    const fetchReceitas = async () => {
      const { data, error } = await supabase.from('receitas').select('*');
      if (data) setReceitas(data);
    };
    fetchReceitas();
  }, []);

  const handleSalvar = async (id: string) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return alert('Você precisa estar logado.');

    const { error } = await supabase.from('favoritos').insert({
      user_id: user.data.user.id,
      receita_id: id
    });

    if (error) alert('Erro ao salvar receita');
    else alert('Receita salva com sucesso!');
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4">
          Nossas Receitas
        </h1>
        <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
          Receitas práticas e saborosas para o dia a dia
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {receitas.map((receita) => (
          <div key={receita.id} className="card group">
            <div className="relative overflow-hidden rounded-lg mb-4">
              <img src={receita.imagem_url} alt={receita.titulo} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-neutral-700">
                ⏱️ {receita.tempo_preparo}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">{receita.titulo}</h3>
            <p className="text-neutral-600 text-sm mb-4">Tempo: {receita.tempo_preparo}</p>
            <button
              onClick={() => handleSalvar(receita.id)}
              className="btn-primary w-full"
            >
              Salvar Receita
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


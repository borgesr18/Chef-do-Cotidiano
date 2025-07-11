//app/receitas/page.tsx (exemplo com salvar receita)
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Receita {
  id: string;
  titulo: string;
  tempo: string;
  imagem: string;
}

export default function Receitas() {
  const [receitas, setReceitas] = useState<Receita[]>([]);

  useEffect(() => {
    // Substituir por fetch real do Supabase depois
    setReceitas([
      { id: '1', titulo: 'Hambúrguer Artesanal', tempo: '30min', imagem: '/imagens/hamburguer.jpg' },
      { id: '2', titulo: 'Estrogonofe de Frango', tempo: '25min', imagem: '/imagens/estrogonofe.jpg' }
    ]);
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Receitas</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {receitas.map((receita) => (
          <div key={receita.id} className="bg-white rounded shadow p-4">
            <img src={receita.imagem} alt={receita.titulo} className="w-full h-40 object-cover rounded" />
            <h3 className="mt-2 font-bold">{receita.titulo}</h3>
            <p className="text-sm text-gray-600">Tempo: {receita.tempo}</p>
            <button
              onClick={() => handleSalvar(receita.id)}
              className="mt-2 bg-black text-white px-4 py-2 rounded"
            >
              Salvar Receita
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

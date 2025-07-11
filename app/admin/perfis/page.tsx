//app/admin/perfis/page.tsx — Painel de gerenciamento de perfis
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { requireAdmin } from '@/lib/roleCheck';

export default function GerenciarPerfis() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    requireAdmin();

    const carregarUsuarios = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, perfis(tipo)');

      if (!error && data) setUsuarios(data);
      setCarregando(false);
    };

    carregarUsuarios();
  }, []);

  const promoverParaAdmin = async (userId: string) => {
    const { error } = await supabase.from('perfis').upsert({ user_id: userId, tipo: 'admin' });
    if (error) alert('Erro ao promover');
    else alert('Usuário promovido a admin');
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Perfis</h1>
      {carregando ? (
        <p>Carregando usuários...</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="text-left p-2">E-mail</th>
              <th className="text-left p-2">Tipo</th>
              <th className="text-left p-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.perfis?.tipo || 'aluno'}</td>
                <td className="p-2">
                  <button
                    onClick={() => promoverParaAdmin(user.id)}
                    className="bg-black text-white px-4 py-1 rounded"
                  >
                    Tornar Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

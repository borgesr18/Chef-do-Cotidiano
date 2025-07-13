//admin/notificacoes/page.tsx

'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const { data } = await supabase
        .from('notificacoes')
        .select('*, usuario:usuario(id, nome, email)')
        .order('criadoEm', { ascending: false });

      setNotificacoes(data || []);
      setCarregando(false);
    };

    carregar();
  }, []);

  const notificacoesFiltradas = notificacoes.filter((n) =>
    n.usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    n.usuario.email.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔔 Notificações Enviadas</h1>

      <input
        type="text"
        placeholder="Buscar por nome ou e-mail"
        className="border rounded p-2 mb-6 w-full"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <ul className="space-y-4">
          {notificacoesFiltradas.map((n) => (
            <li key={n.id} className="border rounded p-4 bg-white shadow">
              <p className="text-sm text-gray-500">{new Date(n.criadoEm).toLocaleString()}</p>
              <p className="font-semibold">{n.titulo}</p>
              <p>{n.mensagem}</p>
              <p className="text-xs text-blue-600">
                Enviado via {n.canal.toUpperCase()} – <strong>{n.usuario.nome}</strong> ({n.usuario.email})
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

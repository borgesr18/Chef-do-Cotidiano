//aluno/notificacoes/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { formatDistanceToNow } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export default function NotificacoesAlunoPage() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarNotificacoes = async () => {
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error: notifError } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('userId', user.id)
        .order('criadoEm', { ascending: false });

      if (notifError) {
        console.error(notifError);
      } else {
        setNotificacoes(data || []);
      }

      setCarregando(false);
    };

    carregarNotificacoes();
  }, []);

  if (carregando) return <p className="p-6">Carregando notificações...</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔔 Minhas Notificações</h1>

      {notificacoes.length === 0 ? (
        <p className="text-gray-600">Nenhuma notificação recebida ainda.</p>
      ) : (
        <ul className="space-y-4">
          {notificacoes.map((n) => (
            <li key={n.id} className="bg-white p-4 rounded shadow border">
              <div className="text-sm text-gray-500 mb-1">
                {formatDistanceToNow(new Date(n.criadoEm), {
                  addSuffix: true,
                  locale: ptBR
                })} - {n.tipo.toUpperCase()} via {n.canal}
              </div>
              <h3 className="text-lg font-semibold mb-1">{n.titulo}</h3>
              <p className="text-gray-800 text-sm">{n.mensagem}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

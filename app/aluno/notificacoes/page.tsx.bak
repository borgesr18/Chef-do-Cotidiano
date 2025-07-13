///app/aluno/notificacoes/page.tsx

'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const carregar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('userId', user.id)
        .order('criadoEm', { ascending: false });

      setNotificacoes(data || []);
      setCarregando(false);
    };

    carregar();
  }, [router]);

  if (carregando) return <p className="p-8">Carregando...</p>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📨 Histórico de Notificações</h1>
      <ul className="space-y-4">
        {notificacoes.map((n) => (
          <li key={n.id} className="border rounded p-4">
            <p className="text-sm text-gray-500">{new Date(n.criadoEm).toLocaleString()}</p>
            <p className="font-semibold">{n.titulo}</p>
            <p>{n.mensagem}</p>
            <p className="text-xs text-blue-600">Enviado via {n.canal.toUpperCase()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

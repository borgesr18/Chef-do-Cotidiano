//app/aluno/configuracoes/page.tsx

'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function ConfiguracoesAluno() {
  const [email, setEmail] = useState(true);
  const [whatsapp, setWhatsapp] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('usuarios')
        .select('notificaEmail, notificaWhatsapp')
        .eq('id', user.id)
        .single();

      if (data) {
        setEmail(data.notificaEmail);
        setWhatsapp(data.notificaWhatsapp);
      }

      setCarregando(false);
    };
    carregar();
  }, []);

  const salvar = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('usuarios').update({
      notificaEmail: email,
      notificaWhatsapp: whatsapp
    }).eq('id', user.id);
    alert('Preferências salvas com sucesso!');
  };

  if (carregando) return <p className="p-8">Carregando...</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔔 Preferências de Notificação</h1>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} />
          Receber notificações por e-mail
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={whatsapp} onChange={e => setWhatsapp(e.target.checked)} />
          Receber notificações por WhatsApp (simulado)
        </label>

        <button onClick={salvar} className="mt-4 bg-primary text-white py-2 px-4 rounded hover:bg-blue-700">
          Salvar
        </button>
      </div>
    </div>
  );
}

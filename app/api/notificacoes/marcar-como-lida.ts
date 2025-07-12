// 2️⃣ API: /api/notificacoes/marcar-como-lida.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { id } = await req.json();

  if (!id) return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 });

  await prisma.notificacao.update({
    where: { id },
    data: { lida: true }
  });

  return NextResponse.json({ ok: true });
}

// 3️⃣ Componente no painel do aluno (/aluno/notificacoes)
<button
  onClick={() => marcarComoLida(n.id)}
  className="text-xs text-green-600 hover:underline"
>
  ✅ Marcar como lida
</button>

// função marcarComoLida
const marcarComoLida = async (id: string) => {
  await fetch('/api/notificacoes/marcar-como-lida', {
    method: 'POST',
    body: JSON.stringify({ id })
  });
  setNotificacoes(prev => prev.map(n => n.id === id ? { ...n, lida: true } : n));
};

// 4️⃣ Contador de notificações não lidas (no menu do aluno)
<span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
  {naoLidas}
</span>

// useEffect para carregar
const [naoLidas, setNaoLidas] = useState(0);

useEffect(() => {
  const buscarQtd = async () => {
    const {
      data,
      error,
      count
    } = await supabase
      .from('notificacoes')
      .select('*', { count: 'exact', head: true })
      .eq('userId', user.id)
      .eq('lida', false);

    setNaoLidas(count || 0);
  };

  buscarQtd();
}, []);

// 5️⃣ Aba de preferências de notificação (/aluno/perfil)
<form onSubmit={salvarPreferencias} className="space-y-4">
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} />
    Receber por E-mail
  </label>
  <label className="flex items-center gap-2">
    <input type="checkbox" checked={whatsapp} onChange={e => setWhatsapp(e.target.checked)} />
    Receber por WhatsApp
  </label>
  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
    Salvar Preferências
  </button>
</form>

// função salvarPreferencias
const salvarPreferencias = async (e: any) => {
  e.preventDefault();
  await supabase
    .from('usuarios')
    .update({ notificaEmail: email, notificaWhatsapp: whatsapp })
    .eq('id', user.id);
};

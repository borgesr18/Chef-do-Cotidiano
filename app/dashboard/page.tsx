//app/dashboard/page.tsx
import { createSupabaseServerClient } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-2">Bem-vindo, {user.email}</h1>
      <p>Este é seu painel de controle. Em breve você verá seus cursos, receitas salvas e progresso.</p>
    </div>
  );
}

// Diretório: components/LogoutButton.tsx
'use client';
import { supabase } from '@/lib/supabaseClient';

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">
      Sair
    </button>
  );
}

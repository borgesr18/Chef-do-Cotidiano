//lib/roleCheck.ts
import { createSupabaseServerClient } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: perfil } = await supabase.from('perfis').select('tipo').eq('user_id', user.id).single();

  if (perfil?.tipo !== 'admin') redirect('/');
}

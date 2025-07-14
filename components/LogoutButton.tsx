'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button onClick={logout} className="text-neutral-600 hover:text-red-600 font-medium transition-colors duration-200">
      Sair
    </button>
  );
}

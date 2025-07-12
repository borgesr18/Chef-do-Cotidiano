//components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
    >
      Sair
    </button>
  );
}

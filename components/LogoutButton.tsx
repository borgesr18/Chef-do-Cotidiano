//components/LogoutButton.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClient();
  const [carregando, setCarregando] = useState(false);

  const handleLogout = async () => {
    setCarregando(true);
    await supabase.auth.signOut();
    router.push('/login');
  };

  useEffect(() => {
    // Para prevenir problemas de renderização no lado cliente
    if (typeof window !== 'undefined') {
      supabase.auth.getSession().then(({ data }) => {
        if (!data.session) router.push('/login');
      });
    }
  }, []);

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-red-600 hover:underline disabled:opacity-50"
      disabled={carregando}
    >
      {carregando ? 'Saindo...' : '🚪 Sair'}
    </button>
  );
}


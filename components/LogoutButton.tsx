'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/logout');
    router.push('/login');
  };

  return (
    <button onClick={logout} className="text-sm text-red-600 hover:underline">
      Sair
    </button>
  );
}
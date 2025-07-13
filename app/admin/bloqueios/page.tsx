//app/admin/bloqueios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { createSupabaseServerClient } from '@/lib/auth-server';
import { useRouter } from 'next/navigation';

interface Bloqueio {
  id: string;
  ip: string;
  motivo: string;
  criadoEm: string;
}

export default function BloqueiosPage() {
  const [bloqueios, setBloqueios] = useState<Bloqueio[]>([]);
  const router = useRouter();

  useEffect(() => {
  }, []);

  const handleDesbloquear = async (bloqueioId: string) => {
    try {
      console.log('Desbloqueando IP:', bloqueioId);
      router.refresh();
    } catch (error) {
      console.error('Erro ao desbloquear:', error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Bloqueios</h1>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4">
          <p className="text-gray-600">
            Página de gerenciamento de bloqueios em desenvolvimento.
          </p>
        </div>
      </div>
    </div>
  );
}

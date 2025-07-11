//components/Header.tsx
'use client';
import LogoutButton from './LogoutButton';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Header() {
  const [usuarioLogado, setUsuarioLogado] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuarioLogado(!!data.session);
    });
  }, []);

  return (
    <header className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Chef do Cotidiano</h1>
        <nav className="space-x-4 flex items-center">
          <a href="/" className="hover:underline">Home</a>
          <a href="/receitas" className="hover:underline">Receitas</a>
          <a href="/cursos" className="hover:underline">Cursos</a>
          <a href="/sobre" className="hover:underline">Sobre</a>
          <a href="/contato" className="hover:underline">Contato</a>
          {usuarioLogado ? (
            <LogoutButton />
          ) : (
            <a href="/login" className="bg-white text-black px-3 py-1 rounded">Entrar</a>
          )}
        </nav>
      </div>
    </header>
  );
}

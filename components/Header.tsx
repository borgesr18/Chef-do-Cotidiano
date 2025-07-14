'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/auth-client';
import LogoutButton from './LogoutButton';
import Link from 'next/link';

export default function Header() {
  const [usuarioLogado, setUsuarioLogado] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuarioLogado(!!data.session);
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">🍳</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              Chef do Cotidiano
            </h1>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
              Home
            </Link>
            <Link href="/receitas" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
              Receitas
            </Link>
            <Link href="/cursos" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
              Cursos
            </Link>
            <Link href="/sobre" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
              Sobre
            </Link>
            <Link href="/contato" className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200">
              Contato
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {usuarioLogado === null ? null : usuarioLogado ? (
              <LogoutButton />
            ) : (
              <Link
                href="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

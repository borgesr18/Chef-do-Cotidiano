'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          nome: nome
        }
      }
    });
    
    if (error) {
      setErro(error.message);
    } else {
      alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
      window.location.href = '/login';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-50 to-accent-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-accent-600 to-accent-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">👨‍🍳</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-neutral-900 mb-2">
              Junte-se a nós!
            </h1>
            <p className="text-neutral-600">
              Crie sua conta e comece a aprender culinária hoje
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-neutral-700 mb-2">
                Nome completo
              </label>
              <input
                id="nome"
                type="text"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field"
                required
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {erro}
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Faça login aqui
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

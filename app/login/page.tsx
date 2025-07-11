// Atualização em app/login/page.tsx
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) setErro(error.message);
    else window.location.href = '/dashboard';
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Entrar</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-2 p-2 border"
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 p-2 border"
        />
        {erro && <p className="text-red-600 mb-2">{erro}</p>}
        <button type="submit" className="w-full bg-black text-white p-2">Entrar</button>
      </form>
    </div>
  );
}

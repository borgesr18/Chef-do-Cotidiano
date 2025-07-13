//app/admin/verificar-certificado/page.tsx

'use client';
import { useState } from 'react';

export default function VerificarCertificadoAdmin() {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [hash, setHash] = useState('');
  const [resultado, setResultado] = useState<string | null>(null);

  const verificar = async () => {
    const res = await fetch('/api/verificar-hash', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email, hashInformado: hash })
    });

    const data = await res.json();
    if (data.valido) {
      setResultado('✅ Hash válido. Certificado autêntico.');
    } else {
      setResultado('❌ Hash inválido. Certificado pode ser falsificado.');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🔎 Verificar Certificado</h1>

      <label className="block mb-2">Token do Certificado:</label>
      <input
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="Ex: 7dc8...fb12"
      />

      <label className="block mb-2">Email do Usuário:</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="Ex: usuario@email.com"
      />

      <label className="block mb-2">Hash informado:</label>
      <input
        value={hash}
        onChange={(e) => setHash(e.target.value)}
        className="w-full border p-2 mb-4"
        placeholder="Ex: a4c95d6b1d5f2f7..."
      />

      <button
        onClick={verificar}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Verificar Hash
      </button>

      {resultado && (
        <p className="mt-4 text-lg font-semibold text-gray-700">{resultado}</p>
      )}
    </div>
  );
}

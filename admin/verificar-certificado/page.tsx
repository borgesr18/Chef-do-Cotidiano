//app/admin/verificar-certificado/page.tsx

'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function VerificarCertificadoAdmin() {
  const [busca, setBusca] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [historico, setHistorico] = useState<any[]>([]);

  const verificar = async () => {
    setLoading(true);
    setResultado(null);
    setErro(null);

    try {
      const { data, error } = await supabase
        .from('certificado')
        .select('token, hashVerificacao, curso(titulo), usuario(nome, email), data_emissao')
        .or(`token.eq.${busca},hashVerificacao.eq.${busca},usuario.email.eq.${busca}`)
        .limit(10);

      if (!data || data.length === 0 || error) {
        setErro('❌ Nenhum certificado encontrado para este dado.');
        return;
      }

      setResultado(data[0]);
      setHistorico(data);
    } catch (err) {
      console.error(err);
      setErro('Erro na verificação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Verificação de Certificado</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Digite hash, token ou email"
          className="border px-4 py-2 rounded w-full"
        />
        <button
          onClick={verificar}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          disabled={loading || !busca}
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>

      {erro && <p className="text-red-600">{erro}</p>}

      {resultado && (
        <div className="border rounded p-4 mt-4 bg-gray-50">
          <p><strong>Aluno:</strong> {resultado.usuario.nome} ({resultado.usuario.email})</p>
          <p><strong>Curso:</strong> {resultado.curso.titulo}</p>
          <p><strong>Data de Emissão:</strong> {new Date(resultado.data_emissao).toLocaleDateString()}</p>
          <p><strong>Token:</strong> {resultado.token}</p>
          <p><strong>Hash:</strong> {resultado.hashVerificacao}</p>

          <a
            href={`/certificado/${resultado.token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline mt-2 inline-block"
          >
            🌐 Ver Certificado Público
          </a>
        </div>
      )}

      {historico.length > 1 && (
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">📚 Histórico de Verificações</h2>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Aluno</th>
                <th className="p-2 border">Curso</th>
                <th className="p-2 border">Token</th>
                <th className="p-2 border">Data</th>
              </tr>
            </thead>
            <tbody>
              {historico.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="p-2 border">{item.usuario.nome}</td>
                  <td className="p-2 border">{item.curso.titulo}</td>
                  <td className="p-2 border text-xs">{item.token}</td>
                  <td className="p-2 border">{new Date(item.data_emissao).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


//app/admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';

export default function DashboardAdmin() {
  const [certificados, setCertificados] = useState<any[]>([]);
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarCertificados();
  }, []);

  const buscarCertificados = async () => {
    setCarregando(true);
    try {
      let url = '/api/certificados';
      if (filtroInicio && filtroFim) {
        url += `?inicio=${filtroInicio}&fim=${filtroFim}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setCertificados(data);
    } catch (err) {
      console.error('Erro ao buscar certificados', err);
    }
    setCarregando(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard de Certificados</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="date"
          value={filtroInicio}
          onChange={(e) => setFiltroInicio(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="date"
          value={filtroFim}
          onChange={(e) => setFiltroFim(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={buscarCertificados}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          🔍 Filtrar
        </button>
      </div>

      <div className="text-sm text-gray-700 mb-4">
        Total de certificados encontrados: <strong>{certificados.length}</strong>
      </div>

      {carregando ? (
        <p>🔄 Carregando certificados...</p>
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">Curso</th>
                <th className="border px-2 py-1 text-left">Aluno</th>
                <th className="border px-2 py-1 text-left">E-mail</th>
                <th className="border px-2 py-1 text-left">Data de Emissão</th>
              </tr>
            </thead>
            <tbody>
              {certificados.map((c) => (
                <tr key={c.id}>
                  <td className="border px-2 py-1">{c.curso?.titulo}</td>
                  <td className="border px-2 py-1">{c.usuario?.nome}</td>
                  <td className="border px-2 py-1">{c.usuario?.email}</td>
                  <td className="border px-2 py-1">
                    {new Date(c.data_emissao).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

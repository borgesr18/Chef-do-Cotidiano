//app/admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function DashboardAdmin() {
  const [certificados, setCertificados] = useState<any[]>([]);
  const [filtroInicio, setFiltroInicio] = useState('');
  const [filtroFim, setFiltroFim] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [porMes, setPorMes] = useState<any[]>([]);
  const [porCurso, setPorCurso] = useState<any[]>([]);

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
      processarDados(data);
    } catch (err) {
      console.error('Erro ao buscar certificados', err);
    }
    setCarregando(false);
  };

  const processarDados = (data: any[]) => {
    const porMesMap: { [mes: string]: number } = {};
    const porCursoMap: { [curso: string]: number } = {};

    data.forEach((c) => {
      const mes = new Date(c.data_emissao).toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric',
      });

      const curso = c.curso?.titulo || 'Desconhecido';

      porMesMap[mes] = (porMesMap[mes] || 0) + 1;
      porCursoMap[curso] = (porCursoMap[curso] || 0) + 1;
    });

    setPorMes(Object.entries(porMesMap).map(([mes, total]) => ({ mes, total })));
    setPorCurso(Object.entries(porCursoMap).map(([curso, total]) => ({ curso, total })));
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

      <div className="text-sm text-gray-700 mb-6">
        Total de certificados encontrados: <strong>{certificados.length}</strong>
      </div>

      {/* GRÁFICO POR MÊS */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-2">📅 Certificados por Mês</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* GRÁFICO POR CURSO */}
      <div className="mb-12">
        <h2 className="text-lg font-semibold mb-2">📚 Certificados por Curso</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porCurso}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="curso" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TABELA DETALHADA */}
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


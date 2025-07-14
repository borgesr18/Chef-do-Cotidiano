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
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-4 flex items-center">
          <span className="mr-3">📊</span>
          Dashboard de Certificados
        </h1>
        <p className="text-xl text-neutral-600">Acompanhe as métricas e relatórios de certificados emitidos</p>
      </div>

      <div className="card mb-8">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Filtros</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="date"
            value={filtroInicio}
            onChange={(e) => setFiltroInicio(e.target.value)}
            className="input-field"
          />
          <input
            type="date"
            value={filtroFim}
            onChange={(e) => setFiltroFim(e.target.value)}
            className="input-field"
          />
          <button
            onClick={buscarCertificados}
            className="btn-primary flex items-center"
          >
            <span className="mr-2">🔍</span>
            Filtrar
          </button>
        </div>
      </div>

      <div className="card mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">{certificados.length}</div>
          <div className="text-neutral-600">Total de certificados encontrados</div>
        </div>
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

      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">📚 Certificados por Curso</h3>
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

      <div className="card">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">📋 Detalhes dos Certificados</h3>
        {carregando ? (
          <div className="text-center py-8">
            <div className="text-primary-600 text-lg">🔄 Carregando certificados...</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Curso</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Aluno</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">E-mail</th>
                  <th className="text-left py-3 px-4 font-semibold text-neutral-900">Data de Emissão</th>
                </tr>
              </thead>
              <tbody>
                {certificados.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="py-3 px-4 text-neutral-700">{c.curso?.titulo}</td>
                    <td className="py-3 px-4 text-neutral-700">{c.usuario?.nome}</td>
                    <td className="py-3 px-4 text-neutral-700">{c.usuario?.email}</td>
                    <td className="py-3 px-4 text-neutral-700">
                      {new Date(c.data_emissao).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


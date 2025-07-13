// app/admin/relatorios/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, LineChart, Line, PieChart, Pie
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function RelatoriosAdmin() {
  const [certificados, setCertificados] = useState<any[]>([]);
  const [cursoFiltro, setCursoFiltro] = useState('');
  const [emailFiltro, setEmailFiltro] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarCertificados();
  }, []);

  const buscarCertificados = async () => {
    setCarregando(true);
    try {
      let url = '/api/certificados';
      const filtros = [];
      if (dataInicio && dataFim) filtros.push(`inicio=${dataInicio}&fim=${dataFim}`);
      if (cursoFiltro) filtros.push(`curso=${encodeURIComponent(cursoFiltro)}`);
      if (emailFiltro) filtros.push(`email=${encodeURIComponent(emailFiltro)}`);
      if (filtros.length > 0) url += `?${filtros.join('&')}`;

      const res = await fetch(url);
      const data = await res.json();
      setCertificados(data);
    } catch (err) {
      console.error('Erro ao buscar certificados', err);
    }
    setCarregando(false);
  };

  const gerarPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Certificados', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Curso', 'Aluno', 'Email', 'Data de Emissão']],
      body: certificados.map(c => [
        c.curso?.titulo,
        c.usuario?.nome,
        c.usuario?.email,
        new Date(c.data_emissao).toLocaleDateString(),
      ]),
    });
    doc.save('relatorio_certificados.pdf');
  };

  const dadosPorCurso = certificados.reduce((acc, curr) => {
    const curso = curr.curso?.titulo || 'Sem curso';
    acc[curso] = (acc[curso] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosGraficoCurso = Object.entries(dadosPorCurso).map(([curso, total]) => ({
    curso,
    total,
  }));

  const dadosPorData = certificados.reduce((acc, curr) => {
    const data = new Date(curr.data_emissao).toLocaleDateString();
    acc[data] = (acc[data] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosGraficoLinha = Object.entries(dadosPorData).map(([data, total]) => ({
    data,
    total,
  }));

  const dadosPorTipoUsuario = certificados.reduce((acc, curr) => {
    const tipo = curr.usuario?.tipo || 'Desconhecido';
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosGraficoTipoUsuario = Object.entries(dadosPorTipoUsuario).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">📄 Relatórios de Certificados</h1>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Filtrar por curso"
          value={cursoFiltro}
          onChange={(e) => setCursoFiltro(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="text"
          placeholder="Filtrar por email"
          value={emailFiltro}
          onChange={(e) => setEmailFiltro(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <button
          onClick={buscarCertificados}
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
        >
          🔍 Filtrar
        </button>
        <button
          onClick={gerarPDF}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
          📥 Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">🎯 Certificados por Curso</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGraficoCurso}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="curso" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">📆 Certificados por Dia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosGraficoLinha}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="data" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">👤 Certificados por Tipo de Usuário</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Tooltip />
              <Pie
                data={dadosGraficoTipoUsuario}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#6366f1"
                label
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full text-sm border mt-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Curso</th>
              <th className="border px-2 py-1 text-left">Aluno</th>
              <th className="border px-2 py-1 text-left">Email</th>
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
    </div>
  );
}

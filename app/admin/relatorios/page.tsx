// app/admin/relatorios/page.tsx
'use client';

import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';

export default function RelatoriosAdmin() {
  const [certificados, setCertificados] = useState<any[]>([]);
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroEmail, setFiltroEmail] = useState('');
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
      const params = new URLSearchParams();
      if (filtroCurso) params.append('curso', filtroCurso);
      if (filtroEmail) params.append('email', filtroEmail);
      if (filtroInicio && filtroFim) {
        params.append('inicio', filtroInicio);
        params.append('fim', filtroFim);
      }
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setCertificados(data);
    } catch (err) {
      console.error('Erro ao buscar certificados', err);
    }
    setCarregando(false);
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('Relatório de Certificados', 105, 20, { align: 'center' });

    certificados.forEach((c, i) => {
      const y = 40 + i * 10;
      doc.text(
        `${c.usuario?.nome} - ${c.usuario?.email} - ${c.curso?.titulo} - ${new Date(c.data_emissao).toLocaleDateString()}`,
        10,
        y
      );
    });

    doc.save('relatorio-certificados.pdf');
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📄 Relatórios de Certificados</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Curso"
          value={filtroCurso}
          onChange={(e) => setFiltroCurso(e.target.value)}
          className="border rounded px-2 py-1"
        />
        <input
          type="email"
          placeholder="E-mail"
          value={filtroEmail}
          onChange={(e) => setFiltroEmail(e.target.value)}
          className="border rounded px-2 py-1"
        />
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
          🔍 Buscar
        </button>
        <button
          onClick={exportarPDF}
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
        >
          📥 Exportar PDF
        </button>
      </div>

      {carregando ? (
        <p>🔄 Carregando...</p>
      ) : (
        <table className="min-w-full text-sm border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Curso</th>
              <th className="border px-2 py-1">Aluno</th>
              <th className="border px-2 py-1">E-mail</th>
              <th className="border px-2 py-1">Data</th>
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
      )}
    </div>
  );
}

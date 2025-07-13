// Arquivo: app/admin/dashboard/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CSVLink } from 'react-csv';

interface Certificado {
  id: string;
  curso: { titulo: string };
  usuario: { nome: string; email: string };
  data_emissao: string;
}

export default function AdminDashboard() {
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/certificados');
      const data = await res.json();
      setCertificados(data);
      setCarregando(false);
    };
    fetchData();
  }, []);

  const totalCertificados = certificados.length;
  const totalUsuarios = new Set(certificados.map(c => c.usuario.email)).size;
  const totalCursos = new Set(certificados.map(c => c.curso.titulo)).size;

  const csvData = certificados.map(c => ({
    Nome: c.usuario.nome,
    Email: c.usuario.email,
    Curso: c.curso.titulo,
    Data: format(new Date(c.data_emissao), 'dd/MM/yyyy'),
  }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">📊 Painel de Relatórios</h1>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <div className="space-y-6">
          <div className="flex gap-6">
            <div className="bg-blue-100 p-4 rounded shadow">
              <p className="text-gray-600 text-sm">Certificados Emitidos</p>
              <p className="text-xl font-bold">{totalCertificados}</p>
            </div>
            <div className="bg-green-100 p-4 rounded shadow">
              <p className="text-gray-600 text-sm">Usuários Ativos</p>
              <p className="text-xl font-bold">{totalUsuarios}</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded shadow">
              <p className="text-gray-600 text-sm">Cursos Cadastrados</p>
              <p className="text-xl font-bold">{totalCursos}</p>
            </div>
          </div>

          <CSVLink
            data={csvData}
            filename={
              'relatorio_certificados_' + format(new Date(), 'yyyy-MM-dd') + '.csv'
            }
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            📥 Exportar CSV
          </CSVLink>
        </div>
      )}
    </div>
  );
}

// 1️⃣ Componente de Exportação na Dashboard Atual
// Arquivo: app/admin/dashboard/ExportarCertificados.tsx
'use client';

import { useState } from 'react';

export default function ExportarCertificados() {
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [gerando, setGerando] = useState(false);

  const gerarRelatorioPDF = async () => {
    setGerando(true);
    try {
      const url = `/api/relatorios/certificados?inicio=${inicio}&fim=${fim}`;
      const res = await fetch(url);
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `certificados_${inicio}_a_${fim}.pdf`;
      link.click();
    } catch (err) {
      alert('Erro ao gerar relatório.');
    }
    setGerando(false);
  };

  return (
    <div className="mt-6 space-y-2">
      <h2 className="font-semibold text-lg">📄 Exportar Relatório (PDF)</h2>
      <div className="flex flex-col md:flex-row gap-2 items-center">
        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} className="border rounded px-2 py-1" />
        <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} className="border rounded px-2 py-1" />
        <button onClick={gerarRelatorioPDF} disabled={gerando} className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700">
          {gerando ? 'Gerando...' : '📥 Baixar PDF'}
        </button>
      </div>
    </div>
  );
}

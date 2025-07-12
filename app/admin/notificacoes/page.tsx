//app/admin/notificacoes/page.tsx 
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { format } from 'date-fns';

export default function AdminNotificacoes() {
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroData, setFiltroData] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      const { data } = await supabase
        .from('notificacoes')
        .select('*, usuario:usuario(id, nome, email)')
        .order('criadoEm', { ascending: false });

      setNotificacoes(data || []);
      setCarregando(false);
    };

    carregar();
  }, []);

  const notificacoesFiltradas = notificacoes.filter((n) => {
    const buscaTexto =
      n.usuario.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      n.usuario.email.toLowerCase().includes(filtro.toLowerCase());

    const tipoValido = filtroTipo ? n.tipo === filtroTipo : true;

    const dataValida = filtroData
      ? format(new Date(n.criadoEm), 'yyyy-MM-dd') === filtroData
      : true;

    return buscaTexto && tipoValido && dataValida;
  });

  const exportarCSV = () => {
    const linhas = [
      ['Data', 'Nome', 'E-mail', 'Título', 'Mensagem', 'Tipo', 'Canal']
    ];

    notificacoesFiltradas.forEach((n) => {
      linhas.push([
        new Date(n.criadoEm).toLocaleString(),
        n.usuario.nome,
        n.usuario.email,
        n.titulo,
        n.mensagem,
        n.tipo,
        n.canal
      ]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + linhas.map((l) => l.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'notificacoes.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tipos = ['comentario', 'aula', 'certificado', 'admin'];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🔔 Notificações Enviadas</h1>

      <div className="flex gap-6 mb-6 text-sm text-gray-700">
        <div>📧 E-mails enviados: <strong>{notificacoes.filter(n => n.canal === 'email').length}</strong></div>
        <div>📱 WhatsApps enviados: <strong>{notificacoes.filter(n => n.canal === 'whatsapp').length}</strong></div>
        <div>📊 Total: <strong>{notificacoes.length}</strong></div>
      </div>

      <input
        type="text"
        placeholder="🔎 Buscar por nome ou e-mail"
        className="border rounded p-2 w-full mb-3"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <div className="flex gap-4 mb-4 flex-wrap">
        <select
          className="border rounded p-2"
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">🧩 Todos os Tipos</option>
          {tipos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>

        <input
          type="date"
          className="border rounded p-2"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />

        <button
          onClick={exportarCSV}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          📤 Exportar CSV
        </button>
      </div>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <ul className="space-y-4">
          {notificacoesFiltradas.map((n) => (
            <li key={n.id} className="border rounded p-4 bg-white shadow">
              <p className="text-sm text-gray-500">{new Date(n.criadoEm).toLocaleString()}</p>
              <p className="font-semibold">{n.titulo}</p>
              <p>{n.mensagem}</p>
              <p className="text-xs text-blue-600">
                Enviado via {n.canal.toUpperCase()} – <strong>{n.usuario.nome}</strong> ({n.usuario.email})
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


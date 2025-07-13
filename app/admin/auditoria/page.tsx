// Diretório: app/admin/auditoria/page.tsx — Painel admin para auditoria de certificados
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PainelAuditoria() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [alertas, setAlertas] = useState<any[]>([]);

  useEffect(() => {
    const buscarAuditoria = async () => {
      const { data, error } = await supabase
        .from('auditoria_certificado')
        .select(`id, email, acessadoEm, ip, certificado(token, usuario(nome), curso(titulo))`)
        .order('acessadoEm', { ascending: false });

      if (data) {
        setRegistros(data);

        // Agrupar por email + IP para alertas
        const suspeitos = data.reduce((acc, cur) => {
          const chave = `${cur.certificado[0]?.token || 'unknown'}_${cur.ip}`;
          acc[chave] = (acc[chave] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const alertasDetectados = Object.entries(suspeitos)
          .filter(([_, qtd]) => qtd > 5) // Alerta se mesmo IP acessou 5+ vezes
          .map(([chave, qtd]) => ({ chave, qtd }));

        setAlertas(alertasDetectados);
      }

      setCarregando(false);
    };

    buscarAuditoria();
  }, []);

  if (carregando) return <p className="p-8">🔍 Carregando registros de auditoria...</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">📜 Auditoria de Certificados</h1>

      {alertas.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded">
          <p className="font-semibold mb-1">⚠️ Acessos suspeitos detectados:</p>
          <ul className="list-disc ml-6 text-sm">
            {alertas.map((a, i) => (
              <li key={i}>{a.chave.replace('_', ' → IP: ')} ({a.qtd} acessos)</li>
            ))}
          </ul>
        </div>
      )}

      <table className="w-full text-sm border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Aluno</th>
            <th className="p-2 border">Curso</th>
            <th className="p-2 border">Token</th>
            <th className="p-2 border">IP</th>
            <th className="p-2 border">Data</th>
          </tr>
        </thead>
        <tbody>
          {registros.map((reg) => (
            <tr key={reg.id} className="border-t hover:bg-gray-50">
              <td className="p-2 border">{reg.certificado.usuario.nome}</td>
              <td className="p-2 border">{reg.certificado.curso.titulo}</td>
              <td className="p-2 border text-blue-600 underline">{reg.certificado.token}</td>
              <td className="p-2 border">{reg.ip || 'Desconhecido'}</td>
              <td className="p-2 border">{new Date(reg.acessadoEm).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

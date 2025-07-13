import React from 'react';

interface VerificacaoResultadoProps {
  status: 'valido' | 'invalido' | 'erro';
  nome?: string;
  email?: string;
  curso?: string;
  data?: string;
}

export default function VerificacaoResultado({
  status,
  nome,
  email,
  curso,
  data,
}: VerificacaoResultadoProps) {
  const renderMensagem = () => {
    switch (status) {
      case 'valido':
        return (
          <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded">
            <p className="font-bold">✅ Certificado Válido</p>
            <p>Nome: {nome}</p>
            <p>Email: {email}</p>
            <p>Curso: {curso}</p>
            <p>Data de Emissão: {data}</p>
          </div>
        );
      case 'invalido':
        return (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded">
            <p className="font-bold">❌ Certificado Inválido</p>
            <p>Não encontramos nenhum certificado com essas informações.</p>
          </div>
        );
      case 'erro':
      default:
        return (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 p-4 rounded">
            <p className="font-bold">⚠️ Erro ao consultar</p>
            <p>Verifique os dados informados e tente novamente.</p>
          </div>
        );
    }
  };

  return <div className="mt-6">{renderMensagem()}</div>;
}

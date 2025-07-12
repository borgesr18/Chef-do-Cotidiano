//app/admin/verificar-certificado/page.tsx

"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function VerificarCertificadoAdmin() {
  const [input, setInput] = useState("");
  const [resultado, setResultado] = useState<any | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const buscar = async () => {
    setErro(null);
    setResultado(null);
    setCarregando(true);

    const { data, error } = await supabase
      .from("certificado")
      .select("id, token, hashVerificacao, usuario(nome, email), curso(titulo), data_emissao")
      .or(
        `token.eq.${input},hashVerificacao.eq.${input},usuario.email.eq.${input}`
      )
      .limit(10);

    if (error || !data || data.length === 0) {
      setErro("Nenhum certificado encontrado com os dados informados.");
    } else {
      setResultado(data);
    }

    setCarregando(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🔍 Verificar Certificado</h1>
      <div className="flex gap-2">
        <input
          className="w-full border px-4 py-2 rounded"
          placeholder="Digite o token, hash ou email do aluno"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          onClick={buscar}
          disabled={carregando || !input}
        >
          {carregando ? "🔄 Buscando..." : "Buscar"}
        </button>
      </div>
      {erro && <p className="text-red-600">{erro}</p>}
      {resultado && (
        <div className="space-y-4 mt-4">
          {resultado.map((cert: any) => (
            <div key={cert.id} className="border p-4 rounded shadow-sm">
              <p><strong>Aluno:</strong> {cert.usuario.nome} ({cert.usuario.email})</p>
              <p><strong>Curso:</strong> {cert.curso.titulo}</p>
              <p><strong>Emissão:</strong> {new Date(cert.data_emissao).toLocaleDateString()}</p>
              <p><strong>Token:</strong> {cert.token}</p>
              <p><strong>Hash:</strong> {cert.hashVerificacao}</p>
              <a
                href={`/certificado/${cert.token}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                🔗 Ver Certificado Público
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

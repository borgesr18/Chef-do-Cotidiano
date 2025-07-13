// Diretório: app/certificado/token/[token]/page.tsx — Página pública do certificado

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import QRCode from 'qrcode.react'
import { supabase } from '@/lib/supabaseClient'
import jsPDF from 'jspdf'
import { uploadCertificadoPDF } from '@/lib/certificadoStorage'

export default function PaginaCertificado() {
  const { token } = useParams()
  const [certificado, setCertificado] = useState<any>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    const buscarCertificado = async () => {
      const { data, error } = await supabase
        .from('certificados')
        .select('*')
        .eq('token', token)
        .single()

      if (!data || error) {
        setErro('❌ Certificado não encontrado ou inválido.')
        setCarregando(false)
        return
      }

      const ip = await fetch('/api/ip').then(res => res.text()).catch(() => '')

      const { data: bloqueado } = await supabase
        .from('ip_bloqueado')
        .select('id')
        .eq('certificadoId', data.id)
        .eq('ip', ip)
        .maybeSingle()

      if (bloqueado) {
        setErro('⚠️ Acesso bloqueado por excesso de verificações deste IP.')
        setCarregando(false)
        return
      }

      setCertificado(data)
      setCarregando(false)

      await supabase.from('auditoria_certificado').insert({
        certificadoId: data.id,
        acessado_em: new Date().toISOString(),
        email: data.email || 'email@exemplo.com',
        ip,
      })

      const { count } = await supabase
        .from('auditoria_certificado')
        .select('*', { count: 'exact', head: true })
        .eq('certificadoId', data.id)
        .eq('ip', ip)

      if (count && count >= 5) {
        await supabase.from('ip_bloqueado').upsert({
          certificadoId: data.id,
          ip,
          bloqueadoEm: new Date().toISOString(),
        })
      }
    }

    buscarCertificado()
  }, [token])

  const urlAtual = typeof window !== 'undefined' ? window.location.href : ''

  const gerarPDF = async () => {
    if (!certificado) return

    const doc = new jsPDF({ orientation: 'landscape' })

    doc.setFontSize(24)
    doc.text('Certificado de Conclusão', 105, 30, { align: 'center' })

    doc.setFontSize(16)
    doc.text(`Certificamos que ${certificado.nome || 'Nome do Usuário'}`, 105, 50, { align: 'center' })
    doc.text(`concluiu o curso "${certificado.titulo || 'Título do Curso'}"`, 105, 60, { align: 'center' })
    doc.text(`em ${new Date(certificado.criadoEm).toLocaleDateString()}`, 105, 70, { align: 'center' })

    doc.setFontSize(10)
    doc.text(`Verifique este certificado em: ${urlAtual}`, 105, 90, { align: 'center' })

    const hashVisivel = certificado.hashVerificacao?.slice(0, 16) || ''
    doc.text(`Código de Verificação: ${hashVisivel}...`, 105, 98, { align: 'center' })

    const pdfBlob = doc.output('blob')
    const url = await uploadCertificadoPDF(pdfBlob, `${token}.pdf`)

    console.log('PDF enviado para:', url)
  }

  if (carregando) return <p className="p-8">🔄 Carregando certificado...</p>
  if (erro) return <p className="p-8 text-red-600">{erro}</p>

  return (
    <div className="min-h-screen bg-white p-10 text-center space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">🎓 Certificado de Conclusão</h1>
      <p className="text-lg text-gray-700">Certificamos que</p>
      <h2 className="text-2xl font-semibold text-black">{certificado.nome || 'Nome do Usuário'}</h2>
      <p className="text-lg text-gray-700">concluiu com êxito o curso</p>
      <h3 className="text-xl italic text-gray-800">"{certificado.titulo || 'Título do Curso'}"</h3>
      <p className="text-sm text-gray-500">
        em {new Date(certificado.criadoEm).toLocaleDateString()}
      </p>

      <div className="mt-8">
        <QRCode value={urlAtual} size={128} />
        <p className="text-xs text-gray-500 mt-2">Verificação via QR Code</p>
      </div>

      <div className="flex gap-4 justify-center mt-6 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          🖨️ Imprimir Certificado
        </button>
        <button
          onClick={gerarPDF}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          📥 Baixar PDF
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Código de Verificação: {certificado.hashVerificacao?.slice(0, 16)}...
      </p>
      <div className="mt-2 flex items-center justify-center gap-2">
        <button
          onClick={() => {
            navigator.clipboard.writeText(certificado.hashVerificacao)
            alert('🔐 Código de verificação copiado!')
          }}
          className="text-xs text-blue-600 hover:underline"
        >
          📋 Copiar código completo
        </button>
      </div>
    </div>
  )
}

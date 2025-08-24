import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ebooks } from '../lib/supabase'
import { useEbookPurchase } from '../hooks/useEbookPurchase'
import { SEO } from '../components/SEO'
import { LazyImage } from '../components/LazyImage'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { LoginModal } from '../components/auth/LoginModal'

export const EbookDetailPage = () => {
  const { id } = useParams()
  const [ebook, setEbook] = useState(null)
  const [loading, setLoading] = useState(true)
  const { createPurchase, hasPurchased } = useEbookPurchase()
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [owned, setOwned] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const { data } = await ebooks.getById(id)
        setEbook(data)
        // Verificar se o usuário já comprou este e-book
        const purchased = await hasPurchased(id)
        if (purchased?.data) setOwned(true)
      } catch (e) {
        setEbook(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      setShowLogin(true)
      return
    }
    const result = await createPurchase(id, { method: 'stripe', amount: ebook?.price || 0, transactionId: `temp_${Date.now()}` })
    if (result.data) {
      toast.success('Compra realizada com sucesso!')
      setOwned(true)
    }
    else toast.error('Erro ao processar compra')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!ebook) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-2">E-book não encontrado</h1>
        <p className="text-muted-foreground">Verifique o link e tente novamente.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${ebook.title} - E-book`} description={ebook.description} image={ebook.cover_image} />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <LazyImage src={ebook.cover_image} alt={ebook.title} className="w-full rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-3xl">{ebook.title}</CardTitle>
                    <Badge className="bg-green-600 text-white">R$ {Number(ebook.price || 0).toFixed(2)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-6">{ebook.description}</p>
                  <div className="flex gap-3">
                    {owned && ebook.file_url ? (
                      <a className="inline-flex items-center px-4 py-2 border rounded-md" href={ebook.file_url} target="_blank" rel="noreferrer">Baixar e-book</a>
                    ) : (
                      <Button onClick={handlePurchase}>Comprar agora</Button>
                    )}
                    {ebook.file_url && (
                      <a className="inline-flex items-center px-4 py-2 border rounded-md" href={ebook.file_url} target="_blank" rel="noreferrer">Visualizar amostra</a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}

export default EbookDetailPage
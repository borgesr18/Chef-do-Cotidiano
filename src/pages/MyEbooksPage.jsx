import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, BookOpen } from 'lucide-react'
import { useEbookPurchase } from '../hooks/useEbookPurchase'
import { SEO } from '../components/SEO'

const MyEbooksPage = () => {
  const { getUserPurchases } = useEbookPurchase()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await getUserPurchases()
      setPurchases(data || [])
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Meus E-books" 
        description="Acesse os e-books que você comprou." 
        image="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=630&fit=crop" 
      />
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Meus E-books</h1>
            <Link to="/ebooks">
              <Button variant="outline">Explorar e-books</Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div role="status" aria-label="Carregando" className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Você ainda não comprou nenhum e-book</h3>
              <p className="text-muted-foreground mb-6">Explore nosso catálogo e comece agora mesmo.</p>
              <Link to="/ebooks">
                <Button>Ver e-books</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchases.map((purchase) => (
                <Card key={purchase.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{purchase.ebooks?.title || 'E-book'}</CardTitle>
                      <Badge className="bg-green-600 text-white">Pago</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground">
                        Valor: R$ {Number(purchase.amount || 0).toFixed(2)}
                      </div>
                      <div className="flex gap-2">
                        {purchase.ebooks?.slug && (
                          <Button variant="outline" asChild className="flex-1">
                            <Link to={`/ebooks/${purchase.ebook_id}`}>
                              <BookOpen className="h-4 w-4 mr-2" /> Detalhes
                            </Link>
                          </Button>
                        )}
                        {purchase.ebooks?.cover_image && purchase.ebooks?.file_url && (
                          <a
                            className="inline-flex items-center justify-center px-4 py-2 border rounded-md flex-1"
                            href={purchase.ebooks.file_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="h-4 w-4 mr-2" /> Baixar
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default MyEbooksPage


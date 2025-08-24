import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, FileText, Star } from 'lucide-react'
import { ebooks } from '../lib/supabase'
import { useCategories } from '../hooks/useCategories'
import { useEbookPurchase } from '../hooks/useEbookPurchase'
import { SEO } from '../components/SEO'
import { useAuth } from '../contexts/AuthContext'
import { LoginModal } from '../components/auth/LoginModal'
import { LazyImage } from '../components/LazyImage'
import { toast } from 'sonner'

export const EbooksPage = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { categories } = useCategories()
  const { createPurchase, hasPurchased } = useEbookPurchase()
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [ownedMap, setOwnedMap] = useState({})

  const mockEbooks = [
    {
      id: '1',
      title: 'Guia Completo do Churrasco',
      description: 'Tudo o que você precisa saber para dominar o churrasco em casa.',
      cover_image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop',
      price: 49.9,
      pages: 120,
      rating: 4.8,
      author_name: 'Chef Rodrigo',
      category_name: 'Carnes',
      status: 'published'
    },
    {
      id: '2',
      title: 'Massas Caseiras do Zero',
      description: 'Aprenda a fazer massas artesanais com técnicas profissionais.',
      cover_image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
      price: 39.9,
      pages: 95,
      rating: 4.7,
      author_name: 'Chef Rodrigo',
      category_name: 'Massas',
      status: 'published'
    }
  ]

  useEffect(() => {
    fetchEbooks()
  }, [])

  const fetchEbooks = async () => {
    try {
      setLoading(true)
      const { data, error } = await ebooks.getPublished()
      if (error || !data || data.length === 0) {
        console.log('API failed or no data, using mock data for ebooks')
        setItems(mockEbooks)
      } else {
        setItems(data)
      }
    } catch (err) {
      console.log('Error fetching ebooks, using mock data:', err)
      setItems(mockEbooks)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (ebookId, price) => {
    try {
      if (!isAuthenticated) {
        setShowLogin(true)
        return
      }
      const result = await createPurchase(ebookId, { method: 'stripe', amount: price, transactionId: `temp_${Date.now()}` })
      if (result.data) {
        toast.success('Compra realizada com sucesso!')
        setOwnedMap((prev) => ({ ...prev, [ebookId]: true }))
      } else {
        toast.error('Erro ao processar compra')
      }
    } catch (err) {
      toast.error('Erro ao processar compra')
    }
  }

  useEffect(() => {
    const checkOwnership = async () => {
      if (!isAuthenticated || items.length === 0) return
      const entries = await Promise.all(items.map(async (item) => {
        const res = await hasPurchased(item.id)
        return [item.id, !!res?.data]
      }))
      setOwnedMap(Object.fromEntries(entries))
    }
    checkOwnership()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, items])

  const filtered = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.category_name === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="E-books - Chef do Cotidiano"
        description="Compre e-books exclusivos de culinária para elevar suas habilidades na cozinha."
        image="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1200&h=630&fit=crop"
      />

      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">E-books de Culinária</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Conteúdo premium, receitas exclusivas e técnicas profissionais em formato PDF.
          </p>
          <Button size="lg" variant="secondary">
            Explorar E-books
          </Button>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar e-books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
            <div className="flex gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div role="status" aria-label="Carregando" className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">{filtered.length} e-book{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((item) => (
                  <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                    <div className="relative">
                      <LazyImage 
                        src={item.cover_image}
                        alt={item.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary">{item.category_name}</Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-green-600 text-white">R$ {item.price?.toFixed(2)}</Badge>
                      </div>
                    </div>

                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">{item.title}</CardTitle>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{item.rating || '4.8'}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{item.pages || 100} páginas</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>PDF</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button className="flex-1" asChild>
                            <Link to={`/ebooks/${item.id}`}>Detalhes</Link>
                          </Button>
                          {ownedMap[item.id] ? (
                            item.file_url ? (
                              <a className="inline-flex items-center px-4 py-2 border rounded-md" href={item.file_url} target="_blank" rel="noreferrer">Baixar</a>
                            ) : (
                              <Button variant="outline" disabled>Já comprado</Button>
                            )
                          ) : (
                            <Button variant="outline" onClick={() => handlePurchase(item.id, item.price)}>Comprar</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum e-book encontrado</h3>
                  <p className="text-muted-foreground">Tente ajustar os filtros ou buscar por outros termos.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  )
}

export default EbooksPage

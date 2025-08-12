import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Search, BookOpen } from 'lucide-react'
import { blogPosts } from '../lib/supabase'
import { useCategories } from '../hooks/useCategories'
import { SEO } from '../components/SEO'
import { LazyImage } from '../components/LazyImage'

export const BlogPage = () => {
  const [postsList, setPostsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const { categories } = useCategories()

  const mockPosts = [
    {
      id: 1,
      title: "10 Dicas para um Churrasco Perfeito",
      excerpt: "Descubra os segredos para fazer um churrasco inesquecível com essas dicas profissionais.",
      content: "O churrasco é uma das tradições mais queridas do brasileiro...",
      featured_image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop",
      author_name: "Chef Rodrigo",
      category_name: "Dicas",
      published_at: "2024-01-15T10:00:00Z",
      reading_time: 5,
      tags: ["churrasco", "dicas", "carnes"],
      status: "published"
    },
    {
      id: 2,
      title: "A História da Culinária Brasileira",
      excerpt: "Uma jornada pelos sabores e tradições que formaram nossa rica gastronomia nacional.",
      content: "A culinária brasileira é resultado de uma mistura única...",
      featured_image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
      author_name: "Chef Rodrigo",
      category_name: "Cultura",
      published_at: "2024-01-10T14:30:00Z",
      reading_time: 8,
      tags: ["história", "cultura", "brasil"],
      status: "published"
    },
    {
      id: 3,
      title: "Como Escolher os Melhores Ingredientes",
      excerpt: "Aprenda a identificar ingredientes frescos e de qualidade para suas receitas.",
      content: "A qualidade dos ingredientes é fundamental...",
      featured_image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
      author_name: "Chef Rodrigo",
      category_name: "Ingredientes",
      published_at: "2024-01-05T09:15:00Z",
      reading_time: 6,
      tags: ["ingredientes", "qualidade", "compras"],
      status: "published"
    }
  ]

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await blogPosts.getPublished()
      
      if (error || !data || data.length === 0) {
        console.log('API failed or no data, using mock data for blog posts')
        setPostsList(mockPosts)
      } else {
        setPostsList(data)
      }
    } catch (error) {
      console.log('Error fetching blog posts, using mock data:', error)
      setPostsList(mockPosts)
    } finally {
      setLoading(false)
    }
  }

  const filteredPosts = postsList.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || post.category_name === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Blog - Chef do Cotidiano"
        description="Dicas, receitas, histórias e tudo sobre culinária no blog do Chef do Cotidiano. Aprenda com nossos artigos especializados."
        image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=630&fit=crop"
      />

      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog Chef do Cotidiano
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Dicas, receitas, histórias e tudo sobre culinária. 
            Descubra os segredos da gastronomia com nossos artigos especializados.
          </p>
          <Button size="lg" variant="secondary">
            <Search className="h-5 w-5 mr-2" />
            Explorar Artigos
          </Button>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar artigos..."
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">
                  {filteredPosts.length} artigo{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="relative">
                      <LazyImage 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary">
                          {post.category_name}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm line-clamp-3">
                        {post.excerpt}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.reading_time} min</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>por {post.author_name}</span>
                        </div>
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <Button className="w-full" asChild>
                          <Link to={`/blog/${post.id}`}>
                            Ler Artigo
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredPosts.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum artigo encontrado</h3>
                  <p className="text-muted-foreground">
                    Tente ajustar os filtros ou buscar por outros termos.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default BlogPage

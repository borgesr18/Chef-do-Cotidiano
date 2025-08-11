import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  Clock, 
  Users, 
  Star, 
  Search, 
  Heart,
  Share2,
  Filter,
  ChevronDown
} from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'
import { useCategories } from '../hooks/useCategories'
import { generateSlug } from '../lib/utils'

export const RecipesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '')
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popular')
  
  const { 
    recipes, 
    loading, 
    hasMore, 
    loadMore, 
    search, 
    refresh 
  } = useRecipes()
  
  const { categories } = useCategories()

  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (selectedCategory) params.set('category', selectedCategory)
    if (sortBy !== 'popular') params.set('sort', sortBy)
    setSearchParams(params)
  }, [searchQuery, selectedCategory, sortBy, setSearchParams])

  useEffect(() => {
    if (searchQuery || selectedCategory) {
      search(searchQuery, { 
        category: selectedCategory,
        sort: sortBy 
      })
    } else {
      refresh()
    }
  }, [searchQuery, selectedCategory, sortBy])

  const mockRecipes = [
    {
      id: 1,
      title: "Bife Ancho Grelhado",
      description: "Corte nobre grelhado na perfeição com temperos especiais",
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
      cookTime: "25 min",
      difficulty: "Médio",
      rating: 4.8,
      author: "Chef Rodrigo",
      category: "Carnes"
    },
    {
      id: 2,
      title: "Carbonara Autêntica",
      description: "A verdadeira receita italiana com ovos, queijo e pancetta",
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      cookTime: "20 min",
      difficulty: "Fácil",
      rating: 4.6,
      author: "Chef Rodrigo",
      category: "Massas"
    },
    {
      id: 3,
      title: "Churrasco de Picanha Premium",
      description: "Técnicas profissionais para o churrasco perfeito",
      image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop",
      cookTime: "45 min",
      difficulty: "Difícil",
      rating: 4.7,
      author: "Chef Rodrigo",
      category: "Churrasco"
    },
    {
      id: 4,
      title: "Salmão Grelhado com Ervas",
      description: "Peixe fresco com marinada de ervas mediterrâneas",
      image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      cookTime: "30 min",
      difficulty: "Médio",
      rating: 4.5,
      author: "Chef Rodrigo",
      category: "Frutos do Mar"
    },
    {
      id: 5,
      title: "Caipirinha Tradicional",
      description: "O drink brasileiro mais famoso do mundo",
      image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop",
      cookTime: "5 min",
      difficulty: "Fácil",
      rating: 4.9,
      author: "Chef Rodrigo",
      category: "Bebidas"
    },
    {
      id: 6,
      title: "Brigadeiro Gourmet",
      description: "O doce brasileiro mais amado em versão sofisticada",
      image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=300&fit=crop",
      cookTime: "15 min",
      difficulty: "Fácil",
      rating: 4.8,
      author: "Chef Rodrigo",
      category: "Sobremesas"
    }
  ]

  const mockCategories = [
    { id: 1, name: "Carnes", slug: "carnes" },
    { id: 2, name: "Massas", slug: "massas" },
    { id: 3, name: "Churrasco", slug: "churrasco" },
    { id: 4, name: "Frutos do Mar", slug: "frutos-do-mar" },
    { id: 5, name: "Bebidas", slug: "bebidas" },
    { id: 6, name: "Sobremesas", slug: "sobremesas" }
  ]

  const displayRecipes = recipes.length > 0 ? recipes : mockRecipes
  const displayCategories = categories.length > 0 ? categories : mockCategories

  const filteredRecipes = displayRecipes.filter(recipe => {
    const matchesSearch = !searchQuery || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !selectedCategory || 
      recipe.category?.toLowerCase() === selectedCategory.toLowerCase() ||
      recipe.category_name?.toLowerCase() === selectedCategory.toLowerCase()
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <nav className="text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-primary">Início</Link>
            <span className="mx-2">/</span>
            <span>Receitas</span>
            {selectedCategory && (
              <>
                <span className="mx-2">/</span>
                <span className="capitalize">{selectedCategory}</span>
              </>
            )}
          </nav>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {selectedCategory ? `Receitas de ${selectedCategory}` : 'Todas as Receitas'}
          </h1>
          <p className="text-muted-foreground">
            Descubra receitas deliciosas e fáceis de fazer
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Buscar</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar receitas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Categorias</h3>
              <div className="space-y-2">
                <Button
                  variant={!selectedCategory ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory('')}
                >
                  Todas as Receitas
                </Button>
                {displayCategories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Ordenar por</h3>
              <div className="space-y-2">
                <Button
                  variant={sortBy === 'popular' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSortBy('popular')}
                >
                  Mais Populares
                </Button>
                <Button
                  variant={sortBy === 'recent' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSortBy('recent')}
                >
                  Mais Recentes
                </Button>
                <Button
                  variant={sortBy === 'rating' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSortBy('rating')}
                >
                  Melhor Avaliadas
                </Button>
                <Button
                  variant={sortBy === 'time' ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSortBy('time')}
                >
                  Tempo de Preparo
                </Button>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {filteredRecipes.length} receita{filteredRecipes.length !== 1 ? 's' : ''} encontrada{filteredRecipes.length !== 1 ? 's' : ''}
              </p>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-muted"></div>
                    <CardHeader>
                      <div className="h-6 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-muted rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-muted rounded w-20"></div>
                        <div className="h-4 bg-muted rounded w-16"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma receita encontrada com os filtros selecionados.
                </p>
                <Button onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('')
                }}>
                  Limpar Filtros
                </Button>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => {
                    const recipeSlug = recipe.slug || generateSlug(recipe.title)
                    return (
                      <Link key={recipe.id} to={`/recipes/${recipeSlug}`}>
                        <Card className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                          <div className="relative">
                            <img 
                              src={recipe.featured_image || recipe.image} 
                              alt={recipe.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-4 right-4">
                              <Button size="sm" variant="secondary" className="rounded-full" onClick={(e) => e.preventDefault()}>
                                <Heart className="h-4 w-4" />
                              </Button>
                            </div>
                            <Badge className="absolute bottom-4 left-4">
                              {recipe.category_name || recipe.category}
                            </Badge>
                          </div>
                          
                          <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {recipe.title}
                              </CardTitle>
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{recipe.avg_rating || recipe.rating || '4.5'}</span>
                              </div>
                            </div>
                            <CardDescription>{recipe.description}</CardDescription>
                          </CardHeader>
                          
                          <CardContent>
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{recipe.total_time || recipe.cookTime || '30'} min</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{recipe.difficulty || 'Médio'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">
                                por {recipe.author_name || recipe.author || 'Chef Rodrigo'}
                              </span>
                              <Button size="sm" variant="ghost" onClick={(e) => e.preventDefault()}>
                                <Share2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>

                {hasMore && (
                  <div className="text-center mt-12">
                    <Button size="lg" variant="outline" onClick={loadMore}>
                      Carregar Mais Receitas
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default RecipesPage

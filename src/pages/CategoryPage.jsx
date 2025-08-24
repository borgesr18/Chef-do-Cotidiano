import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
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
  Filter
} from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'
import { useCategories } from '../hooks/useCategories'
import { SEO } from '../components/SEO'
import { LazyImage } from '../components/LazyImage'

export const CategoryPage = () => {
  const { category: categorySlug } = useParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('popular')
  
  const { 
    recipes, 
    loading, 
    hasMore, 
    loadMore, 
    search 
  } = useRecipes({ category: categorySlug })
  
  const { categories, getCategoryBySlug } = useCategories()
  const [currentCategory, setCurrentCategory] = useState(null)

  useEffect(() => {
    const loadCategory = async () => {
      if (getCategoryBySlug) {
        const category = await getCategoryBySlug(categorySlug)
        setCurrentCategory(category)
      } else {
        const mockCategories = {
          'carnes': { id: 1, name: 'Carnes', slug: 'carnes', description: 'Receitas deliciosas com carnes de todos os tipos', icon: '🥩' },
          'massas': { id: 2, name: 'Massas', slug: 'massas', description: 'Massas artesanais e pratos italianos autênticos', icon: '🍝' },
          'churrasco': { id: 3, name: 'Churrasco', slug: 'churrasco', description: 'Técnicas e receitas para o churrasco perfeito', icon: '🔥' },
          'frutos-do-mar': { id: 4, name: 'Frutos do Mar', slug: 'frutos-do-mar', description: 'Peixes e frutos do mar frescos e saborosos', icon: '🦐' },
          'bebidas': { id: 5, name: 'Bebidas', slug: 'bebidas', description: 'Drinks, sucos e bebidas para todas as ocasiões', icon: '🍺' },
          'sobremesas': { id: 6, name: 'Sobremesas', slug: 'sobremesas', description: 'Doces irresistíveis para finalizar qualquer refeição', icon: '🍰' }
        }
        setCurrentCategory(mockCategories[categorySlug])
      }
    }

    loadCategory()
  }, [categorySlug, getCategoryBySlug])


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
      title: "Picanha na Brasa",
      description: "A rainha do churrasco brasileiro preparada com maestria",
      image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop",
      cookTime: "35 min",
      difficulty: "Médio",
      rating: 4.9,
      author: "Chef Rodrigo",
      category: "Carnes"
    },
    {
      id: 3,
      title: "Costela Assada",
      description: "Costela suculenta assada lentamente com temperos especiais",
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
      cookTime: "180 min",
      difficulty: "Difícil",
      rating: 4.7,
      author: "Chef Rodrigo",
      category: "Carnes"
    }
  ]

  const displayRecipes = recipes

  const filteredRecipes = displayRecipes.filter(recipe => {
    return !searchQuery || 
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
  })

  console.log('CategoryPage Debug:', {
    categorySlug,
    recipesLength: recipes.length,
    displayRecipesLength: displayRecipes.length,
    filteredRecipesLength: filteredRecipes.length,
    loading,
    currentCategory
  })

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Categoria não encontrada</h1>
          <Button asChild>
            <Link to="/recipes">Ver Todas as Receitas</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`Receitas de ${currentCategory.name} - Chef do Cotidiano`}
        description={`Explore nossa coleção de receitas de ${currentCategory.name}. Pratos deliciosos e práticos para o seu dia a dia.`}
        image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=630&fit=crop"
      />
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <nav className="text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Início</Link>
            <span className="mx-2">/</span>
            <Link to="/recipes" className="hover:text-primary">Receitas</Link>
            <span className="mx-2">/</span>
            <span>{currentCategory.name}</span>
          </nav>
          
          <div className="flex items-center space-x-4 mb-6">
            <div className="text-6xl">{currentCategory.icon}</div>
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Receitas de {currentCategory.name}
              </h1>
              <p className="text-xl text-muted-foreground">
                {currentCategory.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={`Buscar receitas de ${currentCategory.name.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={sortBy === 'popular' ? "default" : "outline"}
                onClick={() => setSortBy('popular')}
              >
                Populares
              </Button>
              <Button
                variant={sortBy === 'recent' ? "default" : "outline"}
                onClick={() => setSortBy('recent')}
              >
                Recentes
              </Button>
              <Button
                variant={sortBy === 'rating' ? "default" : "outline"}
                onClick={() => setSortBy('rating')}
              >
                Bem Avaliadas
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <p className="text-muted-foreground">
            {filteredRecipes.length} receita{filteredRecipes.length !== 1 ? 's' : ''} de {currentCategory.name.toLowerCase()}
          </p>
          
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
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
              Nenhuma receita de {currentCategory.name.toLowerCase()} encontrada.
            </p>
            <Button onClick={() => setSearchQuery('')}>
              Limpar Busca
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecipes.map((recipe) => (
                <Card key={recipe.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="relative">
                    <LazyImage 
                      src={recipe.featured_image || recipe.image} 
                      alt={recipe.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <Button size="sm" variant="secondary" className="rounded-full">
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
                      <Button size="sm" variant="ghost">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
      </div>
    </div>
  )
}

export default CategoryPage

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Input } from '@/components/ui/input.jsx'
import { 
  ChefHat, 
  Clock, 
  Users, 
  Star, 
  Search, 
  Play,
  BookOpen,
  Heart,
  Share2,
  Filter
} from 'lucide-react'
import { useRecipes } from '../hooks/useRecipes'
import { useCategories } from '../hooks/useCategories'
import { generateSlug } from '../lib/utils'
import { SEO } from '../components/SEO'

export const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  
  const { recipes: featuredRecipes, loading: recipesLoading } = useRecipes({ 
    limit: 6, 
    featured: true 
  })
  const { categories, loading: categoriesLoading } = useCategories()

  const courses = [
    { title: "Básico de Culinária", price: "R$ 97", students: "1.2k", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop" },
    { title: "Churrasco Profissional", price: "R$ 147", students: "856", image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=300&h=200&fit=crop" },
    { title: "Massas Artesanais", price: "R$ 127", students: "743", image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop" },
    { title: "Técnicas Avançadas", price: "R$ 197", students: "432", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop" }
  ]

  const mockFeaturedRecipes = [
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
    { id: 1, name: "Carnes", slug: "carnes", count: 45, icon: "🥩" },
    { id: 2, name: "Massas", slug: "massas", count: 32, icon: "🍝" },
    { id: 3, name: "Churrasco", slug: "churrasco", count: 28, icon: "🔥" },
    { id: 4, name: "Frutos do Mar", slug: "frutos-do-mar", count: 24, icon: "🦐" },
    { id: 5, name: "Bebidas", slug: "bebidas", count: 18, icon: "🍺" },
    { id: 6, name: "Sobremesas", slug: "sobremesas", count: 15, icon: "🍰" }
  ]

  const displayCategories = categories.length > 0 ? categories : mockCategories
  const displayRecipes = featuredRecipes.length > 0 ? featuredRecipes : mockFeaturedRecipes

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Chef do Cotidiano - Receitas Masculinas e Práticas"
        description="Receitas deliciosas e práticas para o seu dia a dia. Aprenda a cozinhar com o Chef do Cotidiano. Cursos online, receitas exclusivas e dicas profissionais."
        image="/og-home.jpg"
      />
      <section id="home" className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Culinária <span className="text-primary">Masculina</span> Descomplicada
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Aprenda a cozinhar pratos deliciosos com receitas descomplicadas 
              para homens que querem impressionar na cozinha.
            </p>
            
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Buscar receitas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/recipes">
                  <Play className="mr-2 h-5 w-5" />
                  Ver Receitas
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8" asChild>
                <Link to="/courses">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Cursos Online
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Encontre Sua Próxima Receita</h2>
            <p className="text-muted-foreground">Explore nossas receitas por categoria</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-muted rounded-full mx-auto mb-3"></div>
                    <div className="h-4 bg-muted rounded mb-1"></div>
                    <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
                  </CardContent>
                </Card>
              ))
            ) : (
              displayCategories.map((category) => (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer group" asChild>
                  <Link to={`/recipes/category/${category.slug}`}>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                        {category.icon}
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                      <p className="text-sm text-muted-foreground">Ver receitas</p>
                    </CardContent>
                  </Link>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      <section id="recipes" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Receitas Mais Populares</h2>
              <p className="text-muted-foreground">As receitas mais populares da semana</p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/recipes">
                <Filter className="mr-2 h-4 w-4" />
                Ver Todas
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recipesLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
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
              ))
            ) : (
              displayRecipes.map((recipe) => {
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
              })
            )}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild>
              <Link to="/recipes">
                Ver Todas as Receitas
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Por Que Escolher Nossa Plataforma</h2>
            <p className="text-muted-foreground">Descubra o que nos torna únicos</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Receitas Rápidas</h3>
              <p className="text-sm text-muted-foreground">
                Pratos deliciosos em poucos minutos para o dia a dia corrido
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Passo a Passo</h3>
              <p className="text-sm text-muted-foreground">
                Instruções detalhadas com vídeos para não errar nunca mais
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Fácil Culinária</h3>
              <p className="text-sm text-muted-foreground">
                Receitas pensadas especialmente para quem está começando
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Comunidade</h3>
              <p className="text-sm text-muted-foreground">
                Conecte-se com outros entusiastas da culinária masculina
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Aprimore Suas Habilidades</h2>
            <p className="text-muted-foreground">Cursos online para todos os níveis</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <img src={course.image} alt={course.title} className="w-full h-32 object-cover" />
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{course.title}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">{course.price}</span>
                    <span className="text-sm text-muted-foreground">{course.students} alunos</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/courses">
                Ver Todos os Cursos
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Culinária Prática Para Todos
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Nossa missão é desmistificar a culinária e mostrar que qualquer pessoa 
                  pode se tornar um excelente cozinheiro com as técnicas certas e 
                  ingredientes de qualidade.
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Oferecemos receitas práticas, cursos online e uma comunidade 
                  engajada para apoiar sua jornada culinária.
                </p>
                <Button size="lg" asChild>
                  <Link to="/about">
                    Conheça Mais
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=500&h=600&fit=crop" 
                  alt="Chef Rodrigo Borges"
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Receba Novas Receitas Toda Semana</h2>
            <p className="mb-8">
              Inscreva-se na nossa newsletter e receba receitas exclusivas, dicas culinárias 
              e novidades direto no seu email.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Seu melhor e-mail"
                className="bg-background text-foreground"
              />
              <Button variant="secondary" size="lg">
                Quero Receber
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

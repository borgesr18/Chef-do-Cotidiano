import { useState } from 'react'
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
  Menu, 
  X,
  Play,
  BookOpen,
  Heart,
  Share2,
  Filter
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { LoginModal } from './components/auth/LoginModal'
import { UserProfile } from './components/auth/UserProfile'
import useFavorites from './hooks/useFavorites'
import './App.css'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()

  // Dados mockados para demonstração
  const featuredRecipes = [
    {
      id: 1,
      title: "Hambúrguer Artesanal Perfeito",
      description: "Aprenda a fazer o hambúrguer definitivo com blend especial de carnes",
      image: "/api/placeholder/400/300",
      cookTime: "30 min",
      difficulty: "Médio",
      rating: 4.8,
      author: "Chef Rodrigo",
      category: "Carnes"
    },
    {
      id: 2,
      title: "Pasta Cremosa com Camarão",
      description: "Receita italiana adaptada para o paladar brasileiro",
      image: "/api/placeholder/400/300",
      cookTime: "25 min",
      difficulty: "Fácil",
      rating: 4.9,
      author: "Chef Rodrigo",
      category: "Massas"
    },
    {
      id: 3,
      title: "Churrasco de Picanha Premium",
      description: "Técnicas profissionais para o churrasco perfeito",
      image: "/api/placeholder/400/300",
      cookTime: "45 min",
      difficulty: "Difícil",
      rating: 4.7,
      author: "Chef Rodrigo",
      category: "Churrasco"
    }
  ]

  const categories = [
    { name: "Carnes", count: 45, icon: "🥩" },
    { name: "Massas", count: 32, icon: "🍝" },
    { name: "Churrasco", count: 28, icon: "🔥" },
    { name: "Frutos do Mar", count: 24, icon: "🦐" },
    { name: "Bebidas", count: 18, icon: "🍺" },
    { name: "Sobremesas", count: 15, icon: "🍰" }
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const handleFavoriteClick = async (recipeId) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true)
      return
    }
    
    await toggleFavorite(recipeId)
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-primary" />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground">Chef do Cotidiano</span>
                <span className="text-xs text-muted-foreground">AI</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#home" className="text-foreground hover:text-primary transition-colors">Início</a>
              <a href="#recipes" className="text-foreground hover:text-primary transition-colors">Receitas</a>
              <a href="#courses" className="text-foreground hover:text-primary transition-colors">Cursos</a>
              <a href="#blog" className="text-foreground hover:text-primary transition-colors">Blog</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors">Sobre</a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Entrar
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    Cadastrar
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden border-t py-4">
              <nav className="flex flex-col space-y-4">
                <a href="#home" className="text-foreground hover:text-primary transition-colors">Início</a>
                <a href="#recipes" className="text-foreground hover:text-primary transition-colors">Receitas</a>
                <a href="#courses" className="text-foreground hover:text-primary transition-colors">Cursos</a>
                <a href="#blog" className="text-foreground hover:text-primary transition-colors">Blog</a>
                <a href="#about" className="text-foreground hover:text-primary transition-colors">Sobre</a>
                <div className="flex flex-col space-y-2 pt-4 border-t">
                  {isAuthenticated ? (
                    <div className="flex justify-center">
                      <UserProfile />
                    </div>
                  ) : (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        Entrar
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        Cadastrar
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6">
              Receitas <span className="text-primary">Masculinas</span> e Práticas
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Aprenda a cozinhar pratos deliciosos com o Chef Rodrigo Borges. 
              Receitas descomplicadas para homens que querem impressionar na cozinha.
            </p>
            
            {/* Search Bar */}
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
              <Button size="lg" className="text-lg px-8">
                <Play className="mr-2 h-5 w-5" />
                Ver Receitas
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8">
                <BookOpen className="mr-2 h-5 w-5" />
                Cursos Online
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Categorias Populares</h2>
            <p className="text-muted-foreground">Explore nossas receitas por categoria</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
                  <p className="text-sm text-muted-foreground">{category.count} receitas</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section id="recipes" className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Receitas em Destaque</h2>
              <p className="text-muted-foreground">As receitas mais populares da semana</p>
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredRecipes.map((recipe) => (
              <Card key={recipe.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                <div className="relative">
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="rounded-full"
                      onClick={() => handleFavoriteClick(recipe.id)}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          isFavorite(recipe.id) 
                            ? 'fill-red-500 text-red-500' 
                            : ''
                        }`} 
                      />
                    </Button>
                  </div>
                  <Badge className="absolute bottom-4 left-4">
                    {recipe.category}
                  </Badge>
                </div>
                
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {recipe.title}
                    </CardTitle>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{recipe.rating}</span>
                    </div>
                  </div>
                  <CardDescription>{recipe.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{recipe.cookTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{recipe.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">por {recipe.author}</span>
                    <Button size="sm" variant="ghost">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" variant="outline">
              Ver Todas as Receitas
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">
                  Sobre o Chef Rodrigo Borges
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Com mais de 15 anos de experiência na cozinha, o Chef Rodrigo Borges 
                  especializou-se em criar receitas práticas e saborosas especialmente 
                  pensadas para o público masculino.
                </p>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Sua missão é desmistificar a culinária e mostrar que qualquer homem 
                  pode se tornar um excelente cozinheiro com as técnicas certas e 
                  ingredientes de qualidade.
                </p>
                <Button size="lg">
                  Conheça Mais
                </Button>
              </div>
              <div className="relative">
                <img 
                  src="/api/placeholder/500/600" 
                  alt="Chef Rodrigo Borges"
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <ChefHat className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Chef do Cotidiano AI</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Receitas masculinas e práticas para impressionar na cozinha.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Receitas</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Carnes</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Massas</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Churrasco</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Frutos do Mar</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Cursos</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Básico de Culinária</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Churrasco Profissional</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Massas Artesanais</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Técnicas Avançadas</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contato</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@chefdocotidiano.com</li>
                <li>(11) 99999-9999</li>
                <li>São Paulo, SP</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Chef do Cotidiano AI. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </div>
  )
}

export default App


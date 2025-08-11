import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, Users, Star, Heart, Share2, ArrowLeft } from 'lucide-react'
import { useRecipe } from '../hooks/useRecipes'
import { generateSlug } from '../lib/utils'
import { SEO } from '../components/SEO'

export const RecipeDetailPage = () => {
  const { slug } = useParams()
  const { recipe, loading, error } = useRecipe(slug)

  const mockRecipes = [
    {
      id: 1,
      title: "Bife Ancho Grelhado",
      slug: "bife-ancho-grelhado",
      description: "Corte nobre grelhado na perfeição com temperos especiais",
      featured_image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
      total_time: 25,
      prep_time: 10,
      cook_time: 15,
      servings: 2,
      difficulty: "Médio",
      avg_rating: 4.8,
      author_name: "Chef Rodrigo",
      category_name: "Carnes",
      instructions: [
        "Retire a carne da geladeira 30 minutos antes do preparo",
        "Tempere com sal grosso e pimenta do reino",
        "Aqueça a grelha em fogo alto",
        "Grelhe por 3-4 minutos de cada lado para mal passado",
        "Deixe descansar por 5 minutos antes de servir"
      ],
      ingredients: [
        { name: "Bife ancho", quantity: 2, unit: "unidades" },
        { name: "Sal grosso", quantity: 1, unit: "colher de chá" },
        { name: "Pimenta do reino", quantity: 1, unit: "pitada" },
        { name: "Azeite", quantity: 1, unit: "colher de sopa" }
      ]
    },
    {
      id: 2,
      title: "Carbonara Autêntica",
      slug: "carbonara-autentica",
      description: "A verdadeira receita italiana com ovos, queijo e pancetta",
      featured_image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop",
      total_time: 20,
      prep_time: 10,
      cook_time: 10,
      servings: 4,
      difficulty: "Fácil",
      avg_rating: 4.6,
      author_name: "Chef Rodrigo",
      category_name: "Massas",
      instructions: [
        "Ferva água com sal para o macarrão",
        "Corte a pancetta em cubos pequenos",
        "Bata os ovos com queijo parmesão ralado",
        "Refogue a pancetta até dourar",
        "Cozinhe o macarrão al dente",
        "Misture tudo rapidamente fora do fogo"
      ],
      ingredients: [
        { name: "Spaghetti", quantity: 400, unit: "g" },
        { name: "Pancetta", quantity: 150, unit: "g" },
        { name: "Ovos", quantity: 4, unit: "unidades" },
        { name: "Parmesão", quantity: 100, unit: "g" },
        { name: "Pimenta do reino", quantity: 1, unit: "pitada" }
      ]
    },
    {
      id: 3,
      title: "Churrasco de Picanha Premium",
      slug: "churrasco-de-picanha-premium",
      description: "Técnicas profissionais para o churrasco perfeito",
      featured_image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=800&h=600&fit=crop",
      total_time: 45,
      prep_time: 15,
      cook_time: 30,
      servings: 6,
      difficulty: "Difícil",
      avg_rating: 4.7,
      author_name: "Chef Rodrigo",
      category_name: "Churrasco",
      instructions: [
        "Deixe a carne em temperatura ambiente por 1 hora",
        "Tempere apenas com sal grosso",
        "Prepare o fogo com carvão de qualidade",
        "Grelhe com a gordura voltada para baixo primeiro",
        "Vire apenas uma vez durante o cozimento",
        "Deixe descansar antes de fatiar"
      ],
      ingredients: [
        { name: "Picanha", quantity: 1.5, unit: "kg" },
        { name: "Sal grosso", quantity: 2, unit: "colheres de sopa" },
        { name: "Carvão", quantity: 2, unit: "kg" }
      ]
    },
    {
      id: 4,
      title: "Salmão Grelhado com Ervas",
      slug: "salmao-grelhado-com-ervas",
      description: "Peixe fresco com marinada de ervas mediterrâneas",
      featured_image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
      total_time: 30,
      prep_time: 15,
      cook_time: 15,
      servings: 4,
      difficulty: "Médio",
      avg_rating: 4.5,
      author_name: "Chef Rodrigo",
      category_name: "Frutos do Mar",
      instructions: [
        "Marine o salmão com ervas por 30 minutos",
        "Aqueça a grelha em temperatura média",
        "Grelhe por 4-5 minutos de cada lado",
        "Regue com azeite e limão",
        "Sirva imediatamente"
      ],
      ingredients: [
        { name: "Filé de salmão", quantity: 4, unit: "unidades" },
        { name: "Alecrim", quantity: 2, unit: "ramos" },
        { name: "Tomilho", quantity: 1, unit: "colher de chá" },
        { name: "Azeite", quantity: 3, unit: "colheres de sopa" },
        { name: "Limão", quantity: 1, unit: "unidade" }
      ]
    },
    {
      id: 5,
      title: "Caipirinha Tradicional",
      slug: "caipirinha-tradicional",
      description: "O drink brasileiro mais famoso do mundo",
      featured_image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&h=600&fit=crop",
      total_time: 5,
      prep_time: 5,
      cook_time: 0,
      servings: 1,
      difficulty: "Fácil",
      avg_rating: 4.9,
      author_name: "Chef Rodrigo",
      category_name: "Bebidas",
      instructions: [
        "Corte a lima em pedaços pequenos",
        "Macere a lima com açúcar no copo",
        "Adicione gelo e cachaça",
        "Misture bem e sirva"
      ],
      ingredients: [
        { name: "Lima", quantity: 1, unit: "unidade" },
        { name: "Açúcar cristal", quantity: 2, unit: "colheres de chá" },
        { name: "Cachaça", quantity: 60, unit: "ml" },
        { name: "Gelo", quantity: 1, unit: "xícara" }
      ]
    },
    {
      id: 6,
      title: "Brigadeiro Gourmet",
      slug: "brigadeiro-gourmet",
      description: "O doce brasileiro mais amado em versão sofisticada",
      featured_image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&h=600&fit=crop",
      total_time: 15,
      prep_time: 5,
      cook_time: 10,
      servings: 20,
      difficulty: "Fácil",
      avg_rating: 4.8,
      author_name: "Chef Rodrigo",
      category_name: "Sobremesas",
      instructions: [
        "Misture todos os ingredientes na panela",
        "Cozinhe em fogo baixo mexendo sempre",
        "Cozinhe até desgrudar do fundo da panela",
        "Deixe esfriar completamente",
        "Faça bolinhas e passe no granulado"
      ],
      ingredients: [
        { name: "Leite condensado", quantity: 1, unit: "lata" },
        { name: "Chocolate em pó", quantity: 3, unit: "colheres de sopa" },
        { name: "Manteiga", quantity: 1, unit: "colher de sopa" },
        { name: "Granulado", quantity: 100, unit: "g" }
      ]
    }
  ]

  const displayRecipe = recipe || mockRecipes.find(r => r.slug === slug || generateSlug(r.title) === slug)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-muted rounded w-full mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !displayRecipe) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Receita não encontrada</h1>
            <p className="text-muted-foreground mb-6">A receita que você procura não existe ou foi removida.</p>
            <Button asChild>
              <Link to="/recipes">Voltar para Receitas</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title={`${recipe?.title || 'Receita'} - Chef do Cotidiano`}
        description={recipe?.description || 'Receita deliciosa do Chef do Cotidiano'}
        image={recipe?.featured_image || '/og-recipe.jpg'}
        type="article"
        article={recipe ? {
          publishedTime: recipe.created_at,
          modifiedTime: recipe.updated_at,
          author: recipe.author_name || 'Chef Rodrigo',
          tags: recipe.tags || []
        } : null}
      />
      
      {recipe && (
        <script type="application/ld+json">
          {JSON.stringify(generateRecipeStructuredData(recipe))}
        </script>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Início</Link>
          <span className="mx-2">/</span>
          <Link to="/recipes" className="hover:text-primary">Receitas</Link>
          <span className="mx-2">/</span>
          <span>{displayRecipe.title}</span>
        </nav>

        <Button variant="ghost" asChild className="mb-6">
          <Link to="/recipes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Receitas
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <img
              src={displayRecipe.featured_image || displayRecipe.image}
              alt={displayRecipe.title}
              className="w-full h-64 lg:h-96 object-cover rounded-lg mb-6"
            />

            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold mb-2">{displayRecipe.title}</h1>
                <p className="text-muted-foreground">{displayRecipe.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{displayRecipe.total_time} min</p>
                  <p className="text-xs text-muted-foreground">Tempo Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{displayRecipe.servings || 2} porções</p>
                  <p className="text-xs text-muted-foreground">Serve</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{displayRecipe.avg_rating || displayRecipe.rating}</p>
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Badge variant="secondary" className="mb-2">{displayRecipe.difficulty}</Badge>
                  <p className="text-xs text-muted-foreground">Dificuldade</p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Modo de Preparo</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {(displayRecipe.instructions || []).map((step, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium mr-4">
                        {index + 1}
                      </span>
                      <p className="text-sm">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Ingredientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {(displayRecipe.ingredients || []).map((ingredient, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-sm">{ingredient.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {ingredient.quantity} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetailPage

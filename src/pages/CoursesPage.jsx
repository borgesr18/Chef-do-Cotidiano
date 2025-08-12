import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Clock, Users, Star, BookOpen, Play } from 'lucide-react'
import { courses } from '../lib/supabase'
import { useCategories } from '../hooks/useCategories'
import { usePayment } from '../hooks/usePayment'
import { SEO } from '../components/SEO'
import { LazyImage } from '../components/LazyImage'
import { toast } from 'sonner'

export const CoursesPage = () => {
  const [coursesList, setCoursesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedLevel, setSelectedLevel] = useState('')
  const { categories } = useCategories()
  const { createEnrollment } = usePayment()

  const mockCourses = [
    {
      id: 1,
      title: "Churrasco Perfeito",
      description: "Aprenda todas as técnicas para fazer o churrasco perfeito, desde a escolha da carne até o ponto ideal.",
      featured_image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop",
      price: 149.90,
      level: "Intermediário",
      duration_hours: 8,
      lessons_count: 12,
      students_count: 245,
      rating: 4.8,
      instructor_name: "Chef Rodrigo",
      category_name: "Carnes",
      status: "published"
    },
    {
      id: 2,
      title: "Massas Artesanais",
      description: "Domine a arte de fazer massas frescas em casa, desde o básico até receitas mais elaboradas.",
      featured_image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      price: 99.90,
      level: "Iniciante",
      duration_hours: 6,
      lessons_count: 10,
      students_count: 189,
      rating: 4.7,
      instructor_name: "Chef Rodrigo",
      category_name: "Massas",
      status: "published"
    },
    {
      id: 3,
      title: "Frutos do Mar Gourmet",
      description: "Técnicas profissionais para preparar pratos sofisticados com frutos do mar.",
      featured_image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      price: 199.90,
      level: "Avançado",
      duration_hours: 10,
      lessons_count: 15,
      students_count: 156,
      rating: 4.9,
      instructor_name: "Chef Rodrigo",
      category_name: "Frutos do Mar",
      status: "published"
    }
  ]

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const { data, error } = await courses.getPublished()
      
      if (error || !data || data.length === 0) {
        console.log('API failed or no data, using mock data for courses')
        setCoursesList(mockCourses)
      } else {
        setCoursesList(data)
      }
    } catch (error) {
      console.log('Error fetching courses, using mock data:', error)
      setCoursesList(mockCourses)
    } finally {
      setLoading(false)
    }
  }

  const handleEnrollment = async (courseId, price) => {
    try {
      const result = await createEnrollment(courseId, {
        method: 'stripe',
        amount: price,
        transactionId: `temp_${Date.now()}`
      })
      
      if (result.data) {
        toast.success('Inscrição realizada com sucesso!')
      } else {
        toast.error('Erro ao processar inscrição')
      }
    } catch (error) {
      toast.error('Erro ao processar inscrição')
    }
  }

  const filteredCourses = coursesList.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || course.category_name === selectedCategory
    const matchesLevel = !selectedLevel || selectedLevel === 'all' || course.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesLevel
  })

  const levels = ['Iniciante', 'Intermediário', 'Avançado']

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cursos Online - Chef do Cotidiano"
        description="Aprenda a cozinhar com nossos cursos online. Técnicas profissionais, receitas exclusivas e acompanhamento personalizado."
        image="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=630&fit=crop"
      />

      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Cursos Online de Culinária
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Aprenda técnicas profissionais de culinária com o Chef Rodrigo. 
            Cursos práticos e didáticos para todos os níveis.
          </p>
          <Button size="lg" variant="secondary">
            <Play className="h-5 w-5 mr-2" />
            Começar Agora
          </Button>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Buscar cursos..."
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

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Todos os níveis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os níveis</SelectItem>
                  {levels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
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
                <h2 className="text-2xl font-bold">
                  {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado{filteredCourses.length !== 1 ? 's' : ''}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-shadow group cursor-pointer">
                    <div className="relative">
                      <LazyImage 
                        src={course.featured_image} 
                        alt={course.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary">
                          {course.category_name}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-green-600 text-white">
                          R$ {course.price?.toFixed(2)}
                        </Badge>
                      </div>
                    </div>
                    
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {course.title}
                        </CardTitle>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{course.rating}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {course.description}
                      </p>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{course.duration_hours}h</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-4 w-4" />
                            <span>{course.lessons_count} aulas</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{course.students_count}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <Badge variant="outline">{course.level}</Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            por {course.instructor_name}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button className="flex-1" asChild>
                            <Link to={`/courses/${course.id}`}>
                              Ver Curso
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={() => handleEnrollment(course.id, course.price)}
                          >
                            Inscrever-se
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum curso encontrado</h3>
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

export default CoursesPage

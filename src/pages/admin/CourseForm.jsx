import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { courses, categories, supabase } from '../../lib/supabase'
import { generateSlug } from '../../lib/utils'
import { Plus, Trash2, GripVertical, ArrowLeft } from 'lucide-react'
import { DragDropProvider } from '../../components/admin/DragDropProvider'
import { DraggableItem } from '../../components/admin/DraggableItem'
import { toast } from 'sonner'

export const CourseForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [categoriesList, setCategoriesList] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    level: 'beginner',
    status: 'draft',
    price: '',
    category_id: '',
    featured_image: '',
    what_you_learn: [''],
    target_audience: '',
    modules: []
  })

  useEffect(() => {
    fetchCategories()
    if (isEdit) {
      fetchCourse()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const { data } = await categories.getAll()
      setCategoriesList(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const { data, error } = await courses.getById(id)
      if (error) throw error
      
      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          level: data.level || 'beginner',
          status: data.status || 'draft',
          price: data.price?.toString() || '',
          category_id: data.category_id || '',
          featured_image: data.featured_image || '',
          what_you_learn: data.what_you_learn || [''],
          target_audience: data.target_audience || '',
          modules: data.modules || []
        })
      }
    } catch (error) {
      console.error('Error fetching course:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    if (field === 'title' && !isEdit) {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  const handleLearningChange = (index, value) => {
    const newLearning = [...formData.what_you_learn]
    newLearning[index] = value
    setFormData(prev => ({ ...prev, what_you_learn: newLearning }))
  }

  const addLearning = () => {
    setFormData(prev => ({
      ...prev,
      what_you_learn: [...prev.what_you_learn, '']
    }))
  }

  const removeLearning = (index) => {
    if (formData.what_you_learn.length > 1) {
      setFormData(prev => ({
        ...prev,
        what_you_learn: prev.what_you_learn.filter((_, i) => i !== index)
      }))
    }
  }

  const addModule = () => {
    const newModule = {
      id: Date.now(),
      title: '',
      description: '',
      sort_order: formData.modules.length,
      lessons: []
    }
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }))
  }

  const updateModule = (moduleIndex, field, value) => {
    const newModules = [...formData.modules]
    newModules[moduleIndex] = { ...newModules[moduleIndex], [field]: value }
    setFormData(prev => ({ ...prev, modules: newModules }))
  }

  const removeModule = (moduleIndex) => {
    setFormData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== moduleIndex)
    }))
  }

  const addLesson = (moduleIndex) => {
    const newLesson = {
      id: Date.now(),
      title: '',
      description: '',
      video_url: '',
      duration_minutes: '',
      is_preview: false,
      sort_order: formData.modules[moduleIndex].lessons.length
    }
    
    const newModules = [...formData.modules]
    newModules[moduleIndex].lessons.push(newLesson)
    setFormData(prev => ({ ...prev, modules: newModules }))
  }

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    const newModules = [...formData.modules]
    newModules[moduleIndex].lessons[lessonIndex] = {
      ...newModules[moduleIndex].lessons[lessonIndex],
      [field]: value
    }
    setFormData(prev => ({ ...prev, modules: newModules }))
  }

  const removeLesson = (moduleIndex, lessonIndex) => {
    const newModules = [...formData.modules]
    newModules[moduleIndex].lessons = newModules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex)
    setFormData(prev => ({ ...prev, modules: newModules }))
  }

  const reorderModules = (draggedModule, targetModule) => {
    const newModules = [...formData.modules]
    const draggedIndex = newModules.findIndex(m => m.id === draggedModule.id)
    const targetIndex = newModules.findIndex(m => m.id === targetModule.id)
    
    const [removed] = newModules.splice(draggedIndex, 1)
    newModules.splice(targetIndex, 0, removed)
    
    newModules.forEach((module, index) => {
      module.sort_order = index
    })
    
    setFormData(prev => ({ ...prev, modules: newModules }))
  }

  const reorderLessons = (moduleIndex, draggedLesson, targetLesson) => {
    const newModules = [...formData.modules]
    const lessons = newModules[moduleIndex].lessons
    const draggedIndex = lessons.findIndex(l => l.id === draggedLesson.id)
    const targetIndex = lessons.findIndex(l => l.id === targetLesson.id)
    
    const [removed] = lessons.splice(draggedIndex, 1)
    lessons.splice(targetIndex, 0, removed)
    
    lessons.forEach((lesson, index) => {
      lesson.sort_order = index
    })
    
    setFormData(prev => ({ ...prev, modules: newModules }))
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setLoading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `courses/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, featured_image: publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const courseData = {
        ...formData,
        price: parseFloat(formData.price) || 0
      }

      let result
      if (isEdit) {
        result = await courses.update(id, courseData)
      } else {
        result = await courses.create(courseData)
      }

      if (result.error) throw result.error

      toast.success(isEdit ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!')
      navigate('/admin/courses')
    } catch (error) {
      console.error('Error saving course:', error)
      toast.error('Erro ao salvar curso')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/courses')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Editar Curso' : 'Novo Curso'}
        </h1>
      </div>

      <DragDropProvider>
        <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="level">Nível</Label>
                <Select value={formData.level} onValueChange={(value) => handleInputChange('level', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={formData.category_id} onValueChange={(value) => handleInputChange('category_id', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesList.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="published">Publicado</SelectItem>
                    <SelectItem value="archived">Arquivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="target_audience">Público-alvo</Label>
              <Textarea
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                rows={2}
                placeholder="Para quem é este curso?"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagem em Destaque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image-upload">Upload de Imagem</Label>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="cursor-pointer"
                />
              </div>
              {formData.featured_image && (
                <div>
                  <img
                    src={formData.featured_image}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="image-url">URL da Imagem</Label>
                <Input
                  id="image-url"
                  value={formData.featured_image}
                  onChange={(e) => handleInputChange('featured_image', e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>O que você vai aprender</CardTitle>
              <Button type="button" onClick={addLearning} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.what_you_learn.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={item}
                    onChange={(e) => handleLearningChange(index, e.target.value)}
                    placeholder="Ex: Técnicas básicas de corte"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLearning(index)}
                    disabled={formData.what_you_learn.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Módulos do Curso</CardTitle>
              <Button type="button" onClick={addModule} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Módulo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {formData.modules.map((module, moduleIndex) => (
                <DraggableItem
                  key={module.id}
                  item={module}
                  type="module"
                  onReorder={reorderModules}
                >
                  <Card className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400" />
                        <Badge variant="outline">Módulo {moduleIndex + 1}</Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeModule(moduleIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Título do Módulo</Label>
                      <Input
                        value={module.title}
                        onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                        placeholder="Ex: Fundamentos da Culinária"
                      />
                    </div>
                    <div>
                      <Label>Descrição</Label>
                      <Textarea
                        value={module.description}
                        onChange={(e) => updateModule(moduleIndex, 'description', e.target.value)}
                        rows={2}
                        placeholder="Descrição do módulo..."
                      />
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">Aulas</h4>
                        <Button
                          type="button"
                          onClick={() => addLesson(moduleIndex)}
                          size="sm"
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar Aula
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <DraggableItem
                            key={lesson.id}
                            item={lesson}
                            type="lesson"
                            onReorder={(draggedLesson, targetLesson) => reorderLessons(moduleIndex, draggedLesson, targetLesson)}
                          >
                            <div className="border rounded-lg p-3 bg-gray-50">
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="secondary" size="sm">
                                Aula {lessonIndex + 1}
                              </Badge>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLesson(moduleIndex, lessonIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <Label>Título da Aula</Label>
                                <Input
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                  placeholder="Título da aula"
                                  size="sm"
                                />
                              </div>
                              <div>
                                <Label>Duração (min)</Label>
                                <Input
                                  type="number"
                                  value={lesson.duration_minutes}
                                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'duration_minutes', e.target.value)}
                                  placeholder="30"
                                  size="sm"
                                />
                              </div>
                            </div>
                            <div className="mt-2">
                              <Label>URL do Vídeo</Label>
                              <Input
                                value={lesson.video_url}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'video_url', e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                                size="sm"
                              />
                            </div>
                            <div className="mt-2">
                              <Label>Descrição</Label>
                              <Textarea
                                value={lesson.description}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'description', e.target.value)}
                                rows={2}
                                placeholder="Descrição da aula..."
                              />
                            </div>
                            <div className="mt-2 flex items-center space-x-2">
                              <input
                                type="checkbox"
                                id={`preview-${moduleIndex}-${lessonIndex}`}
                                checked={lesson.is_preview}
                                onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'is_preview', e.target.checked)}
                              />
                              <Label htmlFor={`preview-${moduleIndex}-${lessonIndex}`}>
                                Aula gratuita (preview)
                              </Label>
                            </div>
                            </div>
                          </DraggableItem>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  </Card>
                </DraggableItem>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/courses')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'} Curso
          </Button>
        </div>
        </form>
      </DragDropProvider>
    </div>
  )
}

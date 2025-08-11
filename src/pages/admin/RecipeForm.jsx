import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { recipes, categories, supabase } from '../../lib/supabase'
import { generateSlug } from '../../lib/utils'
import { Plus, Trash2, Upload, ArrowLeft } from 'lucide-react'

export const RecipeForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [categoriesList, setCategoriesList] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    prep_time: '',
    cook_time: '',
    servings: '',
    difficulty: 'easy',
    status: 'draft',
    category_id: '',
    featured_image: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: ['']
  })

  useEffect(() => {
    fetchCategories()
    if (isEdit) {
      fetchRecipe()
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

  const fetchRecipe = async () => {
    try {
      setLoading(true)
      const { data, error } = await recipes.getById(id)
      if (error) throw error
      
      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          prep_time: data.prep_time?.toString() || '',
          cook_time: data.cook_time?.toString() || '',
          servings: data.servings?.toString() || '',
          difficulty: data.difficulty || 'easy',
          status: data.status || 'draft',
          category_id: data.category_id || '',
          featured_image: data.featured_image || '',
          ingredients: data.ingredients || [{ name: '', quantity: '', unit: '' }],
          instructions: data.instructions || ['']
        })
      }
    } catch (error) {
      console.error('Error fetching recipe:', error)
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

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index] = { ...newIngredients[index], [field]: value }
    setFormData(prev => ({ ...prev, ingredients: newIngredients }))
  }

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }))
  }

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      setFormData(prev => ({
        ...prev,
        ingredients: prev.ingredients.filter((_, i) => i !== index)
      }))
    }
  }

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions]
    newInstructions[index] = value
    setFormData(prev => ({ ...prev, instructions: newInstructions }))
  }

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }))
  }

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      setFormData(prev => ({
        ...prev,
        instructions: prev.instructions.filter((_, i) => i !== index)
      }))
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setLoading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `recipes/${fileName}`

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
      
      const recipeData = {
        ...formData,
        prep_time: parseInt(formData.prep_time) || 0,
        cook_time: parseInt(formData.cook_time) || 0,
        servings: parseInt(formData.servings) || 1,
        total_time: (parseInt(formData.prep_time) || 0) + (parseInt(formData.cook_time) || 0)
      }

      let result
      if (isEdit) {
        result = await recipes.update(id, recipeData)
      } else {
        result = await recipes.create(recipeData)
      }

      if (result.error) throw result.error

      navigate('/admin/recipes')
    } catch (error) {
      console.error('Error saving recipe:', error)
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/admin/recipes')} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Editar Receita' : 'Nova Receita'}
        </h1>
      </div>

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
                <Label htmlFor="prep_time">Tempo de Preparo (min)</Label>
                <Input
                  id="prep_time"
                  type="number"
                  value={formData.prep_time}
                  onChange={(e) => handleInputChange('prep_time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cook_time">Tempo de Cozimento (min)</Label>
                <Input
                  id="cook_time"
                  type="number"
                  value={formData.cook_time}
                  onChange={(e) => handleInputChange('cook_time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="servings">Porções</Label>
                <Input
                  id="servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => handleInputChange('servings', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <CardTitle>Ingredientes</CardTitle>
              <Button type="button" onClick={addIngredient} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Ingrediente</Label>
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                      placeholder="Ex: Farinha de trigo"
                    />
                  </div>
                  <div className="w-24">
                    <Label>Quantidade</Label>
                    <Input
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                      placeholder="2"
                    />
                  </div>
                  <div className="w-24">
                    <Label>Unidade</Label>
                    <Input
                      value={ingredient.unit}
                      onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                      placeholder="xícara"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(index)}
                    disabled={formData.ingredients.length === 1}
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
              <CardTitle>Modo de Preparo</CardTitle>
              <Button type="button" onClick={addInstruction} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Passo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <Badge variant="outline" className="mt-2 min-w-8 justify-center">
                    {index + 1}
                  </Badge>
                  <Textarea
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Passo ${index + 1}...`}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeInstruction(index)}
                    disabled={formData.instructions.length === 1}
                    className="mt-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/recipes')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'} Receita
          </Button>
        </div>
      </form>
    </div>
  )
}

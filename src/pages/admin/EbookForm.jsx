import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ebooks, categories as categoriesAPI, supabase } from '../../lib/supabase'
import { generateSlug } from '../../lib/utils'
import { ArrowLeft, Upload } from 'lucide-react'

export const EbookForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    pages: '',
    cover_image: '',
    file_url: '',
    status: 'draft',
    category_id: null
  })
  const [categories, setCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: categoriesData } = await categoriesAPI.getAllForAdmin()
      setCategories(categoriesData || [])
      if (isEdit) {
        const { data } = await ebooks.getById(id)
        if (data) setForm({
          title: data.title || '',
          slug: data.slug || '',
          description: data.description || '',
          price: data.price || '',
          pages: data.pages || '',
          cover_image: data.cover_image || '',
          file_url: data.file_url || '',
          status: data.status || 'draft',
          category_id: data.category_id || null
        })
      }
      setLoading(false)
    }
    load()
  }, [id, isEdit])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleTitleChange = (value) => {
    handleChange('title', value)
    handleChange('slug', generateSlug(value))
  }

  const handleUploadCover = async (file) => {
    if (!file) return
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `ebooks/${fileName}`
    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file)
    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(filePath)
      handleChange('cover_image', publicUrl)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price || 0),
        pages: form.pages ? Number(form.pages) : null
      }
      if (isEdit) {
        const { error } = await ebooks.update(id, payload)
        if (error) throw error
      } else {
        const { error } = await ebooks.create(payload)
        if (error) throw error
      }
      navigate('/admin/ebooks')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Erro ao salvar e-book:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
          <h1 className="text-2xl font-bold">{isEdit ? 'Editar E-book' : 'Novo E-book'}</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do E-book</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" value={form.slug} onChange={(e) => handleChange('slug', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="price">Preço (R$)</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={(e) => handleChange('price', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pages">Páginas</Label>
                <Input id="pages" type="number" value={form.pages} onChange={(e) => handleChange('pages', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select value={form.category_id || ''} onValueChange={(val) => handleChange('category_id', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(val) => handleChange('status', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
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
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" rows={5} value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div>
                <Label htmlFor="cover">Capa</Label>
                <div className="flex items-center gap-3">
                  <Input id="cover" placeholder="URL da imagem" value={form.cover_image} onChange={(e) => handleChange('cover_image', e.target.value)} />
                  <label className="inline-flex items-center px-3 py-2 border rounded-md cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" /> Upload
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadCover(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="file_url">Arquivo (URL)</Label>
                <Input id="file_url" placeholder="URL do PDF" value={form.file_url} onChange={(e) => handleChange('file_url', e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>{saving ? 'Salvando...' : 'Salvar E-book'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EbookForm
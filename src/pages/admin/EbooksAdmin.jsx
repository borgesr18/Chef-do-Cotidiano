import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ebooks } from '../../lib/supabase'
import { Plus, Edit, Search } from 'lucide-react'

export const EbooksAdmin = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data } = await ebooks.getAll(100, 0)
      setItems(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = items.filter(i => i.title?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">E-books</h1>
        <Link to="/admin/ebooks/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" /> Novo E-book
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4" />
            <Input placeholder="Buscar e-books" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((ebook) => (
                <div key={ebook.id} className="flex items-center justify-between border rounded-md px-4 py-3">
                  <div>
                    <div className="font-medium">{ebook.title}</div>
                    <div className="text-sm text-muted-foreground">{ebook.slug}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/ebooks/${ebook.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" /> Editar
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center text-muted-foreground py-8">Nenhum e-book encontrado.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default EbooksAdmin
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { recipes } from '../../lib/supabase'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'

export const RecipesAdmin = () => {
  const [recipesList, setRecipesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, recipe: null })

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const { data, error } = await recipes.getAllForAdmin(50, 0)
      if (error) throw error
      setRecipesList(data || [])
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRecipe = async (recipe) => {
    try {
      const { error } = await recipes.delete(recipe.id)
      if (error) throw error
      
      setRecipesList(prev => prev.filter(r => r.id !== recipe.id))
      setDeleteDialog({ open: false, recipe: null })
    } catch (error) {
      console.error('Error deleting recipe:', error)
    }
  }

  const filteredRecipes = recipesList.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.categories?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'destructive'
    }
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>
  }

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty] || colors.medium}`}>
        {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'}
      </span>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Receitas</h1>
          <p className="text-gray-600 mt-2">Administre todas as receitas do sistema</p>
        </div>
        <Button asChild>
          <Link to="/admin/recipes/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Receita
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar receitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Receita</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Dificuldade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <img
                          src={recipe.image_url || '/placeholder-recipe.jpg'}
                          alt={recipe.title}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <div className="font-medium">{recipe.title}</div>
                          <div className="text-sm text-gray-500">{recipe.prep_time + recipe.cook_time} min</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {recipe.categories?.name || 'Sem categoria'}
                    </TableCell>
                    <TableCell>
                      {getDifficultyBadge(recipe.difficulty)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(recipe.status)}
                    </TableCell>
                    <TableCell>
                      {recipe.profiles?.full_name || 'Autor desconhecido'}
                    </TableCell>
                    <TableCell>
                      {new Date(recipe.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/recipes/${recipe.slug}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/admin/recipes/${recipe.id}/edit`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, recipe })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {!loading && filteredRecipes.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma receita encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, recipe: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a receita "{deleteDialog.recipe?.title}"? 
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, recipe: null })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDeleteRecipe(deleteDialog.recipe)}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
const MOCK_CATEGORIES = [
  { id: 1, name: 'Carnes', slug: 'carnes', description: 'Receitas deliciosas com carnes de todos os tipos', icon: '🥩', is_active: true, sort_order: 1 },
  { id: 2, name: 'Massas', slug: 'massas', description: 'Massas artesanais e pratos italianos autênticos', icon: '🍝', is_active: true, sort_order: 2 },
  { id: 3, name: 'Churrasco', slug: 'churrasco', description: 'Técnicas e receitas para o churrasco perfeito', icon: '🔥', is_active: true, sort_order: 3 },
  { id: 4, name: 'Frutos do Mar', slug: 'frutos-do-mar', description: 'Peixes e frutos do mar frescos e saborosos', icon: '🦐', is_active: true, sort_order: 4 },
  { id: 5, name: 'Bebidas', slug: 'bebidas', description: 'Drinks, sucos e bebidas para todas as ocasiões', icon: '🍺', is_active: true, sort_order: 5 },
  { id: 6, name: 'Sobremesas', slug: 'sobremesas', description: 'Doces irresistíveis para finalizar qualquer refeição', icon: '🍰', is_active: true, sort_order: 6 }
]
import { categories } from '../lib/supabase'

export const useCategories = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)


  // Buscar todas as categorias
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await categories.getAll()
      
      if (result.error) {
        console.log('API failed, using mock data for categories')
        setData(MOCK_CATEGORIES)
        return
      }

      setData(result.data || MOCK_CATEGORIES)

    } catch (err) {
      console.log('API failed, using mock data for categories')
      setData(MOCK_CATEGORIES)
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar categoria por slug
  const getCategoryBySlug = async (slug) => {
    try {
      const result = await categories.getBySlug(slug)
      
      if (result.error) {
        return MOCK_CATEGORIES.find(cat => cat.slug === slug) || null
      }

      return result.data || MOCK_CATEGORIES.find(cat => cat.slug === slug) || null

    } catch (err) {
      return MOCK_CATEGORIES.find(cat => cat.slug === slug) || null
    }
  }

  // Carregar categorias automaticamente
  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories: data,
    loading,
    error,
    fetchCategories,
    getCategoryBySlug
  }
}

export default useCategories


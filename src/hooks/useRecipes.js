import { useState, useEffect } from 'react'
import { recipes } from '../lib/supabase'

export const useRecipes = (options = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(true)

  const {
    limit = 10,
    category = null,
    featured = false,
    autoFetch = true
  } = options

  // Buscar receitas
  const fetchRecipes = async (offset = 0, reset = false) => {
    try {
      setLoading(true)
      setError(null)

      let result
      if (featured) {
        // Buscar receitas em destaque
        result = await recipes.getPublished(limit, offset)
        if (result.data) {
          result.data = result.data.filter(recipe => recipe.is_featured)
        }
      } else if (category) {
        // Buscar por categoria
        result = await recipes.getByCategory(category, limit, offset)
      } else {
        // Buscar todas as receitas
        result = await recipes.getPublished(limit, offset)
      }

      if (result.error) {
        setError(result.error)
        return
      }

      const newRecipes = result.data || []
      
      if (reset || offset === 0) {
        setData(newRecipes)
      } else {
        setData(prev => [...prev, ...newRecipes])
      }

      // Verificar se há mais receitas
      setHasMore(newRecipes.length === limit)

    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Carregar mais receitas (paginação)
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchRecipes(data.length, false)
    }
  }

  // Recarregar receitas
  const refresh = () => {
    fetchRecipes(0, true)
  }

  // Buscar receitas com filtros
  const search = async (query, filters = {}) => {
    try {
      setLoading(true)
      setError(null)

      const result = await recipes.search(query, filters)
      
      if (result.error) {
        setError(result.error)
        return
      }

      setData(result.data || [])
      setHasMore(false) // Busca não tem paginação por enquanto

    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar receita por slug
  const getBySlug = async (slug) => {
    try {
      setLoading(true)
      setError(null)

      const result = await recipes.getBySlug(slug)
      
      if (result.error) {
        setError(result.error)
        return null
      }

      return result.data

    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Efeito para buscar receitas automaticamente
  useEffect(() => {
    if (autoFetch) {
      fetchRecipes(0, true)
    }
  }, [category, featured, autoFetch])

  return {
    recipes: data,
    loading,
    error,
    hasMore,
    fetchRecipes,
    loadMore,
    refresh,
    search,
    getBySlug
  }
}

export const useRecipe = (slug) => {
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchRecipe = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await recipes.getBySlug(slug)
        
        if (result.error) {
          setError(result.error)
          return
        }

        setRecipe(result.data)

      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipe()
  }, [slug])

  return {
    recipe,
    loading,
    error,
    setRecipe
  }
}

export default useRecipes


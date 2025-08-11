import { useState, useEffect } from 'react'
import { recipes } from '../lib/supabase'
import { generateSlug } from '../lib/utils'

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

  const mockRecipes = [
    {
      id: 1,
      title: "Bife Ancho Grelhado",
      description: "Corte nobre grelhado na perfeição com temperos especiais",
      featured_image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
      total_time: 25,
      difficulty: "Médio",
      avg_rating: 4.8,
      author_name: "Chef Rodrigo",
      category_name: "Carnes",
      is_featured: true,
      status: "published"
    },
    {
      id: 2,
      title: "Picanha na Brasa",
      description: "A rainha do churrasco brasileiro preparada com maestria",
      featured_image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=400&h=300&fit=crop",
      total_time: 35,
      difficulty: "Médio",
      avg_rating: 4.9,
      author_name: "Chef Rodrigo",
      category_name: "Carnes",
      is_featured: true,
      status: "published"
    },
    {
      id: 3,
      title: "Costela Assada",
      description: "Costela suculenta assada lentamente com temperos especiais",
      featured_image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop",
      total_time: 180,
      difficulty: "Difícil",
      avg_rating: 4.7,
      author_name: "Chef Rodrigo",
      category_name: "Carnes",
      is_featured: false,
      status: "published"
    },
    {
      id: 4,
      title: "Spaghetti Carbonara",
      description: "Clássico italiano com ovos, queijo e pancetta",
      featured_image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop",
      total_time: 20,
      difficulty: "Fácil",
      avg_rating: 4.6,
      author_name: "Chef Rodrigo",
      category_name: "Massas",
      is_featured: true,
      status: "published"
    },
    {
      id: 5,
      title: "Lasanha Bolonhesa",
      description: "Camadas de massa, molho bolonhesa e queijo derretido",
      featured_image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400&h=300&fit=crop",
      total_time: 90,
      difficulty: "Médio",
      avg_rating: 4.8,
      author_name: "Chef Rodrigo",
      category_name: "Massas",
      is_featured: false,
      status: "published"
    },
    {
      id: 6,
      title: "Salmão Grelhado",
      description: "Salmão fresco grelhado com ervas e limão",
      featured_image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop",
      total_time: 15,
      difficulty: "Fácil",
      avg_rating: 4.7,
      author_name: "Chef Rodrigo",
      category_name: "Frutos do Mar",
      is_featured: true,
      status: "published"
    }
  ]

  // Buscar receitas
  const fetchRecipes = async (offset = 0, reset = false) => {
    try {
      console.log('fetchRecipes called with:', { offset, reset, category, featured })
      setLoading(true)
      setError(null)

      let result
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 2000)
      )
      
      try {
        if (featured) {
          // Buscar receitas em destaque
          result = await Promise.race([
            recipes.getPublished(limit, offset),
            timeoutPromise
          ])
          if (result.data) {
            result.data = result.data.filter(recipe => recipe.is_featured)
          }
        } else if (category) {
          // Buscar por categoria
          result = await Promise.race([
            recipes.getByCategory(category, limit, offset),
            timeoutPromise
          ])
        } else {
          // Buscar todas as receitas
          result = await Promise.race([
            recipes.getPublished(limit, offset),
            timeoutPromise
          ])
        }
      } catch (apiError) {
        console.log('API call timed out or failed, using mock data')
        throw apiError
      }

      if (result.error) {
        console.log('API failed, using mock data for recipes', { filteredCount: mockRecipes.length })
        let filteredMockRecipes = mockRecipes
        
        if (featured) {
          filteredMockRecipes = mockRecipes.filter(recipe => recipe.is_featured)
        } else if (category) {
          filteredMockRecipes = mockRecipes.filter(recipe => 
            recipe.category_name?.toLowerCase() === category?.toLowerCase()
          )
        }
        
        console.log('Setting mock data:', { count: filteredMockRecipes.length, loading: false })
        setData(filteredMockRecipes)
        setHasMore(false)
        setLoading(false)
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
      console.log('API failed (catch), using mock data for recipes', { error: err.message })
      let filteredMockRecipes = mockRecipes
      
      if (featured) {
        filteredMockRecipes = mockRecipes.filter(recipe => recipe.is_featured)
      } else if (category) {
        filteredMockRecipes = mockRecipes.filter(recipe => 
          recipe.category_name?.toLowerCase() === category?.toLowerCase()
        )
      }
      
      console.log('Setting mock data (catch):', { count: filteredMockRecipes.length, loading: false })
      setData(filteredMockRecipes)
      setHasMore(false)
      setError(err)
      setLoading(false)
    } finally {
      console.log('fetchRecipes finally block - setting loading to false')
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
        console.log('useRecipe fetchRecipe called with slug:', slug)
        setLoading(true)
        setError(null)

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('API timeout')), 2000)
        )

        let result
        try {
          result = await Promise.race([
            recipes.getBySlug(slug),
            timeoutPromise
          ])
        } catch (apiError) {
          console.log('useRecipe API call timed out, using mock data')
          throw apiError
        }
        
        if (result.error) {
          console.log('useRecipe API failed, using mock data for recipe:', slug)
          const mockRecipe = mockRecipes.find(r => 
            r.slug === slug || generateSlug(r.title) === slug
          )
          if (mockRecipe) {
            console.log('Found mock recipe:', mockRecipe.title)
            setRecipe(mockRecipe)
          } else {
            console.log('No mock recipe found for slug:', slug)
            setError(result.error)
          }
          return
        }

        setRecipe(result.data)

      } catch (err) {
        console.log('useRecipe catch block, using mock data for recipe:', slug)
        const mockRecipe = mockRecipes.find(r => 
          r.slug === slug || generateSlug(r.title) === slug
        )
        if (mockRecipe) {
          console.log('Found mock recipe in catch:', mockRecipe.title)
          setRecipe(mockRecipe)
        } else {
          console.log('No mock recipe found in catch for slug:', slug)
          setError(err)
        }
      } finally {
        console.log('useRecipe finally block - setting loading to false')
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


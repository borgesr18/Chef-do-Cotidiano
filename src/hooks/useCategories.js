import { useState, useEffect } from 'react'
import { categories } from '../lib/supabase'

export const useCategories = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Buscar todas as categorias
  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await categories.getAll()
      
      if (result.error) {
        setError(result.error)
        return
      }

      setData(result.data || [])

    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Buscar categoria por slug
  const getCategoryBySlug = async (slug) => {
    try {
      const result = await categories.getBySlug(slug)
      
      if (result.error) {
        return null
      }

      return result.data

    } catch (err) {
      return null
    }
  }

  // Carregar categorias automaticamente
  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories: data,
    loading,
    error,
    fetchCategories,
    getCategoryBySlug
  }
}

export default useCategories


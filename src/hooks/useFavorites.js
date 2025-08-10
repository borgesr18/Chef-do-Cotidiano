import { useState, useEffect } from 'react'
import { favorites } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useFavorites = () => {
  const [userFavorites, setUserFavorites] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isAuthenticated } = useAuth()

  // Carregar favoritos do usuário
  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setUserFavorites([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const result = await favorites.getUserFavorites()
      
      if (result.error) {
        setError(result.error)
        return
      }

      setUserFavorites(result.data || [])

    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  // Verificar se receita está nos favoritos
  const isFavorite = (recipeId) => {
    return userFavorites.some(fav => fav.recipe_id === recipeId)
  }

  // Adicionar receita aos favoritos
  const addFavorite = async (recipeId) => {
    if (!isAuthenticated) {
      setError('Usuário não autenticado')
      return false
    }

    try {
      setError(null)

      const result = await favorites.add(recipeId)
      
      if (result.error) {
        setError(result.error)
        return false
      }

      // Atualizar lista local
      await loadFavorites()
      return true

    } catch (err) {
      setError(err)
      return false
    }
  }

  // Remover receita dos favoritos
  const removeFavorite = async (recipeId) => {
    if (!isAuthenticated) {
      setError('Usuário não autenticado')
      return false
    }

    try {
      setError(null)

      const result = await favorites.remove(recipeId)
      
      if (result.error) {
        setError(result.error)
        return false
      }

      // Atualizar lista local
      setUserFavorites(prev => prev.filter(fav => fav.recipe_id !== recipeId))
      return true

    } catch (err) {
      setError(err)
      return false
    }
  }

  // Toggle favorito
  const toggleFavorite = async (recipeId) => {
    if (isFavorite(recipeId)) {
      return await removeFavorite(recipeId)
    } else {
      return await addFavorite(recipeId)
    }
  }

  // Carregar favoritos quando usuário fizer login
  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites()
    } else {
      setUserFavorites([])
    }
  }, [isAuthenticated])

  return {
    favorites: userFavorites,
    loading,
    error,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    loadFavorites
  }
}

export default useFavorites


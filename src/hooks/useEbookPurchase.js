import { useState } from 'react'
import { ebookPurchases } from '../lib/supabase'

export const useEbookPurchase = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createPurchase = async (ebookId, paymentData) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await ebookPurchases.purchase(ebookId, paymentData)
      if (error) throw new Error(error.message || error)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getUserPurchases = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await ebookPurchases.getByUser()
      if (error) throw new Error(error.message || error)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const hasPurchased = async (ebookId) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await ebookPurchases.hasPurchased(ebookId)
      if (error) throw new Error(error.message || error)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, createPurchase, getUserPurchases, hasPurchased }
}

export default useEbookPurchase
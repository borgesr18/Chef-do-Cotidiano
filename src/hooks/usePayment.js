import { useState } from 'react'
import { supabase } from '../lib/supabase'

export const usePayment = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createEnrollment = async (courseId, paymentData) => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('course_enrollments')
        .insert([{ user_id: user.id, course_id: courseId }])
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async (enrollmentId, status, transactionId) => {
    try {
      setLoading(true)
      setError(null)

      // Placeholder: tabela de pagamentos não existe no schema atual; ajuste quando implementar.
      const { data, error } = await supabase
        .from('course_enrollments')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', enrollmentId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const getUserEnrollments = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          courses(title, slug, featured_image, price)
        `)
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createEnrollment,
    updatePaymentStatus,
    getUserEnrollments
  }
}

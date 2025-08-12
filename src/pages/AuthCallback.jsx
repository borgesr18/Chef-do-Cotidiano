import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth callback error:', error)
          navigate('/')
          return
        }

        if (data.session) {
          // Verifica se é admin e redireciona
          const userId = data.session.user.id
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          if (profile?.role === 'admin' || profile?.role === 'super_admin') {
            navigate('/admin', { replace: true })
            return
          }
          navigate('/')
        } else {
          navigate('/')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        navigate('/')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto" role="status" aria-label="Processando"></div>
        <p className="mt-4 text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  )
}

import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Erro ao obter sessão:', error)
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        }
      } catch (error) {
        console.error('Erro ao inicializar auth:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadUserProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Carregar perfil do usuário
  const loadUserProfile = async (userId) => {
    console.log('loadUserProfile called for userId:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      console.log('Profile query result:', { data, error })

      if (error) {
        console.error('Erro ao carregar perfil:', error)
        setProfile(null)
        return
      }

      if (!data) {
        console.log('Profile not found, creating new profile...')
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: userId,
              full_name: user?.user_metadata?.full_name || '',
              avatar_url: user?.user_metadata?.avatar_url || '',
              role: 'user'
            }
          ])
          .select()
          .single()

        console.log('Profile creation result:', { newProfile, createError })

        if (createError) {
          console.error('Erro ao criar perfil:', createError)
          setProfile(null)
          return
        }

        setProfile(newProfile)
        return
      }

      // Garante que role exista no perfil
      if (!data.role) {
        const { data: updated, error: updateError } = await supabase
          .from('profiles')
          .update({ role: 'user' })
          .eq('id', userId)
          .select()
          .single()
        if (!updateError && updated) {
          setProfile(updated)
          return
        }
      }

      console.log('Profile loaded successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('Erro ao carregar perfil:', error)
      setProfile(null)
    }
  }

  // Função de login
  const signIn = async (email, password) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (!error && data.user) {
        // Aguarda carregar o perfil e redireciona se for admin
        await loadUserProfile(data.user.id)
        const currentProfile = profile || (await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        ).data
        if (currentProfile?.role === 'admin' || currentProfile?.role === 'super_admin') {
          navigate('/admin', { replace: true })
        }
      }
      
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  // Função de registro
  const signUp = async (email, password, userData = {}) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  // Função de login com OAuth
  const signInWithOAuth = async (provider) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      return { data, error }
    } finally {
      setLoading(false)
    }
  }

  // Função de logout
  const signOut = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (!error) {
        setUser(null)
        setProfile(null)
        setSession(null)
      }
      return { error }
    } finally {
      setLoading(false)
    }
  }

  // Função para resetar senha
  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  }

  // Função para atualizar senha
  const updatePassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  }

  // Função para atualizar perfil
  const updateProfile = async (profileData) => {
    if (!user) return { data: null, error: 'Usuário não autenticado' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select()
        .single()

      if (!error) {
        setProfile(data)
      }

      return { data, error }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Verificar se usuário tem permissão
  const hasPermission = (requiredRole) => {
    if (!profile) return false
    
    const roleHierarchy = {
      'user': 1,
      'chef': 2,
      'admin': 3,
      'super_admin': 4
    }

    const userLevel = roleHierarchy[profile.role] || 0
    const requiredLevel = roleHierarchy[requiredRole] || 0

    return userLevel >= requiredLevel
  }

  // Verificar se usuário é admin
  const isAdmin = () => {
    return hasPermission('admin')
  }

  // Verificar se usuário é chef
  const isChef = () => {
    return hasPermission('chef')
  }

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    hasPermission,
    isAdmin,
    isChef,
    // Estados úteis
    isAuthenticated: !!user,
    isLoading: loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext


import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
// Em produção, essas variáveis devem vir do arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Funções auxiliares para autenticação
export const auth = {
  // Registrar novo usuário
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  },

  // Login
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Login com OAuth (Google, GitHub, etc.)
  signInWithOAuth: async (provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  },

  // Logout
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Obter usuário atual
  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    return { user, error }
  },

  // Obter sessão atual
  getCurrentSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  },

  // Resetar senha
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    return { data, error }
  },

  // Atualizar senha
  updatePassword: async (password) => {
    const { data, error } = await supabase.auth.updateUser({
      password
    })
    return { data, error }
  }
}

// Funções para gerenciar receitas
export const recipes = {
  // Buscar todas as receitas publicadas
  getPublished: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  // Buscar receita por slug
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url,
          bio
        ),
        categories (
          name,
          slug
        ),
        recipe_ingredients (
          *,
          ingredients (
            name,
            unit
          )
        ),
        recipe_instructions (
          *
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    
    return { data, error }
  },

  // Buscar receitas por categoria
  getByCategory: async (categorySlug, limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories!inner (
          name,
          slug
        )
      `)
      .eq('categories.slug', categorySlug)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  // Buscar receitas (com filtros)
  search: async (query, filters = {}) => {
    let queryBuilder = supabase
      .from('recipes')
      .select(`
        *,
        profiles:author_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `)
      .eq('status', 'published')

    // Busca por texto
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    }

    // Filtro por categoria
    if (filters.category) {
      queryBuilder = queryBuilder.eq('categories.slug', filters.category)
    }

    // Filtro por dificuldade
    if (filters.difficulty) {
      queryBuilder = queryBuilder.eq('difficulty', filters.difficulty)
    }

    // Filtro por tempo de preparo
    if (filters.maxTime) {
      queryBuilder = queryBuilder.lte('total_time', filters.maxTime)
    }

    const { data, error } = await queryBuilder
      .order('created_at', { ascending: false })
      .limit(20)

    return { data, error }
  },

  // Criar nova receita (apenas para usuários autenticados)
  create: async (recipeData) => {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipeData])
      .select()
      .single()
    
    return { data, error }
  },

  // Atualizar receita
  update: async (id, recipeData) => {
    const { data, error } = await supabase
      .from('recipes')
      .update(recipeData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Deletar receita
  delete: async (id) => {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// Funções para gerenciar categorias
export const categories = {
  // Buscar todas as categorias
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    return { data, error }
  },

  // Buscar categoria por slug
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()
    
    return { data, error }
  }
}

// Funções para gerenciar perfis de usuário
export const profiles = {
  // Buscar perfil do usuário atual
  getCurrent: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Usuário não autenticado' }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    return { data, error }
  },

  // Atualizar perfil
  update: async (profileData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Usuário não autenticado' }

    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', user.id)
      .select()
      .single()
    
    return { data, error }
  }
}

// Funções para gerenciar favoritos
export const favorites = {
  // Adicionar receita aos favoritos
  add: async (recipeId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: 'Usuário não autenticado' }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert([{ user_id: user.id, recipe_id: recipeId }])
      .select()
      .single()
    
    return { data, error }
  },

  // Remover receita dos favoritos
  remove: async (recipeId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Usuário não autenticado' }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
    
    return { error }
  },

  // Verificar se receita está nos favoritos
  check: async (recipeId) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: false, error: null }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .single()
    
    return { data: !!data, error }
  },

  // Buscar receitas favoritas do usuário
  getUserFavorites: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], error: 'Usuário não autenticado' }

    const { data, error } = await supabase
      .from('user_favorites')
      .select(`
        *,
        recipes (
          *,
          profiles:author_id (
            full_name,
            avatar_url
          ),
          categories (
            name,
            slug
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    return { data, error }
  }
}

// Funções para upload de arquivos
export const storage = {
  // Upload de imagem
  uploadImage: async (file, bucket = 'recipe-images', path = '') => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file)

    if (error) return { data: null, error }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath)

    return { data: { path: filePath, publicUrl }, error: null }
  },

  // Deletar arquivo
  deleteFile: async (path, bucket = 'recipe-images') => {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    return { error }
  },

  // Obter URL pública
  getPublicUrl: (path, bucket = 'recipe-images') => {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)

    return publicUrl
  }
}

export default supabase


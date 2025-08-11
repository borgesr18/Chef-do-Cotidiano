import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
// Em produção, essas variáveis devem vir do arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDA5OTUyMDAsImV4cCI6MTk1NjU3MTIwMH0.placeholder'

// Warn if env vars are missing to avoid confusing 403s due to placeholder credentials
if (
  typeof window !== 'undefined' &&
  (supabaseUrl.includes('placeholder') || supabaseAnonKey.endsWith('.placeholder'))
) {
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Using placeholders will cause 403 errors. Configure your .env with valid project credentials.'
  )
}

// Criar cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      Accept: 'application/json'
    }
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
        categories!inner (
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

  // Buscar receita por ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        profiles:author_id(full_name, avatar_url),
        categories(name, slug)
      `)
      .eq('id', id)
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
  },

  // Buscar todas as receitas para admin (incluindo drafts)
  getAllForAdmin: async (limit = 50, offset = 0) => {
    try {
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
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching recipes for admin:', error)
      return { data: [], error }
    }
  },

  getAll: async (limit = 50, offset = 0) => {
    return recipes.getAllForAdmin(limit, offset)
  }
}

// Funções para gerenciar categorias
export const categories = {
  // Buscar todas as categorias (apenas ativas - para uso público)
  getAll: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
    
    return { data, error }
  },

  // Buscar todas as categorias (incluindo inativas - para admin)
  getAllForAdmin: async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true })
      
      if (error) throw error
      return { data: data || [], error: null }
    } catch (error) {
      console.error('Error fetching categories for admin:', error)
      return { data: [], error }
    }
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
  },

  // Criar nova categoria
  create: async (categoryData) => {
    const { data, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single()
    
    return { data, error }
  },

  // Atualizar categoria
  update: async (id, categoryData) => {
    const { data, error } = await supabase
      .from('categories')
      .update(categoryData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Deletar categoria
  delete: async (id) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    return { error }
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
export const userFavorites = {
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

// Funções para gerenciar cursos
export const courses = {
  // Buscar todos os cursos
  getAll: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles:instructor_id (
          full_name,
          avatar_url
        ),
        categories (
          name,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  // Buscar cursos publicados
  getPublished: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles:instructor_id (
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

  // Buscar curso por slug
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles:instructor_id (
          full_name,
          avatar_url,
          bio
        ),
        categories (
          name,
          slug
        ),
        course_modules (
          *,
          course_lessons (
            *
          )
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    
    return { data, error }
  },

  // Criar curso
  create: async (courseData) => {
    const { data, error } = await supabase
      .from('courses')
      .insert([courseData])
      .select()
      .single()
    
    return { data, error }
  },

  // Buscar curso por ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        profiles:instructor_id(full_name, avatar_url),
        categories(name, slug)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Atualizar curso
  update: async (id, courseData) => {
    const { data, error } = await supabase
      .from('courses')
      .update(courseData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Deletar curso
  delete: async (id) => {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// Funções para gerenciar módulos de curso
export const courseModules = {
  // Buscar módulos por curso
  getByCourse: async (courseId) => {
    const { data, error } = await supabase
      .from('course_modules')
      .select(`
        *,
        course_lessons (
          *
        )
      `)
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true })
    
    return { data, error }
  },

  create: async (moduleData) => {
    const { data, error } = await supabase
      .from('course_modules')
      .insert([moduleData])
      .select()
      .single()
    
    return { data, error }
  },

  // Atualizar módulo
  update: async (id, moduleData) => {
    const { data, error } = await supabase
      .from('course_modules')
      .update(moduleData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Deletar módulo
  delete: async (id) => {
    const { error } = await supabase
      .from('course_modules')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// Funções para gerenciar aulas
export const courseLessons = {
  // Buscar aulas por módulo
  getByModule: async (moduleId) => {
    const { data, error } = await supabase
      .from('course_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('sort_order', { ascending: true })
    
    return { data, error }
  },

  create: async (lessonData) => {
    const { data, error } = await supabase
      .from('course_lessons')
      .insert([lessonData])
      .select()
      .single()
    
    return { data, error }
  },

  // Atualizar aula
  update: async (id, lessonData) => {
    const { data, error } = await supabase
      .from('course_lessons')
      .update(lessonData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Deletar aula
  delete: async (id) => {
    const { error } = await supabase
      .from('course_lessons')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// Funções para gerenciar matrículas
export const courseEnrollments = {
  // Buscar matrículas por curso
  getByCourse: async (courseId) => {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        profiles (
          full_name,
          avatar_url,
          email
        )
      `)
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false })
    
    return { data, error }
  },

  enroll: async (courseId, userId) => {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert([{ course_id: courseId, user_id: userId }])
      .select()
      .single()
    
    return { data, error }
  },

  // Verificar se usuário está matriculado
  checkEnrollment: async (courseId, userId) => {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('user_id', userId)
      .single()
    
    return { data: !!data, error }
  }
}

// Funções para gerenciar posts do blog
export const blogPosts = {
  // Buscar todos os posts
  getAll: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('blog_posts')
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
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  // Buscar posts publicados
  getPublished: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('blog_posts')
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
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  // Buscar post por slug
  getBySlug: async (slug) => {
    const { data, error } = await supabase
      .from('blog_posts')
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
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    
    return { data, error }
  },

  create: async (postData) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([postData])
      .select()
      .single()
    
    return { data, error }
  },

  // Buscar post por ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        profiles:author_id(full_name, avatar_url),
        categories(name, slug)
      `)
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Atualizar post
  update: async (id, postData) => {
    const { data, error } = await supabase
      .from('blog_posts')
      .update(postData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Deletar post
  delete: async (id) => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

// Funções para gerenciar usuários (admin)
export const users = {
  // Buscar todos os usuários
  getAll: async (limit = 10, offset = 0) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    return { data, error }
  },

  // Buscar usuário por ID
  getById: async (id) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    return { data, error }
  },

  // Atualizar role do usuário
  updateRole: async (userId, role) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  },

  // Atualizar perfil do usuário
  updateProfile: async (userId, profileData) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select()
      .single()
    
    return { data, error }
  }
}

// Funções para analytics
export const analytics = {
  // Buscar estatísticas do dashboard
  getDashboardStats: async () => {
    try {
      const [recipesResult, usersResult, coursesResult, viewsResult] = await Promise.all([
        supabase.from('recipes').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }),
        supabase.from('recipe_analytics').select('views')
      ])

      const totalViews = viewsResult.data?.reduce((sum, item) => sum + (item.views || 0), 0) || 0

      return {
        data: {
          totalRecipes: recipesResult.count || 0,
          totalUsers: usersResult.count || 0,
          totalCourses: coursesResult.count || 0,
          totalViews: totalViews
        },
        error: null
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
      return {
        data: {
          totalRecipes: 0,
          totalUsers: 0,
          totalCourses: 0,
          totalViews: 0
        },
        error: null
      }
    }
  },

  // Registrar visualização de receita
  recordRecipeView: async (recipeId, userId = null) => {
    const { data, error } = await supabase
      .from('recipe_analytics')
      .insert([{
        recipe_id: recipeId,
        user_id: userId,
        event_type: 'view'
      }])
    
    return { data, error }
  },

  // Registrar like em receita
  recordRecipeLike: async (recipeId, userId) => {
    const { data, error } = await supabase
      .from('recipe_analytics')
      .insert([{
        recipe_id: recipeId,
        user_id: userId,
        event_type: 'like'
      }])
    
    return { data, error }
  },

  // Buscar receitas mais populares
  getPopularRecipes: async (limit = 10) => {
    const { data, error } = await supabase
      .from('recipe_analytics')
      .select(`
        recipe_id,
        recipes (
          title,
          slug,
          image_url
        )
      `)
      .eq('event_type', 'view')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    return { data, error }
  }
}

// Funções para ingredientes
export const ingredients = {
  // Buscar todos os ingredientes
  getAll: async () => {
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .order('name', { ascending: true })
    
    return { data, error }
  },

  create: async (ingredientData) => {
    const { data, error } = await supabase
      .from('ingredients')
      .insert([ingredientData])
      .select()
      .single()
    
    return { data, error }
  },

  // Atualizar ingrediente
  update: async (id, ingredientData) => {
    const { data, error } = await supabase
      .from('ingredients')
      .update(ingredientData)
      .eq('id', id)
      .select()
      .single()
    
    return { data, error }
  },

  // Deletar ingrediente
  delete: async (id) => {
    const { error } = await supabase
      .from('ingredients')
      .delete()
      .eq('id', id)
    
    return { error }
  }
}

export const settings = {
  // Buscar todas as configurações
  getAll: async () => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
    
    return { data, error }
  },

  // Buscar configuração por chave
  get: async (key) => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', key)
      .single()
    
    return { data, error }
  },

  set: async (key, value, type = 'string') => {
    const { data, error } = await supabase
      .from('settings')
      .upsert([{ key, value, type }])
      .select()
      .single()
    
    return { data, error }
  },

  // Deletar configuração
  delete: async (key) => {
    const { data, error } = await supabase
      .from('settings')
      .delete()
      .eq('key', key)
    
    return { data, error }
  }
}


export default supabase


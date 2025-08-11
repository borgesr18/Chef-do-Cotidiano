-- =====================================================
-- CHEF DO COTIDIANO AI - ESTRUTURA DO BANCO DE DADOS
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUMS
-- =====================================================

-- Roles de usuário
CREATE TYPE user_role AS ENUM ('user', 'chef', 'admin', 'super_admin');

-- Status de receitas
CREATE TYPE recipe_status AS ENUM ('draft', 'published', 'archived');

-- Níveis de dificuldade
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Status de cursos
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');

-- Níveis de cursos
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');

-- Status de posts do blog
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Tipos de notificação
CREATE TYPE notification_type AS ENUM (
  'recipe_liked', 'recipe_commented', 'course_enrolled', 
  'new_follower', 'system_update', 'admin_message'
);

-- Eventos de analytics
CREATE TYPE analytics_event AS ENUM (
  'view', 'like', 'share', 'print', 'save', 'comment', 'rate'
);

-- Ações de auditoria
CREATE TYPE audit_action AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- =====================================================
-- TABELAS PRINCIPAIS
-- =====================================================

-- Perfis de usuário (estende auth.users do Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorias
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ingredientes
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  unit VARCHAR(20),
  nutrition_info JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Receitas
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  featured_image TEXT,
  prep_time INTEGER,
  cook_time INTEGER,
  total_time INTEGER GENERATED ALWAYS AS (COALESCE(prep_time, 0) + COALESCE(cook_time, 0)) STORED,
  servings INTEGER DEFAULT 1,
  difficulty difficulty_level DEFAULT 'medium',
  status recipe_status DEFAULT 'draft',
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  nutrition_info JSONB DEFAULT '{}',
  equipment TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  seo_title VARCHAR(60),
  seo_description VARCHAR(160),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Ingredientes das receitas
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id),
  quantity DECIMAL(10,2),
  unit VARCHAR(20),
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instruções das receitas
CREATE TABLE recipe_instructions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  instruction TEXT NOT NULL,
  image_url TEXT,
  time_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Avaliações das receitas
CREATE TABLE recipe_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(recipe_id, user_id)
);

-- Favoritos dos usuários
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- Comentários nas receitas
CREATE TABLE recipe_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES recipe_comments(id),
  content TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listas de receitas dos usuários
CREATE TABLE recipe_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE recipe_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES recipe_lists(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  notes TEXT,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(list_id, recipe_id)
);

-- Cursos
CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  featured_image TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  level course_level DEFAULT 'beginner',
  duration_hours INTEGER,
  status course_status DEFAULT 'draft',
  instructor_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id),
  is_featured BOOLEAN DEFAULT false,
  enrollment_count INTEGER DEFAULT 0,
  seo_title VARCHAR(60),
  seo_description VARCHAR(160),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Módulos dos cursos
CREATE TABLE course_modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aulas dos módulos
CREATE TABLE course_lessons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT,
  video_url TEXT,
  duration_minutes INTEGER,
  sort_order INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matrículas nos cursos
CREATE TABLE course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  UNIQUE(course_id, user_id)
);

-- Progresso das aulas
CREATE TABLE lesson_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  watch_time_seconds INTEGER DEFAULT 0,
  UNIQUE(enrollment_id, lesson_id)
);

-- Posts do blog
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  status post_status DEFAULT 'draft',
  author_id UUID REFERENCES profiles(id),
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  seo_title VARCHAR(60),
  seo_description VARCHAR(160),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Notificações
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Analytics de receitas
CREATE TABLE recipe_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  event_type analytics_event NOT NULL,
  session_id VARCHAR(100),
  user_agent TEXT,
  ip_address INET,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Logs de auditoria
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action audit_action NOT NULL,
  old_data JSONB,
  new_data JSONB,
  user_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES
-- =====================================================

-- Índices para performance
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_author ON recipes(author_id);
CREATE INDEX idx_recipes_category ON recipes(category_id);
CREATE INDEX idx_recipes_published_at ON recipes(published_at DESC);
CREATE INDEX idx_recipes_featured ON recipes(is_featured) WHERE is_featured = true;
CREATE INDEX idx_recipes_slug ON recipes(slug);

-- Índices para busca full-text
CREATE INDEX idx_recipes_search ON recipes USING gin(to_tsvector('portuguese', title || ' ' || description));
CREATE INDEX idx_blog_posts_search ON blog_posts USING gin(to_tsvector('portuguese', title || ' ' || excerpt));

-- Índices para relacionamentos
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_instructions_recipe ON recipe_instructions(recipe_id);
CREATE INDEX idx_recipe_comments_recipe ON recipe_comments(recipe_id);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_recipe_analytics_recipe ON recipe_analytics(recipe_id);

-- =====================================================
-- VIEWS
-- =====================================================

-- View de receitas com estatísticas
CREATE VIEW recipes_with_stats AS
SELECT 
  r.*,
  COALESCE(AVG(rt.rating), 0) as avg_rating,
  COUNT(rt.id) as rating_count,
  COUNT(DISTINCT rf.user_id) as favorite_count,
  COUNT(DISTINCT rc.id) as comment_count,
  c.name as category_name,
  c.slug as category_slug,
  p.full_name as author_name,
  p.avatar_url as author_avatar
FROM recipes r
LEFT JOIN recipe_ratings rt ON r.id = rt.recipe_id
LEFT JOIN user_favorites rf ON r.id = rf.recipe_id
LEFT JOIN recipe_comments rc ON r.id = rc.recipe_id AND rc.is_approved = true
LEFT JOIN categories c ON r.category_id = c.id
LEFT JOIN profiles p ON r.author_id = p.id
GROUP BY r.id, c.name, c.slug, p.full_name, p.avatar_url;

-- View de receitas populares
CREATE VIEW popular_recipes AS
SELECT *
FROM recipes_with_stats
WHERE status = 'published'
ORDER BY (view_count * 0.3 + like_count * 0.4 + rating_count * 0.3) DESC;

-- =====================================================
-- FUNÇÕES
-- =====================================================

-- Função para busca full-text de receitas
CREATE OR REPLACE FUNCTION search_recipes(search_term TEXT)
RETURNS TABLE (
  id UUID,
  title TEXT,
  description TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.title,
    r.description,
    ts_rank(
      to_tsvector('portuguese', r.title || ' ' || r.description || ' ' || COALESCE(r.content, '')),
      plainto_tsquery('portuguese', search_term)
    ) as rank
  FROM recipes r
  WHERE 
    r.status = 'published' AND
    to_tsvector('portuguese', r.title || ' ' || r.description || ' ' || COALESCE(r.content, '')) 
    @@ plainto_tsquery('portuguese', search_term)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver perfis públicos" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Usuários podem criar próprio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para receitas
CREATE POLICY "Todos podem ver receitas publicadas" ON recipes
  FOR SELECT USING (status = 'published');

CREATE POLICY "Autores podem ver suas próprias receitas" ON recipes
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Autores podem atualizar suas receitas" ON recipes
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Chefs e admins podem criar receitas" ON recipes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('chef', 'admin', 'super_admin')
    )
  );

-- Políticas para comentários
CREATE POLICY "Todos podem ver comentários aprovados" ON recipe_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Usuários autenticados podem comentar" ON recipe_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem editar próprios comentários" ON recipe_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para favoritos
CREATE POLICY "Usuários podem ver próprios favoritos" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem gerenciar favoritos" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para matrículas
CREATE POLICY "Usuários podem ver próprias matrículas" ON course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem se matricular" ON course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para notificações
CREATE POLICY "Usuários podem ver próprias notificações" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprias notificações" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Carnes', 'carnes', 'Receitas com carnes vermelhas e aves', 1),
('Massas', 'massas', 'Pratos de massa italiana e brasileira', 2),
('Churrasco', 'churrasco', 'Técnicas e receitas para churrasco', 3),
('Frutos do Mar', 'frutos-do-mar', 'Peixes, camarões e frutos do mar', 4),
('Bebidas', 'bebidas', 'Drinks, sucos e bebidas especiais', 5),
('Sobremesas', 'sobremesas', 'Doces e sobremesas masculinas', 6);

-- Inserir ingredientes básicos
INSERT INTO ingredients (name, category, unit) VALUES
('Carne bovina', 'proteína', 'kg'),
('Frango', 'proteína', 'kg'),
('Camarão', 'proteína', 'kg'),
('Massa de lasanha', 'carboidrato', 'pacote'),
('Tomate', 'vegetal', 'kg'),
('Cebola', 'vegetal', 'kg'),
('Alho', 'tempero', 'cabeça'),
('Sal', 'tempero', 'kg'),
('Pimenta-do-reino', 'tempero', 'g'),
('Azeite', 'gordura', 'ml');

-- =====================================================
-- COMENTÁRIOS FINAIS
-- =====================================================

-- Este schema foi projetado para:
-- 1. Suportar um sistema completo de receitas culinárias
-- 2. Incluir sistema de usuários com diferentes roles
-- 3. Permitir cursos online e blog
-- 4. Ter analytics e auditoria completos
-- 5. Ser escalável e performático
-- 6. Seguir as melhores práticas do PostgreSQL e Supabase


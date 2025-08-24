
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ebook_purchases ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

DROP POLICY IF EXISTS "Usuários podem criar próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuários podem ver perfis públicos" ON profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar próprio perfil" ON profiles;
DROP POLICY IF EXISTS "Admins podem gerenciar categorias" ON categories;
DROP POLICY IF EXISTS "Admins podem gerenciar receitas" ON recipes;
DROP POLICY IF EXISTS "Admins podem gerenciar cursos" ON courses;
DROP POLICY IF EXISTS "Admins podem gerenciar posts do blog" ON blog_posts;

CREATE POLICY "Users can view public profiles" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all categories" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view published recipes" ON recipes
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view own recipes" ON recipes
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all recipes" ON recipes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Chefs and admins can create recipes" ON recipes
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('chef', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Authors can update own recipes" ON recipes
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can update all recipes" ON recipes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Authors can delete own recipes" ON recipes
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Admins can delete all recipes" ON recipes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view published courses" ON courses
  FOR SELECT USING (status = 'published');

CREATE POLICY "Instructors can view own courses" ON courses
  FOR SELECT USING (auth.uid() = instructor_id);

CREATE POLICY "Admins can view all courses" ON courses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Chefs and admins can create courses" ON courses
  FOR INSERT WITH CHECK (
    auth.uid() = instructor_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('chef', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Instructors can update own courses" ON courses
  FOR UPDATE USING (auth.uid() = instructor_id);

CREATE POLICY "Admins can update all courses" ON courses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view published posts" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authors can view own posts" ON blog_posts
  FOR SELECT USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all posts" ON blog_posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Chefs and admins can create posts" ON blog_posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('chef', 'admin', 'super_admin')
    )
  );

CREATE POLICY "Authors can update own posts" ON blog_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can update all posts" ON blog_posts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view published course modules" ON course_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_modules.course_id 
      AND courses.status = 'published'
    )
  );

CREATE POLICY "Course instructors can manage modules" ON course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM courses 
      WHERE courses.id = course_modules.course_id 
      AND courses.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all modules" ON course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Everyone can view published course lessons" ON course_lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM course_modules cm
      JOIN courses c ON c.id = cm.course_id
      WHERE cm.id = course_lessons.module_id 
      AND c.status = 'published'
    )
  );

CREATE POLICY "Course instructors can manage lessons" ON course_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM course_modules cm
      JOIN courses c ON c.id = cm.course_id
      WHERE cm.id = course_lessons.module_id 
      AND c.instructor_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all lessons" ON course_lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Users can view approved comments" ON recipe_comments
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can create comments" ON recipe_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON recipe_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own enrollments" ON course_enrollments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create enrollments" ON course_enrollments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

INSERT INTO settings (key, value, type) VALUES 
('siteName', 'Chef do Cotidiano', 'string'),
('siteDescription', 'Receitas deliciosas para o seu dia a dia', 'string'),
('siteUrl', 'https://chefdocotidiano.com', 'string'),
('primaryColor', '#3B82F6', 'string'),
('secondaryColor', '#10B981', 'string'),
('enableRegistration', 'true', 'boolean'),
('enableComments', 'true', 'boolean'),
('enableNewsletter', 'true', 'boolean')
ON CONFLICT (key) DO NOTHING;

SELECT 'Enhanced RLS policies applied successfully!' as message;

CREATE POLICY IF NOT EXISTS "Everyone can view published ebooks" ON ebooks
  FOR SELECT USING (status = 'published');

CREATE POLICY IF NOT EXISTS "Authors can manage own ebooks" ON ebooks
  FOR ALL USING (
    auth.uid() = author_id OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY IF NOT EXISTS "Users can view own ebook purchases" ON ebook_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create ebook purchases" ON ebook_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

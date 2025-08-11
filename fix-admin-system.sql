
CREATE POLICY "Usuários podem criar próprio perfil" 
ON profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins podem gerenciar categorias" 
ON categories 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins podem gerenciar receitas" 
ON recipes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin', 'chef')
  )
);

CREATE POLICY "Admins podem gerenciar cursos" 
ON courses 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin', 'chef')
  )
);

CREATE POLICY "Admins podem gerenciar posts do blog" 
ON blog_posts 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'super_admin', 'chef')
  )
);

INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active) VALUES 
('Pratos Principais', 'pratos-principais', 'Receitas para refeições completas e nutritivas', '🍽️', '#3B82F6', 1, true),
('Sobremesas', 'sobremesas', 'Doces e sobremesas deliciosas', '🍰', '#F59E0B', 2, true),
('Lanches', 'lanches', 'Opções rápidas e práticas', '🥪', '#10B981', 3, true),
('Bebidas', 'bebidas', 'Drinks e bebidas refrescantes', '🥤', '#8B5CF6', 4, true),
('Saladas', 'saladas', 'Opções saudáveis e nutritivas', '🥗', '#059669', 5, true),
('Massas', 'massas', 'Pratos com massas variadas', '🍝', '#EF4444', 6, true),
('Carnes', 'carnes', 'Pratos com carnes vermelhas e brancas', '🥩', '#DC2626', 7, true),
('Peixes', 'peixes', 'Receitas com frutos do mar', '🐟', '#0EA5E9', 8, true);

INSERT INTO ingredients (name, category, unit) VALUES 
('Arroz', 'grãos', 'xícara'),
('Feijão', 'grãos', 'xícara'),
('Carne bovina', 'proteína', 'kg'),
('Frango', 'proteína', 'kg'),
('Tomate', 'vegetal', 'unidade'),
('Cebola', 'vegetal', 'unidade'),
('Alho', 'tempero', 'dente'),
('Sal', 'tempero', 'colher de chá'),
('Óleo', 'gordura', 'colher de sopa'),
('Açúcar', 'doce', 'xícara'),
('Farinha de trigo', 'farinha', 'xícara'),
('Ovos', 'proteína', 'unidade'),
('Leite', 'laticínio', 'ml'),
('Queijo', 'laticínio', 'g'),
('Batata', 'vegetal', 'unidade');

INSERT INTO recipes (title, slug, description, prep_time, cook_time, servings, difficulty, status, category_id, author_id, image_url, instructions, ingredients) VALUES 
('Arroz com Feijão Tradicional', 'arroz-com-feijao-tradicional', 'O clássico prato brasileiro que não pode faltar na mesa', 15, 45, 4, 'easy', 'published', 1, (SELECT id FROM profiles LIMIT 1), 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=800', 
'["Lave o arroz até a água sair limpa", "Refogue a cebola e o alho no óleo", "Adicione o arroz e refogue por 2 minutos", "Adicione água quente e deixe cozinhar", "Para o feijão, deixe de molho na véspera", "Cozinhe o feijão na panela de pressão", "Tempere com sal e cebola"]',
'[{"name": "Arroz", "quantity": 2, "unit": "xícara"}, {"name": "Feijão", "quantity": 1, "unit": "xícara"}, {"name": "Cebola", "quantity": 1, "unit": "unidade"}, {"name": "Alho", "quantity": 3, "unit": "dente"}, {"name": "Óleo", "quantity": 2, "unit": "colher de sopa"}, {"name": "Sal", "quantity": 1, "unit": "colher de chá"}]'),

('Bolo de Chocolate Simples', 'bolo-de-chocolate-simples', 'Um bolo de chocolate fofinho e delicioso para toda família', 20, 40, 8, 'medium', 'published', 2, (SELECT id FROM profiles LIMIT 1), 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
'["Pré-aqueça o forno a 180°C", "Misture os ingredientes secos", "Bata os ovos com açúcar até esbranquiçar", "Adicione o leite e o óleo", "Misture tudo delicadamente", "Despeje na forma untada", "Asse por 40 minutos"]',
'[{"name": "Farinha de trigo", "quantity": 2, "unit": "xícara"}, {"name": "Açúcar", "quantity": 1.5, "unit": "xícara"}, {"name": "Ovos", "quantity": 3, "unit": "unidade"}, {"name": "Leite", "quantity": 200, "unit": "ml"}, {"name": "Óleo", "quantity": 100, "unit": "ml"}]'),

('Sanduíche Natural', 'sanduiche-natural', 'Lanche saudável e prático para qualquer hora do dia', 10, 0, 1, 'easy', 'published', 3, (SELECT id FROM profiles LIMIT 1), 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=800',
'["Corte o pão pela metade", "Passe maionese ou requeijão", "Adicione as folhas de alface", "Coloque fatias de tomate", "Adicione o peito de peru", "Finalize com queijo", "Feche o sanduíche e sirva"]',
'[{"name": "Pão integral", "quantity": 2, "unit": "fatia"}, {"name": "Alface", "quantity": 3, "unit": "folha"}, {"name": "Tomate", "quantity": 3, "unit": "fatia"}, {"name": "Peito de peru", "quantity": 100, "unit": "g"}, {"name": "Queijo", "quantity": 2, "unit": "fatia"}]');

INSERT INTO courses (title, slug, description, level, status, price, instructor_id, category_id, image_url, what_you_learn, target_audience) VALUES 
('Culinária Básica para Iniciantes', 'culinaria-basica-iniciantes', 'Aprenda os fundamentos da culinária do zero', 'beginner', 'published', 0, (SELECT id FROM profiles LIMIT 1), 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
'["Técnicas básicas de corte", "Como temperar alimentos", "Métodos de cocção", "Organização da cozinha", "Receitas fundamentais"]',
'Pessoas que querem aprender a cozinhar do zero'),

('Sobremesas Irresistíveis', 'sobremesas-irresistiveis', 'Domine a arte das sobremesas caseiras', 'intermediate', 'published', 0, (SELECT id FROM profiles LIMIT 1), 2, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800',
'["Técnicas de confeitaria", "Massas e cremes", "Decoração de bolos", "Sobremesas geladas", "Doces tradicionais"]',
'Pessoas que já cozinham e querem se especializar em doces');

INSERT INTO blog_posts (title, slug, content, excerpt, status, author_id, category_id, image_url, tags) VALUES 
('10 Dicas para Organizar sua Cozinha', '10-dicas-organizar-cozinha', 'Uma cozinha organizada é fundamental para cozinhar com prazer...', 'Descubra como organizar sua cozinha de forma prática e eficiente', 'published', (SELECT id FROM profiles LIMIT 1), 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', '["organização", "cozinha", "dicas"]'),

('Os Benefícios de Cozinhar em Casa', 'beneficios-cozinhar-casa', 'Cozinhar em casa traz inúmeros benefícios para a saúde e o bolso...', 'Entenda por que vale a pena investir tempo cozinhando em casa', 'published', (SELECT id FROM profiles LIMIT 1), 1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', '["saúde", "economia", "casa"]');

INSERT INTO recipe_analytics (recipe_id, views, likes, shares, saves) VALUES 
((SELECT id FROM recipes WHERE slug = 'arroz-com-feijao-tradicional'), 150, 25, 8, 12),
((SELECT id FROM recipes WHERE slug = 'bolo-de-chocolate-simples'), 200, 45, 15, 30),
((SELECT id FROM recipes WHERE slug = 'sanduiche-natural'), 80, 12, 3, 8);

UPDATE profiles SET role = 'admin', full_name = 'Admin do Sistema' WHERE id = auth.uid();

SELECT 'Admin system fixed successfully! Database populated with test data.' as message;

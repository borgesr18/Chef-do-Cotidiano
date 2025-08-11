
INSERT INTO categories (name, slug, description, icon, color, sort_order, is_active) VALUES
('Pratos Principais', 'pratos-principais', 'Receitas para refeições completas e nutritivas', '🍽️', '#3B82F6', 1, true),
('Sobremesas', 'sobremesas', 'Doces e sobremesas irresistíveis', '🍰', '#F59E0B', 2, true),
('Lanches', 'lanches', 'Opções rápidas e práticas para qualquer hora', '🥪', '#10B981', 3, true),
('Bebidas', 'bebidas', 'Drinks, sucos e bebidas refrescantes', '🥤', '#8B5CF6', 4, true),
('Saladas', 'saladas', 'Opções saudáveis e refrescantes', '🥗', '#06B6D4', 5, true),
('Massas', 'massas', 'Pratos com massas deliciosas', '🍝', '#EF4444', 6, true),
('Carnes', 'carnes', 'Receitas com carnes bovinas, suínas e aves', '🥩', '#DC2626', 7, true),
('Peixes', 'peixes', 'Pratos com frutos do mar e peixes', '🐟', '#0EA5E9', 8, true),
('Vegetariano', 'vegetariano', 'Receitas sem carne', '🥬', '#22C55E', 9, true),
('Café da Manhã', 'cafe-da-manha', 'Receitas para começar bem o dia', '☕', '#F97316', 10, true),
('Categoria Inativa', 'categoria-inativa', 'Categoria desabilitada para teste', '❌', '#6B7280', 11, false)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ingredients (name, slug, category, unit, cost_per_unit) VALUES
('Arroz', 'arroz', 'grãos', 'kg', 5.50),
('Feijão', 'feijao', 'grãos', 'kg', 8.00),
('Carne Bovina', 'carne-bovina', 'carnes', 'kg', 35.00),
('Frango', 'frango', 'carnes', 'kg', 12.00),
('Tomate', 'tomate', 'vegetais', 'kg', 6.00),
('Cebola', 'cebola', 'vegetais', 'kg', 4.00),
('Alho', 'alho', 'temperos', 'kg', 15.00),
('Sal', 'sal', 'temperos', 'kg', 2.00),
('Óleo', 'oleo', 'óleos', 'litro', 8.00),
('Açúcar', 'acucar', 'doces', 'kg', 4.50),
('Farinha de Trigo', 'farinha-trigo', 'farinhas', 'kg', 3.50),
('Ovos', 'ovos', 'proteínas', 'dúzia', 8.00),
('Leite', 'leite', 'laticínios', 'litro', 4.50),
('Queijo', 'queijo', 'laticínios', 'kg', 25.00),
('Chocolate', 'chocolate', 'doces', 'kg', 20.00)
ON CONFLICT (slug) DO NOTHING;

DO $$
DECLARE
    cat_pratos_principais UUID;
    cat_sobremesas UUID;
    cat_lanches UUID;
    cat_massas UUID;
    cat_carnes UUID;
    cat_cafe UUID;
BEGIN
    SELECT id INTO cat_pratos_principais FROM categories WHERE slug = 'pratos-principais';
    SELECT id INTO cat_sobremesas FROM categories WHERE slug = 'sobremesas';
    SELECT id INTO cat_lanches FROM categories WHERE slug = 'lanches';
    SELECT id INTO cat_massas FROM categories WHERE slug = 'massas';
    SELECT id INTO cat_carnes FROM categories WHERE slug = 'carnes';
    SELECT id INTO cat_cafe FROM categories WHERE slug = 'cafe-da-manha';

    INSERT INTO recipes (title, slug, description, prep_time, cook_time, servings, difficulty, category_id, status, image_url, instructions, ingredients_list) VALUES
    ('Arroz com Feijão Tradicional', 'arroz-com-feijao-tradicional', 'O clássico prato brasileiro que não pode faltar na mesa', 15, 45, 4, 'easy', cat_pratos_principais, 'published', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500', 
     '["Lave o arroz até a água sair limpa", "Refogue a cebola e alho no óleo", "Adicione o arroz e refogue por 2 minutos", "Adicione água quente e sal", "Cozinhe por 18 minutos em fogo baixo", "Para o feijão, deixe de molho por 8 horas", "Cozinhe o feijão na panela de pressão por 20 minutos", "Tempere com sal, cebola e alho"]',
     '[{"name": "Arroz", "quantity": "2", "unit": "xícaras"}, {"name": "Feijão", "quantity": "1", "unit": "xícara"}, {"name": "Cebola", "quantity": "1", "unit": "unidade"}, {"name": "Alho", "quantity": "3", "unit": "dentes"}, {"name": "Óleo", "quantity": "2", "unit": "colheres de sopa"}, {"name": "Sal", "quantity": "1", "unit": "colher de chá"}]'),
    
    ('Bolo de Chocolate Simples', 'bolo-chocolate-simples', 'Bolo de chocolate fofinho e delicioso para toda família', 20, 40, 8, 'medium', cat_sobremesas, 'published', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500',
     '["Pré-aqueça o forno a 180°C", "Misture os ingredientes secos", "Bata os ovos com açúcar até dobrar de volume", "Adicione o leite e óleo", "Incorpore os secos aos poucos", "Despeje na forma untada", "Asse por 40 minutos"]',
     '[{"name": "Farinha de Trigo", "quantity": "2", "unit": "xícaras"}, {"name": "Açúcar", "quantity": "1.5", "unit": "xícaras"}, {"name": "Chocolate em Pó", "quantity": "1/2", "unit": "xícara"}, {"name": "Ovos", "quantity": "3", "unit": "unidades"}, {"name": "Leite", "quantity": "1", "unit": "xícara"}, {"name": "Óleo", "quantity": "1/2", "unit": "xícara"}]'),
    
    ('Sanduíche Natural', 'sanduiche-natural', 'Lanche saudável e nutritivo para qualquer hora do dia', 10, 0, 1, 'easy', cat_lanches, 'published', 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=500',
     '["Corte o pão pela metade", "Passe maionese ou cream cheese", "Adicione as folhas de alface", "Coloque fatias de tomate", "Adicione o peito de peru", "Tempere com sal e pimenta", "Feche o sanduíche e corte ao meio"]',
     '[{"name": "Pão Integral", "quantity": "2", "unit": "fatias"}, {"name": "Peito de Peru", "quantity": "100", "unit": "gramas"}, {"name": "Tomate", "quantity": "1", "unit": "unidade"}, {"name": "Alface", "quantity": "3", "unit": "folhas"}, {"name": "Maionese", "quantity": "1", "unit": "colher de sopa"}]'),
    
    ('Macarrão à Bolonhesa', 'macarrao-bolonhesa', 'Massa italiana clássica com molho de carne', 20, 30, 4, 'medium', cat_massas, 'published', 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=500',
     '["Cozinhe o macarrão em água fervente com sal", "Refogue a cebola e alho", "Adicione a carne moída e doure", "Acrescente o molho de tomate", "Tempere com sal, pimenta e manjericão", "Deixe apurar por 15 minutos", "Sirva sobre o macarrão"]',
     '[{"name": "Macarrão", "quantity": "500", "unit": "gramas"}, {"name": "Carne Moída", "quantity": "300", "unit": "gramas"}, {"name": "Molho de Tomate", "quantity": "1", "unit": "lata"}, {"name": "Cebola", "quantity": "1", "unit": "unidade"}, {"name": "Alho", "quantity": "2", "unit": "dentes"}]'),
    
    ('Bife Grelhado', 'bife-grelhado', 'Carne suculenta grelhada no ponto perfeito', 10, 15, 2, 'medium', cat_carnes, 'published', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500',
     '["Tempere a carne com sal e pimenta", "Deixe em temperatura ambiente por 30 minutos", "Aqueça bem a grelha ou frigideira", "Grelhe por 3-4 minutos de cada lado", "Deixe descansar por 5 minutos", "Sirva imediatamente"]',
     '[{"name": "Bife de Contrafilé", "quantity": "2", "unit": "unidades"}, {"name": "Sal", "quantity": "1", "unit": "colher de chá"}, {"name": "Pimenta do Reino", "quantity": "1/2", "unit": "colher de chá"}, {"name": "Óleo", "quantity": "1", "unit": "colher de sopa"}]'),
    
    ('Panqueca Americana', 'panqueca-americana', 'Panquecas fofinhas perfeitas para o café da manhã', 10, 15, 4, 'easy', cat_cafe, 'published', 'https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=500',
     '["Misture os ingredientes secos", "Bata os ovos com leite", "Combine as misturas sem bater muito", "Aqueça a frigideira antiaderente", "Despeje a massa e cozinhe até fazer bolhas", "Vire e cozinhe o outro lado", "Sirva com mel ou xarope"]',
     '[{"name": "Farinha de Trigo", "quantity": "1", "unit": "xícara"}, {"name": "Açúcar", "quantity": "2", "unit": "colheres de sopa"}, {"name": "Fermento", "quantity": "1", "unit": "colher de chá"}, {"name": "Ovos", "quantity": "1", "unit": "unidade"}, {"name": "Leite", "quantity": "3/4", "unit": "xícara"}]')
    ON CONFLICT (slug) DO NOTHING;
END $$;

INSERT INTO courses (title, slug, description, instructor_id, category_id, level, status, price, image_url, what_you_learn, target_audience) VALUES
('Curso Básico de Culinária', 'curso-basico-culinaria', 'Aprenda os fundamentos da culinária do zero', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM categories WHERE slug = 'pratos-principais'), 'beginner', 'published', 199.90, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500',
 '["Técnicas básicas de corte", "Métodos de cocção", "Temperos e condimentos", "Organização da cozinha", "Receitas fundamentais"]',
 'Iniciantes que querem aprender a cozinhar'),
('Sobremesas Profissionais', 'sobremesas-profissionais', 'Domine a arte da confeitaria', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM categories WHERE slug = 'sobremesas'), 'advanced', 'published', 299.90, 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500',
 '["Técnicas de confeitaria", "Decoração de bolos", "Chocolateria", "Massas especiais", "Apresentação profissional"]',
 'Confeiteiros e entusiastas avançados'),
('Cozinha Vegetariana', 'cozinha-vegetariana', 'Receitas deliciosas sem carne', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM categories WHERE slug = 'vegetariano'), 'intermediate', 'draft', 149.90, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500',
 '["Proteínas vegetais", "Combinações nutritivas", "Sabores intensos", "Pratos coloridos", "Alimentação saudável"]',
 'Vegetarianos e pessoas interessadas em reduzir o consumo de carne')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (title, slug, content, excerpt, author_id, category_id, status, featured_image, tags) VALUES
('10 Dicas para Organizar sua Cozinha', '10-dicas-organizar-cozinha', 'Uma cozinha organizada é fundamental para cozinhar com eficiência...', 'Descubra como organizar sua cozinha de forma prática e funcional', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM categories WHERE slug = 'pratos-principais'), 'published', 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500', '["organização", "cozinha", "dicas"]'),
('A História do Chocolate', 'historia-do-chocolate', 'O chocolate tem uma história rica e fascinante...', 'Conheça a origem e evolução do chocolate ao longo dos séculos', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM categories WHERE slug = 'sobremesas'), 'published', 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=500', '["chocolate", "história", "curiosidades"]'),
('Benefícios da Alimentação Vegetariana', 'beneficios-alimentacao-vegetariana', 'A alimentação vegetariana oferece diversos benefícios...', 'Entenda os benefícios nutricionais e ambientais da dieta vegetariana', (SELECT id FROM profiles LIMIT 1), (SELECT id FROM categories WHERE slug = 'vegetariano'), 'draft', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', '["vegetariano", "saúde", "nutrição"]')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipe_analytics (recipe_id, views, likes, shares, saves)
SELECT 
    r.id,
    floor(random() * 1000 + 100)::integer as views,
    floor(random() * 50 + 5)::integer as likes,
    floor(random() * 20 + 1)::integer as shares,
    floor(random() * 30 + 3)::integer as saves
FROM recipes r
ON CONFLICT (recipe_id) DO UPDATE SET
    views = EXCLUDED.views,
    likes = EXCLUDED.likes,
    shares = EXCLUDED.shares,
    saves = EXCLUDED.saves;

DO $$
DECLARE
    course_basico UUID;
    course_sobremesas UUID;
    module_id UUID;
BEGIN
    SELECT id INTO course_basico FROM courses WHERE slug = 'curso-basico-culinaria';
    SELECT id INTO course_sobremesas FROM courses WHERE slug = 'sobremesas-profissionais';
    
    INSERT INTO course_modules (course_id, title, description, sort_order) VALUES
    (course_basico, 'Introdução à Culinária', 'Fundamentos básicos da cozinha', 1),
    (course_basico, 'Técnicas de Corte', 'Aprenda a cortar ingredientes corretamente', 2),
    (course_basico, 'Métodos de Cocção', 'Diferentes formas de cozinhar alimentos', 3)
    ON CONFLICT DO NOTHING;
    
    SELECT id INTO module_id FROM course_modules WHERE course_id = course_basico AND sort_order = 1 LIMIT 1;
    
    INSERT INTO course_lessons (module_id, title, description, video_url, duration, sort_order, is_preview) VALUES
    (module_id, 'Bem-vindos ao Curso', 'Apresentação do curso e objetivos', 'https://youtube.com/watch?v=example1', 300, 1, true),
    (module_id, 'Equipamentos Básicos', 'Conhecendo os utensílios essenciais', 'https://youtube.com/watch?v=example2', 450, 2, false),
    (module_id, 'Organização da Cozinha', 'Como organizar seu espaço de trabalho', 'https://youtube.com/watch?v=example3', 600, 3, false)
    ON CONFLICT DO NOTHING;
END $$;

INSERT INTO course_enrollments (user_id, course_id, status, progress, enrolled_at)
SELECT 
    p.id,
    c.id,
    'active',
    floor(random() * 100)::integer,
    NOW() - (random() * interval '30 days')
FROM profiles p
CROSS JOIN courses c
WHERE c.status = 'published'
LIMIT 10
ON CONFLICT DO NOTHING;

INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, user_id)
SELECT 
    'recipes',
    r.id,
    'INSERT',
    '{}',
    row_to_json(r),
    (SELECT id FROM profiles LIMIT 1)
FROM recipes r
LIMIT 5
ON CONFLICT DO NOTHING;

COMMIT;

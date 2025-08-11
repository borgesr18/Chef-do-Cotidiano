
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
('Café da Manhã', 'cafe-da-manha', 'Receitas para começar bem o dia', '☕', '#F97316', 10, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO ingredients (name, category, unit, cost_per_unit) VALUES
('Arroz', 'grãos', 'kg', 5.50),
('Feijão', 'grãos', 'kg', 8.00),
('Carne Bovina', 'proteínas', 'kg', 35.00),
('Frango', 'proteínas', 'kg', 12.00),
('Ovos', 'proteínas', 'dúzia', 8.00),
('Leite', 'laticínios', 'litro', 4.50),
('Queijo', 'laticínios', 'kg', 25.00),
('Tomate', 'vegetais', 'kg', 6.00),
('Cebola', 'vegetais', 'kg', 4.00),
('Alho', 'temperos', 'kg', 15.00),
('Sal', 'temperos', 'kg', 2.00),
('Açúcar', 'doces', 'kg', 4.00),
('Farinha de Trigo', 'farinhas', 'kg', 3.50),
('Óleo', 'óleos', 'litro', 8.00),
('Azeite', 'óleos', 'litro', 25.00)
ON CONFLICT (name) DO NOTHING;

DO $$
DECLARE
    cat_pratos_principais UUID;
    cat_sobremesas UUID;
    cat_lanches UUID;
    cat_massas UUID;
    cat_carnes UUID;
BEGIN
    SELECT id INTO cat_pratos_principais FROM categories WHERE slug = 'pratos-principais';
    SELECT id INTO cat_sobremesas FROM categories WHERE slug = 'sobremesas';
    SELECT id INTO cat_lanches FROM categories WHERE slug = 'lanches';
    SELECT id INTO cat_massas FROM categories WHERE slug = 'massas';
    SELECT id INTO cat_carnes FROM categories WHERE slug = 'carnes';

    INSERT INTO recipes (
        title, slug, description, prep_time, cook_time, servings, difficulty, 
        category_id, ingredients, instructions, tips, status, featured
    ) VALUES
    (
        'Arroz com Feijão Tradicional',
        'arroz-com-feijao-tradicional',
        'O clássico prato brasileiro que não pode faltar na mesa',
        15, 45, 4, 'easy',
        cat_pratos_principais,
        '[{"name": "Arroz", "quantity": "2", "unit": "xícaras"}, {"name": "Feijão", "quantity": "1", "unit": "xícara"}, {"name": "Cebola", "quantity": "1", "unit": "unidade"}, {"name": "Alho", "quantity": "3", "unit": "dentes"}]',
        '["Deixe o feijão de molho na véspera", "Cozinhe o feijão na panela de pressão por 20 minutos", "Refogue a cebola e o alho", "Adicione o arroz e refogue por 2 minutos", "Adicione água quente e cozinhe por 18 minutos", "Tempere o feijão e sirva"]',
        '["Use água filtrada para um sabor melhor", "O feijão pode ser congelado em porções"]',
        'published', true
    ),
    (
        'Bolo de Chocolate Simples',
        'bolo-de-chocolate-simples',
        'Um bolo fofinho e delicioso para toda a família',
        20, 40, 8, 'easy',
        cat_sobremesas,
        '[{"name": "Farinha de Trigo", "quantity": "2", "unit": "xícaras"}, {"name": "Açúcar", "quantity": "1.5", "unit": "xícaras"}, {"name": "Ovos", "quantity": "3", "unit": "unidades"}, {"name": "Leite", "quantity": "1", "unit": "xícara"}]',
        '["Pré-aqueça o forno a 180°C", "Misture os ingredientes secos", "Bata os ovos com açúcar", "Adicione o leite e a farinha alternadamente", "Asse por 40 minutos"]',
        '["Teste com palito antes de retirar do forno", "Pode ser coberto com brigadeiro"]',
        'published', true
    ),
    (
        'Sanduíche Natural',
        'sanduiche-natural',
        'Lanche saudável e prático para qualquer hora',
        10, 0, 1, 'easy',
        cat_lanches,
        '[{"name": "Pão integral", "quantity": "2", "unit": "fatias"}, {"name": "Peito de peru", "quantity": "100", "unit": "g"}, {"name": "Queijo", "quantity": "2", "unit": "fatias"}, {"name": "Tomate", "quantity": "1", "unit": "unidade"}]',
        '["Corte o tomate em fatias", "Monte o sanduíche com todos os ingredientes", "Corte ao meio e sirva"]',
        '["Pode ser embrulhado em papel filme", "Adicione folhas verdes para mais sabor"]',
        'published', false
    ),
    (
        'Macarrão à Bolonhesa',
        'macarrao-a-bolonhesa',
        'Clássico italiano com molho de carne delicioso',
        20, 30, 4, 'medium',
        cat_massas,
        '[{"name": "Macarrão", "quantity": "500", "unit": "g"}, {"name": "Carne moída", "quantity": "400", "unit": "g"}, {"name": "Tomate", "quantity": "4", "unit": "unidades"}, {"name": "Cebola", "quantity": "1", "unit": "unidade"}]',
        '["Refogue a cebola e o alho", "Adicione a carne e doure bem", "Acrescente os tomates picados", "Tempere e deixe cozinhar por 20 minutos", "Cozinhe o macarrão al dente", "Sirva com queijo ralado"]',
        '["O molho fica melhor no dia seguinte", "Pode congelar o molho por até 3 meses"]',
        'published', true
    ),
    (
        'Bife Acebolado',
        'bife-acebolado',
        'Carne suculenta com cebolas douradas',
        15, 20, 2, 'medium',
        cat_carnes,
        '[{"name": "Bife", "quantity": "2", "unit": "unidades"}, {"name": "Cebola", "quantity": "2", "unit": "unidades"}, {"name": "Alho", "quantity": "2", "unit": "dentes"}, {"name": "Óleo", "quantity": "2", "unit": "colheres"}]',
        '["Tempere os bifes com sal e pimenta", "Aqueça a frigideira com óleo", "Doure os bifes dos dois lados", "Retire os bifes e reserve", "Refogue as cebolas até dourar", "Volte os bifes à panela e finalize"]',
        '["Não cozinhe demais para não ressecar", "Sirva com arroz e feijão"]',
        'published', false
    )
    ON CONFLICT (slug) DO NOTHING;

END $$;

INSERT INTO courses (
    title, slug, description, instructor_id, category_id, level, duration_hours, 
    price, status, featured
) VALUES
(
    'Culinária Básica para Iniciantes',
    'culinaria-basica-iniciantes',
    'Aprenda os fundamentos da culinária com receitas práticas e fáceis',
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'pratos-principais' LIMIT 1),
    'beginner', 8, 0.00, 'published', true
),
(
    'Sobremesas Irresistíveis',
    'sobremesas-irresistiveis',
    'Domine a arte da confeitaria com sobremesas deliciosas',
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'sobremesas' LIMIT 1),
    'intermediate', 12, 49.90, 'published', true
),
(
    'Massas Artesanais',
    'massas-artesanais',
    'Aprenda a fazer massas frescas do zero',
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'massas' LIMIT 1),
    'advanced', 16, 89.90, 'draft', false
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_posts (
    title, slug, content, excerpt, author_id, category_id, status, featured_image
) VALUES
(
    'Dicas para uma Cozinha Mais Organizada',
    'dicas-cozinha-organizada',
    'Uma cozinha organizada é fundamental para cozinhar com prazer e eficiência...',
    'Descubra como organizar sua cozinha de forma prática e funcional',
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'pratos-principais' LIMIT 1),
    'published', '/images/blog/cozinha-organizada.jpg'
),
(
    'Os Benefícios de Cozinhar em Casa',
    'beneficios-cozinhar-casa',
    'Cozinhar em casa traz inúmeros benefícios para a saúde, economia e bem-estar...',
    'Entenda por que vale a pena investir tempo na cozinha',
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'pratos-principais' LIMIT 1),
    'published', '/images/blog/cozinhar-casa.jpg'
),
(
    'Temperos Essenciais na Cozinha',
    'temperos-essenciais-cozinha',
    'Conheça os temperos que não podem faltar na sua despensa...',
    'Uma lista completa dos temperos fundamentais',
    (SELECT id FROM profiles LIMIT 1),
    (SELECT id FROM categories WHERE slug = 'pratos-principais' LIMIT 1),
    'draft', '/images/blog/temperos.jpg'
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO recipe_analytics (recipe_id, views, likes, shares, saves)
SELECT 
    r.id,
    floor(random() * 1000 + 100)::int as views,
    floor(random() * 50 + 10)::int as likes,
    floor(random() * 20 + 5)::int as shares,
    floor(random() * 30 + 5)::int as saves
FROM recipes r
ON CONFLICT (recipe_id) DO UPDATE SET
    views = EXCLUDED.views,
    likes = EXCLUDED.likes,
    shares = EXCLUDED.shares,
    saves = EXCLUDED.saves;

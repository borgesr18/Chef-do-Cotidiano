-- Criar tabela para armazenar interações dos usuários com receitas
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('view', 'favorite', 'download', 'share')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_recipe_id ON user_interactions(recipe_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_action ON user_interactions(action);
CREATE INDEX IF NOT EXISTS idx_user_interactions_timestamp ON user_interactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_action ON user_interactions(user_id, action);
CREATE INDEX IF NOT EXISTS idx_user_interactions_recipe_action ON user_interactions(recipe_id, action);

-- Índice composto para queries de recomendação
CREATE INDEX IF NOT EXISTS idx_user_interactions_recommendations 
  ON user_interactions(user_id, timestamp DESC, action) 
  WHERE user_id IS NOT NULL;

-- Índice para sessões anônimas
CREATE INDEX IF NOT EXISTS idx_user_interactions_session_recommendations 
  ON user_interactions(session_id, timestamp DESC, action) 
  WHERE user_id IS NULL;

-- Habilitar RLS (Row Level Security)
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem ver suas próprias interações
CREATE POLICY "Users can view their own interactions" ON user_interactions
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

-- Política para usuários poderem inserir suas próprias interações
CREATE POLICY "Users can insert their own interactions" ON user_interactions
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (user_id IS NULL AND session_id IS NOT NULL)
  );

-- Política para admins poderem ver todas as interações (para analytics)
CREATE POLICY "Admins can view all interactions" ON user_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Política para permitir acesso anônimo (para sessões não autenticadas)
CREATE POLICY "Allow anonymous interactions" ON user_interactions
  FOR ALL USING (user_id IS NULL);

-- Função para limpar interações antigas (mais de 6 meses)
CREATE OR REPLACE FUNCTION cleanup_old_interactions()
RETURNS void AS $$
BEGIN
  DELETE FROM user_interactions 
  WHERE timestamp < NOW() - INTERVAL '6 months'
  AND user_id IS NULL; -- Manter interações de usuários autenticados
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de receitas
CREATE OR REPLACE FUNCTION get_recipe_stats(recipe_uuid UUID)
RETURNS TABLE(
  total_views BIGINT,
  total_favorites BIGINT,
  total_downloads BIGINT,
  total_shares BIGINT,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE action = 'view') as total_views,
    COUNT(*) FILTER (WHERE action = 'favorite') as total_favorites,
    COUNT(*) FILTER (WHERE action = 'download') as total_downloads,
    COUNT(*) FILTER (WHERE action = 'share') as total_shares,
    COUNT(DISTINCT COALESCE(user_id::text, session_id)) as unique_users
  FROM user_interactions 
  WHERE recipe_id = recipe_uuid;
END;
$$ LANGUAGE plpgsql;

-- Função para obter receitas populares
CREATE OR REPLACE FUNCTION get_popular_recipes(days_back INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 20)
RETURNS TABLE(
  recipe_id UUID,
  view_count BIGINT,
  favorite_count BIGINT,
  popularity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ui.recipe_id,
    COUNT(*) FILTER (WHERE ui.action = 'view') as view_count,
    COUNT(*) FILTER (WHERE ui.action = 'favorite') as favorite_count,
    -- Score de popularidade: views + (favorites * 3) + (downloads * 2) + shares
    (
      COUNT(*) FILTER (WHERE ui.action = 'view') +
      (COUNT(*) FILTER (WHERE ui.action = 'favorite') * 3) +
      (COUNT(*) FILTER (WHERE ui.action = 'download') * 2) +
      COUNT(*) FILTER (WHERE ui.action = 'share')
    )::NUMERIC as popularity_score
  FROM user_interactions ui
  WHERE ui.timestamp >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY ui.recipe_id
  ORDER BY popularity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Função para obter preferências do usuário
CREATE OR REPLACE FUNCTION get_user_preferences(user_uuid UUID)
RETURNS TABLE(
  preferred_categories TEXT[],
  preferred_difficulties TEXT[],
  avg_prep_time NUMERIC,
  most_active_time TIME,
  total_interactions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_stats AS (
    SELECT 
      ui.recipe_id,
      ui.action,
      ui.timestamp,
      r.category,
      r.difficulty,
      r.prep_time
    FROM user_interactions ui
    LEFT JOIN recipes r ON r.id = ui.recipe_id
    WHERE ui.user_id = user_uuid
    AND ui.timestamp >= NOW() - INTERVAL '3 months'
  )
  SELECT 
    ARRAY_AGG(DISTINCT us.category ORDER BY COUNT(*) DESC) FILTER (WHERE us.category IS NOT NULL) as preferred_categories,
    ARRAY_AGG(DISTINCT us.difficulty ORDER BY COUNT(*) DESC) FILTER (WHERE us.difficulty IS NOT NULL) as preferred_difficulties,
    AVG(us.prep_time) as avg_prep_time,
    (SELECT us.timestamp::TIME 
     FROM user_stats us 
     GROUP BY us.timestamp::TIME 
     ORDER BY COUNT(*) DESC 
     LIMIT 1) as most_active_time,
    COUNT(*)::BIGINT as total_interactions
  FROM user_stats us;
END;
$$ LANGUAGE plpgsql;

-- Conceder permissões para roles anon e authenticated
GRANT SELECT, INSERT ON user_interactions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_interactions TO authenticated;

-- Conceder permissões para as funções
GRANT EXECUTE ON FUNCTION get_recipe_stats(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_popular_recipes(INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_preferences(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_interactions() TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE user_interactions IS 'Armazena todas as interações dos usuários com receitas para sistema de recomendações';
COMMENT ON COLUMN user_interactions.recipe_id IS 'ID da receita com a qual o usuário interagiu';
COMMENT ON COLUMN user_interactions.user_id IS 'ID do usuário (NULL para usuários anônimos)';
COMMENT ON COLUMN user_interactions.session_id IS 'ID da sessão para rastrear usuários anônimos';
COMMENT ON COLUMN user_interactions.action IS 'Tipo de interação: view, favorite, download, share';
COMMENT ON COLUMN user_interactions.metadata IS 'Dados adicionais sobre a interação (JSON)';

COMMENT ON FUNCTION get_recipe_stats(UUID) IS 'Retorna estatísticas de uma receita específica';
COMMENT ON FUNCTION get_popular_recipes(INTEGER, INTEGER) IS 'Retorna receitas mais populares nos últimos N dias';
COMMENT ON FUNCTION get_user_preferences(UUID) IS 'Retorna preferências inferidas de um usuário baseado no histórico';
COMMENT ON FUNCTION cleanup_old_interactions() IS 'Remove interações antigas de usuários anônimos';
-- Criar tabela para armazenar push subscriptions
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_created_at ON push_subscriptions(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados poderem gerenciar suas próprias subscriptions
CREATE POLICY "Users can manage their own push subscriptions" ON push_subscriptions
  FOR ALL USING (
    auth.uid() = user_id OR 
    auth.uid() IS NULL -- Permitir subscriptions anônimas
  );

-- Política para admins poderem ver todas as subscriptions
CREATE POLICY "Admins can view all push subscriptions" ON push_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Conceder permissões para roles anon e authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO authenticated;

-- Comentários para documentação
COMMENT ON TABLE push_subscriptions IS 'Armazena as subscriptions de push notifications dos usuários';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'URL endpoint da subscription';
COMMENT ON COLUMN push_subscriptions.p256dh IS 'Chave pública P256DH para criptografia';
COMMENT ON COLUMN push_subscriptions.auth IS 'Chave de autenticação para a subscription';
COMMENT ON COLUMN push_subscriptions.user_id IS 'ID do usuário (opcional para subscriptions anônimas)';
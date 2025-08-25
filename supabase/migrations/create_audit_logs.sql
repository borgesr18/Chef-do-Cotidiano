-- Criar tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')) DEFAULT 'low'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Índice composto para consultas comuns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_timestamp ON audit_logs(resource_type, timestamp DESC);

-- RLS (Row Level Security)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Política para administradores (podem ver todos os logs)
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Política para usuários (podem ver apenas seus próprios logs)
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Política para inserção (apenas sistema pode inserir)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true); -- Será controlado pela service role key

-- Função para limpeza automática de logs antigos
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Remove logs com mais de 1 ano, exceto os críticos
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '1 year'
  AND severity != 'critical';
  
  -- Remove logs críticos com mais de 2 anos
  DELETE FROM audit_logs 
  WHERE timestamp < NOW() - INTERVAL '2 years'
  AND severity = 'critical';
END;
$$;

-- Função para estatísticas de auditoria
CREATE OR REPLACE FUNCTION get_audit_stats(
  start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_events BIGINT,
  events_by_severity JSONB,
  events_by_action JSONB,
  events_by_resource JSONB,
  top_users JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total de eventos
    (SELECT COUNT(*) FROM audit_logs WHERE timestamp BETWEEN start_date AND end_date),
    
    -- Eventos por severidade
    (SELECT COALESCE(jsonb_object_agg(severity, count), '{}'::jsonb)
     FROM (
       SELECT severity, COUNT(*) as count
       FROM audit_logs 
       WHERE timestamp BETWEEN start_date AND end_date
       GROUP BY severity
     ) s),
    
    -- Eventos por ação
    (SELECT COALESCE(jsonb_object_agg(action, count), '{}'::jsonb)
     FROM (
       SELECT action, COUNT(*) as count
       FROM audit_logs 
       WHERE timestamp BETWEEN start_date AND end_date
       GROUP BY action
       ORDER BY count DESC
       LIMIT 10
     ) a),
    
    -- Eventos por tipo de recurso
    (SELECT COALESCE(jsonb_object_agg(resource_type, count), '{}'::jsonb)
     FROM (
       SELECT resource_type, COUNT(*) as count
       FROM audit_logs 
       WHERE timestamp BETWEEN start_date AND end_date
       GROUP BY resource_type
       ORDER BY count DESC
     ) r),
    
    -- Top usuários por atividade
    (SELECT COALESCE(jsonb_object_agg(user_id, count), '{}'::jsonb)
     FROM (
       SELECT user_id, COUNT(*) as count
       FROM audit_logs 
       WHERE timestamp BETWEEN start_date AND end_date
       AND user_id IS NOT NULL
       GROUP BY user_id
       ORDER BY count DESC
       LIMIT 10
     ) u);
END;
$$;

-- Trigger para notificação de eventos críticos
CREATE OR REPLACE FUNCTION notify_critical_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Notificar eventos críticos
  IF NEW.severity = 'critical' THEN
    PERFORM pg_notify(
      'critical_audit_event',
      json_build_object(
        'id', NEW.id,
        'action', NEW.action,
        'user_id', NEW.user_id,
        'ip_address', NEW.ip_address,
        'timestamp', NEW.timestamp,
        'details', NEW.details
      )::text
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger
CREATE TRIGGER trigger_notify_critical_audit_event
  AFTER INSERT ON audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION notify_critical_audit_event();

-- Comentários para documentação
COMMENT ON TABLE audit_logs IS 'Tabela para armazenar logs de auditoria do sistema';
COMMENT ON COLUMN audit_logs.action IS 'Ação realizada (ex: auth_login, data_create, admin_delete)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Tipo de recurso afetado (ex: user, recipe, category)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID do recurso afetado';
COMMENT ON COLUMN audit_logs.details IS 'Detalhes adicionais da ação em formato JSON';
COMMENT ON COLUMN audit_logs.severity IS 'Nível de severidade do evento';
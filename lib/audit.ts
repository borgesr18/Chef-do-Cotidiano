import { createClient } from '@supabase/supabase-js';

// Tipos para auditoria
export interface AuditLog {
  id?: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityEvent {
  type: 'rate_limit_exceeded' | 'invalid_token' | 'suspicious_activity' | 'data_breach_attempt' | 'unauthorized_access';
  details: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  user_id?: string;
}

// Cliente Supabase para logs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Função principal de auditoria
export async function logAudit(log: AuditLog): Promise<void> {
  try {
    const auditEntry = {
      ...log,
      timestamp: new Date().toISOString(),
    };

    // Salvar no Supabase
    const { error } = await supabase
      .from('audit_logs')
      .insert([auditEntry]);

    if (error) {
      console.error('Erro ao salvar log de auditoria:', error);
      // Fallback: salvar em arquivo local ou serviço externo
      await fallbackLog(auditEntry);
    }

    // Log crítico também vai para console
    if (log.severity === 'critical') {
      console.error('AUDIT CRITICAL:', auditEntry);
    }
  } catch (error) {
    console.error('Erro no sistema de auditoria:', error);
    await fallbackLog(log);
  }
}

// Função para eventos de segurança
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  const auditLog: AuditLog = {
    action: 'security_event',
    resource_type: 'system',
    details: {
      event_type: event.type,
      ...event.details,
    },
    ip_address: event.ip_address,
    user_agent: event.user_agent,
    user_id: event.user_id,
    severity: getSeverityForEvent(event.type),
  };

  await logAudit(auditLog);

  // Alertas para eventos críticos
  if (auditLog.severity === 'critical') {
    await sendSecurityAlert(event);
  }
}

// Função para logs de autenticação
export async function logAuthEvent(
  action: 'login' | 'logout' | 'register' | 'password_reset' | 'token_refresh',
  userId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await logAudit({
    user_id: userId,
    action: `auth_${action}`,
    resource_type: 'user',
    resource_id: userId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent,
    severity: action === 'login' ? 'medium' : 'low',
  });
}

// Função para logs de dados
export async function logDataEvent(
  action: 'create' | 'read' | 'update' | 'delete',
  resourceType: string,
  resourceId?: string,
  userId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    user_id: userId,
    action: `data_${action}`,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: ipAddress,
    severity: action === 'delete' ? 'high' : 'low',
  });
}

// Função para logs administrativos
export async function logAdminEvent(
  action: string,
  adminUserId: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  await logAudit({
    user_id: adminUserId,
    action: `admin_${action}`,
    resource_type: 'admin',
    details,
    ip_address: ipAddress,
    severity: 'high',
  });
}

// Função auxiliar para determinar severidade
function getSeverityForEvent(eventType: SecurityEvent['type']): AuditLog['severity'] {
  switch (eventType) {
    case 'data_breach_attempt':
    case 'unauthorized_access':
      return 'critical';
    case 'rate_limit_exceeded':
    case 'suspicious_activity':
      return 'high';
    case 'invalid_token':
      return 'medium';
    default:
      return 'low';
  }
}

// Fallback para quando o Supabase não está disponível
async function fallbackLog(log: AuditLog): Promise<void> {
  // Em produção, você pode enviar para um serviço externo como Sentry, LogRocket, etc.
  console.log('AUDIT FALLBACK:', JSON.stringify(log, null, 2));
  
  // Salvar em arquivo local (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, `audit-${new Date().toISOString().split('T')[0]}.log`);
      
      // Criar diretório se não existir
      await fs.mkdir(logDir, { recursive: true });
      
      // Adicionar log ao arquivo
      await fs.appendFile(logFile, JSON.stringify(log) + '\n');
    } catch (error) {
      console.error('Erro ao salvar log em arquivo:', error);
    }
  }
}

// Função para enviar alertas de segurança
async function sendSecurityAlert(event: SecurityEvent): Promise<void> {
  // Implementar integração com serviços de alerta (email, Slack, etc.)
  console.error('SECURITY ALERT:', {
    type: event.type,
    timestamp: new Date().toISOString(),
    details: event.details,
    ip: event.ip_address,
  });
  
  // TODO: Implementar notificações reais
  // - Email para administradores
  // - Webhook para Slack/Discord
  // - Push notification para app mobile admin
}

// Função para buscar logs de auditoria
export async function getAuditLogs(
  filters: {
    user_id?: string;
    action?: string;
    resource_type?: string;
    severity?: AuditLog['severity'];
    start_date?: string;
    end_date?: string;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data: AuditLog[]; count: number }> {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false });

    // Aplicar filtros
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }
    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }
    if (filters.start_date) {
      query = query.gte('timestamp', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('timestamp', filters.end_date);
    }

    // Paginação
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return { data: [], count: 0 };
  }
}

// Função para limpar logs antigos
export async function cleanupOldLogs(daysToKeep: number = 90): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());

    if (error) {
      throw error;
    }

    console.log(`Logs de auditoria anteriores a ${cutoffDate.toISOString()} foram removidos`);
  } catch (error) {
    console.error('Erro ao limpar logs antigos:', error);
  }
}
import { NextRequest } from 'next/server';

// Tipos de eventos de auditoria
export enum AuditEventType {
  // Autenticação
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTER = 'user_register',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  
  // Receitas
  RECIPE_CREATE = 'recipe_create',
  RECIPE_UPDATE = 'recipe_update',
  RECIPE_DELETE = 'recipe_delete',
  RECIPE_PUBLISH = 'recipe_publish',
  RECIPE_UNPUBLISH = 'recipe_unpublish',
  
  // Categorias
  CATEGORY_CREATE = 'category_create',
  CATEGORY_UPDATE = 'category_update',
  CATEGORY_DELETE = 'category_delete',
  
  // Usuários (Admin)
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  USER_BAN = 'user_ban',
  USER_UNBAN = 'user_unban',
  
  // Sistema
  ADMIN_LOGIN = 'admin_login',
  SYSTEM_CONFIG_UPDATE = 'system_config_update',
  BULK_OPERATION = 'bulk_operation',
  
  // Segurança
  FAILED_LOGIN = 'failed_login',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SECURITY_VIOLATION = 'security_violation'
}

// Níveis de severidade
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Interface para evento de auditoria
export interface AuditEvent {
  id?: string;
  event_type: AuditEventType;
  severity: AuditSeverity;
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: Record<string, unknown>;
  new_values?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  success: boolean;
  error_message?: string;
}

// Interface para filtros de busca
export interface AuditSearchFilters {
  event_types?: AuditEventType[];
  severity?: AuditSeverity[];
  user_id?: string;
  resource_type?: string;
  resource_id?: string;
  start_date?: Date;
  end_date?: Date;
  success?: boolean;
  ip_address?: string;
  page?: number;
  limit?: number;
}

// Store em memória para desenvolvimento (em produção usar banco de dados)
class AuditStore {
  private events: AuditEvent[] = [];
  private maxEvents = 10000; // Limite para evitar uso excessivo de memória

  add(event: AuditEvent): void {
    const eventWithId = {
      ...event,
      id: this.generateId(),
      timestamp: new Date()
    };
    
    this.events.unshift(eventWithId);
    
    // Remove eventos antigos se exceder o limite
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(0, this.maxEvents);
    }
  }

  search(filters: AuditSearchFilters): { events: AuditEvent[]; total: number } {
    let filteredEvents = [...this.events];

    // Aplicar filtros
    if (filters.event_types?.length) {
      filteredEvents = filteredEvents.filter(event => 
        filters.event_types!.includes(event.event_type)
      );
    }

    if (filters.severity?.length) {
      filteredEvents = filteredEvents.filter(event => 
        filters.severity!.includes(event.severity)
      );
    }

    if (filters.user_id) {
      filteredEvents = filteredEvents.filter(event => 
        event.user_id === filters.user_id
      );
    }

    if (filters.resource_type) {
      filteredEvents = filteredEvents.filter(event => 
        event.resource_type === filters.resource_type
      );
    }

    if (filters.resource_id) {
      filteredEvents = filteredEvents.filter(event => 
        event.resource_id === filters.resource_id
      );
    }

    if (filters.start_date) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= filters.start_date!
      );
    }

    if (filters.end_date) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp <= filters.end_date!
      );
    }

    if (filters.success !== undefined) {
      filteredEvents = filteredEvents.filter(event => 
        event.success === filters.success
      );
    }

    if (filters.ip_address) {
      filteredEvents = filteredEvents.filter(event => 
        event.ip_address === filters.ip_address
      );
    }

    const total = filteredEvents.length;
    
    // Paginação
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      events: filteredEvents.slice(startIndex, endIndex),
      total
    };
  }

  getStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentFailures: number;
  } {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    let recentFailures = 0;

    this.events.forEach(event => {
      // Contagem por tipo
      byType[event.event_type] = (byType[event.event_type] || 0) + 1;
      
      // Contagem por severidade
      bySeverity[event.severity] = (bySeverity[event.severity] || 0) + 1;
      
      // Falhas recentes
      if (!event.success && event.timestamp >= oneHourAgo) {
        recentFailures++;
      }
    });

    return {
      total: this.events.length,
      byType,
      bySeverity,
      recentFailures
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Instância global do store
const auditStore = new AuditStore();

// Função principal para registrar eventos
export function logAuditEvent(
  eventType: AuditEventType,
  options: {
    severity?: AuditSeverity;
    userId?: string;
    userEmail?: string;
    request?: NextRequest;
    resourceType?: string;
    resourceId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
    success?: boolean;
    errorMessage?: string;
  } = {}
): void {
  const {
    severity = AuditSeverity.MEDIUM,
    userId,
    userEmail,
    request,
    resourceType,
    resourceId,
    oldValues,
    newValues,
    metadata,
    success = true,
    errorMessage
  } = options;

  const event: AuditEvent = {
    event_type: eventType,
    severity,
    user_id: userId,
    user_email: userEmail,
    ip_address: request ? getClientIP(request) : undefined,
    user_agent: request?.headers.get('user-agent') || undefined,
    resource_type: resourceType,
    resource_id: resourceId,
    old_values: oldValues,
    new_values: newValues,
    metadata,
    timestamp: new Date(),
    success,
    error_message: errorMessage
  };

  auditStore.add(event);
  
  // Log crítico no console para desenvolvimento
  if (severity === AuditSeverity.CRITICAL) {
    console.error('CRITICAL AUDIT EVENT:', event);
  }
}

// Funções de conveniência para eventos comuns
export const auditLogger = {
  // Autenticação
  userLogin: (userId: string, userEmail: string, request: NextRequest, success: boolean = true) => {
    logAuditEvent(AuditEventType.USER_LOGIN, {
      severity: success ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
      userId,
      userEmail,
      request,
      success
    });
  },

  failedLogin: (email: string, request: NextRequest, reason?: string) => {
    logAuditEvent(AuditEventType.FAILED_LOGIN, {
      severity: AuditSeverity.MEDIUM,
      userEmail: email,
      request,
      success: false,
      errorMessage: reason,
      metadata: { attempt_time: new Date().toISOString() }
    });
  },

  // Receitas
  recipeCreated: (userId: string, recipeId: string, recipeData: Record<string, unknown>, request: NextRequest) => {
    logAuditEvent(AuditEventType.RECIPE_CREATE, {
      severity: AuditSeverity.LOW,
      userId,
      request,
      resourceType: 'recipe',
      resourceId: recipeId,
      newValues: recipeData
    });
  },

  recipeUpdated: (userId: string, recipeId: string, oldData: Record<string, unknown>, newData: Record<string, unknown>, request: NextRequest) => {
    logAuditEvent(AuditEventType.RECIPE_UPDATE, {
      severity: AuditSeverity.LOW,
      userId,
      request,
      resourceType: 'recipe',
      resourceId: recipeId,
      oldValues: oldData,
      newValues: newData
    });
  },

  recipeDeleted: (userId: string, recipeId: string, recipeData: Record<string, unknown>, request: NextRequest) => {
    logAuditEvent(AuditEventType.RECIPE_DELETE, {
      severity: AuditSeverity.MEDIUM,
      userId,
      request,
      resourceType: 'recipe',
      resourceId: recipeId,
      oldValues: recipeData
    });
  },

  // Segurança
  securityViolation: (request: NextRequest, violation: string, severity: AuditSeverity = AuditSeverity.HIGH) => {
    logAuditEvent(AuditEventType.SECURITY_VIOLATION, {
      severity,
      request,
      success: false,
      errorMessage: violation,
      metadata: {
        violation_type: violation,
        timestamp: new Date().toISOString()
      }
    });
  },

  rateLimitExceeded: (request: NextRequest, limit: number, window: number) => {
    logAuditEvent(AuditEventType.RATE_LIMIT_EXCEEDED, {
      severity: AuditSeverity.MEDIUM,
      request,
      success: false,
      metadata: {
        limit,
        window,
        timestamp: new Date().toISOString()
      }
    });
  },

  // Admin
  adminAction: (adminId: string, action: string, targetResource: string, targetId: string, request: NextRequest) => {
    logAuditEvent(AuditEventType.BULK_OPERATION, {
      severity: AuditSeverity.HIGH,
      userId: adminId,
      request,
      resourceType: targetResource,
      resourceId: targetId,
      metadata: {
        admin_action: action,
        timestamp: new Date().toISOString()
      }
    });
  }
};

// Função para buscar eventos
export function searchAuditEvents(filters: AuditSearchFilters) {
  return auditStore.search(filters);
}

// Função para obter estatísticas
export function getAuditStats() {
  return auditStore.getStats();
}

// Função para obter IP do cliente
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// Middleware para auditoria automática
export function withAuditLogging(
  handler: (request: NextRequest) => Promise<Response>,
  eventType: AuditEventType,
  options: {
    severity?: AuditSeverity;
    resourceType?: string;
    extractResourceId?: (request: NextRequest) => string;
    extractUserId?: (request: NextRequest) => Promise<string | undefined>;
  } = {}
) {
  return async (request: NextRequest): Promise<Response> => {
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;
    
    try {
      const response = await handler(request);
      success = response.ok;
      
      if (!success) {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      return response;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    } finally {
      // Log do evento
      const resourceId = options.extractResourceId?.(request);
      const userId = await options.extractUserId?.(request);
      
      logAuditEvent(eventType, {
        severity: options.severity,
        userId,
        request,
        resourceType: options.resourceType,
        resourceId,
        success,
        errorMessage,
        metadata: {
          duration_ms: Date.now() - startTime,
          method: request.method,
          url: request.url
        }
      });
    }
  };
}

// Função para exportar logs (para backup ou análise)
export function exportAuditLogs(filters?: AuditSearchFilters): string {
  const { events } = searchAuditEvents(filters || {});
  return JSON.stringify(events, null, 2);
}

// Função para limpar logs antigos
export function cleanupOldAuditLogs(daysToKeep: number = 30): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const initialCount = auditStore['events'].length;
  auditStore['events'] = auditStore['events'].filter(
    event => event.timestamp >= cutoffDate
  );
  
  return initialCount - auditStore['events'].length;
}
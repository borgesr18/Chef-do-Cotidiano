import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';

// Tipos de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogCategory = 
  | 'auth'
  | 'api'
  | 'database'
  | 'cache'
  | 'search'
  | 'upload'
  | 'security'
  | 'performance'
  | 'user'
  | 'system'
  | 'analytics';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  url?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  context?: {
    component?: string;
    function?: string;
    line?: number;
    file?: string;
  };
}

export interface LogFilter {
  level?: LogLevel[];
  category?: LogCategory[];
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  byCategory: Record<LogCategory, number>;
  errorRate: number;
  avgDuration?: number;
}

// Configuração do logger
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  enableRemote: boolean;
  maxStorageEntries: number;
  remoteEndpoint?: string;
  sensitiveFields: string[];
}

const DEFAULT_CONFIG: LoggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableConsole: process.env.NODE_ENV !== 'production',
  enableStorage: true,
  enableRemote: process.env.NODE_ENV === 'production',
  maxStorageEntries: 1000,
  remoteEndpoint: process.env.NEXT_PUBLIC_LOG_ENDPOINT,
  sensitiveFields: ['password', 'token', 'apiKey', 'secret', 'authorization']
};

// Níveis de log em ordem de prioridade
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

// Store de logs em memória
class LogStore {
  private logs: LogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 1000) {
    this.maxEntries = maxEntries;
    this.loadFromStorage();
  }

  add(entry: LogEntry): void {
    this.logs.unshift(entry);
    
    // Manter apenas o número máximo de entradas
    if (this.logs.length > this.maxEntries) {
      this.logs = this.logs.slice(0, this.maxEntries);
    }
    
    this.saveToStorage();
  }

  search(filter: LogFilter = {}): LogEntry[] {
    let filtered = [...this.logs];

    // Filtrar por nível
    if (filter.level && filter.level.length > 0) {
      filtered = filtered.filter(log => filter.level!.includes(log.level));
    }

    // Filtrar por categoria
    if (filter.category && filter.category.length > 0) {
      filtered = filtered.filter(log => filter.category!.includes(log.category));
    }

    // Filtrar por data
    if (filter.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filter.endDate!);
    }

    // Filtrar por usuário
    if (filter.userId) {
      filtered = filtered.filter(log => log.userId === filter.userId);
    }

    // Busca textual
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchLower) ||
        log.category.toLowerCase().includes(searchLower) ||
        (log.data && JSON.stringify(log.data).toLowerCase().includes(searchLower))
      );
    }

    // Paginação
    const offset = filter.offset || 0;
    const limit = filter.limit || 100;
    
    return filtered.slice(offset, offset + limit);
  }

  getStats(filter: LogFilter = {}): LogStats {
    const logs = this.search({ ...filter, limit: undefined, offset: undefined });
    
    const stats: LogStats = {
      total: logs.length,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0,
        fatal: 0
      },
      byCategory: {
        auth: 0,
        api: 0,
        database: 0,
        cache: 0,
        search: 0,
        upload: 0,
        security: 0,
        performance: 0,
        user: 0,
        system: 0,
        analytics: 0
      },
      errorRate: 0
    };

    logs.forEach(log => {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category]++;
    });

    const errorCount = stats.byLevel.error + stats.byLevel.fatal;
    stats.errorRate = logs.length > 0 ? (errorCount / logs.length) * 100 : 0;

    // Calcular duração média para logs de performance
    const performanceLogs = logs.filter(log => log.duration !== undefined);
    if (performanceLogs.length > 0) {
      const totalDuration = performanceLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      stats.avgDuration = totalDuration / performanceLogs.length;
    }

    return stats;
  }

  clear(): void {
    this.logs = [];
    this.saveToStorage();
  }

  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('chef-logs');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.logs = parsed.map((log: LogEntry) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (error) {
      console.warn('Erro ao carregar logs do storage:', error);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('chef-logs', JSON.stringify(this.logs));
    } catch (error) {
      console.warn('Erro ao salvar logs no storage:', error);
    }
  }
}

// Classe principal do Logger
class Logger {
  private config: LoggerConfig;
  private store: LogStore;
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.store = new LogStore(this.config.maxStorageEntries);
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private sanitizeData(data: unknown): unknown {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized: Record<string, unknown> = { ...data };
    
    this.config.sensitiveFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }

  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: Record<string, unknown>,
    context?: Partial<LogEntry>
  ): LogEntry {
    return {
      id: this.generateLogId(),
      timestamp: new Date(),
      level,
      category,
      message,
      data: data ? this.sanitizeData(data) as Record<string, unknown> : undefined,
      sessionId: this.sessionId,
      ...context
    };
  }

  private async writeLog(entry: LogEntry): Promise<void> {
    // Console output
    if (this.config.enableConsole) {
      const timestamp = format(entry.timestamp, 'HH:mm:ss.SSS');
      const prefix = `[${timestamp}] [${entry.level.toUpperCase()}] [${entry.category}]`;
      
      switch (entry.level) {
        case 'debug':
          console.debug(prefix, entry.message, entry.data);
          break;
        case 'info':
          console.info(prefix, entry.message, entry.data);
          break;
        case 'warn':
          console.warn(prefix, entry.message, entry.data);
          break;
        case 'error':
        case 'fatal':
          console.error(prefix, entry.message, entry.data, entry.error);
          break;
      }
    }

    // Storage local
    if (this.config.enableStorage) {
      this.store.add(entry);
    }

    // Envio remoto
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      try {
        await fetch(this.config.remoteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(entry)
        });
      } catch (error: unknown) {
        console.warn('Erro ao enviar log remoto:', error);
      }
    }
  }

  // Métodos públicos de logging
  debug(category: LogCategory, message: string, data?: Record<string, unknown>, context?: Partial<LogEntry>): void {
    if (!this.shouldLog('debug')) return;
    const entry = this.createLogEntry('debug', category, message, data, context);
    this.writeLog(entry);
  }

  info(category: LogCategory, message: string, data?: Record<string, unknown>, context?: Partial<LogEntry>): void {
    if (!this.shouldLog('info')) return;
    const entry = this.createLogEntry('info', category, message, data, context);
    this.writeLog(entry);
  }

  warn(category: LogCategory, message: string, data?: Record<string, unknown>, context?: Partial<LogEntry>): void {
    if (!this.shouldLog('warn')) return;
    const entry = this.createLogEntry('warn', category, message, data, context);
    this.writeLog(entry);
  }

  error(category: LogCategory, message: string, error?: Error, data?: Record<string, unknown>, context?: Partial<LogEntry>): void {
    if (!this.shouldLog('error')) return;
    const entry = this.createLogEntry('error', category, message, data, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
    this.writeLog(entry);
  }

  fatal(category: LogCategory, message: string, error?: Error, data?: Record<string, unknown>, context?: Partial<LogEntry>): void {
    const entry = this.createLogEntry('fatal', category, message, data, {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    });
    this.writeLog(entry);
  }

  // Métodos de conveniência
  logApiRequest(method: string, url: string, statusCode: number, duration: number, userId?: string): void {
    this.info('api', `${method} ${url}`, {
      method,
      url,
      statusCode,
      duration
    }, {
      userId,
      method,
      url,
      statusCode,
      duration
    });
  }

  logUserAction(action: string, userId: string, data?: Record<string, unknown>): void {
    this.info('user', `User action: ${action}`, {
      action,
      ...data
    }, {
      userId
    });
  }

  logSecurityEvent(event: string, severity: 'warn' | 'error' | 'fatal', data?: Record<string, unknown>): void {
    this[severity]('security', `Security event: ${event}`, undefined, { data });
  }

  logPerformance(operation: string, duration: number, data?: Record<string, unknown>): void {
    const level = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    this[level]('performance', `Performance: ${operation}`, {
      operation,
      duration,
      ...data
    }, {
      duration
    });
  }

  // Métodos de consulta
  search(filter: LogFilter = {}): LogEntry[] {
    return this.store.search(filter);
  }

  getStats(filter: LogFilter = {}): LogStats {
    return this.store.getStats(filter);
  }

  export(): string {
    return this.store.export();
  }

  clear(): void {
    this.store.clear();
  }

  // Configuração
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }
}

// Instância global do logger
export const logger = new Logger();

// Hook para usar o logger em componentes React
export const useLogger = () => {
  return {
    logger,
    search: (filter: LogFilter) => logger.search(filter),
    getStats: (filter: LogFilter) => logger.getStats(filter),
    export: () => logger.export(),
    clear: () => logger.clear()
  };
};

// Middleware para logging automático de requisições
export const withLogging = (handler: (req: Request, res: Response) => Promise<Response>) => {
  return async (req: Request, res: Response) => {
    const start = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log da requisição
    logger.info('api', `Incoming request: ${req.method} ${req.url}`, {
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent') ?? undefined,
      ip: 'unknown'
    }, {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.headers.get('user-agent') ?? undefined,
      ip: 'unknown'
    });

    try {
      const result = await handler(req, res);
      const duration = Date.now() - start;
      
      // Log da resposta
      logger.logApiRequest(
        req.method,
        req.url,
        200,
        duration,
        undefined
      );
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      
      // Log do erro
      logger.error('api', `Request failed: ${req.method} ${req.url}`, error as Error, {
        method: req.method,
        url: req.url,
        duration
      }, {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: 500,
        duration
      });
      
      throw error;
    }
  };
};

export default logger;
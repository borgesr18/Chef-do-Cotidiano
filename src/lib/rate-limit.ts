import { NextRequest } from 'next/server';

// Interface para configuração de rate limiting
interface RateLimitConfig {
  windowMs: number; // Janela de tempo em milissegundos
  maxRequests: number; // Máximo de requests por janela
  message?: string; // Mensagem de erro personalizada
  skipSuccessfulRequests?: boolean; // Pular requests bem-sucedidos
  skipFailedRequests?: boolean; // Pular requests com falha
}

// Interface para armazenamento de rate limit
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Store em memória (em produção, usar Redis ou similar)
const store: RateLimitStore = {};

// Configurações padrão para diferentes tipos de endpoints
export const rateLimitConfigs = {
  // APIs públicas (busca, listagem)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100,
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  },
  
  // APIs de autenticação
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  
  // APIs de criação/modificação
  mutation: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10,
    message: 'Muitas operações. Aguarde 1 minuto antes de tentar novamente.'
  },
  
  // APIs administrativas
  admin: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20,
    message: 'Limite de operações administrativas excedido.'
  },
  
  // Upload de arquivos
  upload: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 3,
    message: 'Muitos uploads. Aguarde 1 minuto antes de tentar novamente.'
  }
} as const;

// Função para obter identificador único do cliente
function getClientId(request: NextRequest): string {
  // Priorizar IP real em produção
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  // Adicionar User-Agent para maior precisão
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  return `${ip}:${userAgent.slice(0, 50)}`;
}

// Função principal de rate limiting
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest) => {
    const clientId = getClientId(request);
    const now = Date.now();
    const key = `${clientId}:${request.nextUrl.pathname}`;
    
    // Limpar entradas expiradas
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
    
    // Inicializar ou incrementar contador
    if (!store[key]) {
      store[key] = {
        count: 1,
        resetTime: now + config.windowMs
      };
    } else {
      store[key].count++;
    }
    
    const { count, resetTime } = store[key];
    const isLimited = count > config.maxRequests;
    const resetTimeSeconds = Math.ceil((resetTime - now) / 1000);
    
    return {
      success: !isLimited,
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - count),
      reset: resetTimeSeconds,
      retryAfter: isLimited ? resetTimeSeconds : undefined,
      message: isLimited ? config.message : undefined
    };
  };
}

// Middleware para Next.js API routes
export function createRateLimitMiddleware(configKey: keyof typeof rateLimitConfigs) {
  const config = rateLimitConfigs[configKey];
  const limiter = rateLimit(config);
  
  return async (request: NextRequest) => {
    const result = await limiter(request);
    
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: result.message,
          retryAfter: result.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.reset.toString(),
            'Retry-After': result.retryAfter?.toString() || '60'
          }
        }
      );
    }
    
    return null; // Continuar com a requisição
  };
}

// Hook para usar rate limiting em componentes
export function useRateLimit() {
  const checkRateLimit = async (endpoint: string, configKey: keyof typeof rateLimitConfigs = 'public') => {
    try {
      const response = await fetch(`/api/rate-limit-check?endpoint=${endpoint}&config=${configKey}`);
      const data = await response.json();
      
      return {
        allowed: response.ok,
        remaining: data.remaining,
        reset: data.reset,
        message: data.message
      };
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { allowed: true, remaining: 0, reset: 0 };
    }
  };
  
  return { checkRateLimit };
}

// Utilitário para limpar store (útil para testes)
export function clearRateLimitStore() {
  Object.keys(store).forEach(key => delete store[key]);
}

// Utilitário para obter estatísticas do rate limit
export function getRateLimitStats() {
  const now = Date.now();
  const activeEntries = Object.entries(store)
    .filter(([, data]) => now <= data.resetTime)
    .length;
  
  return {
    totalEntries: Object.keys(store).length,
    activeEntries,
    expiredEntries: Object.keys(store).length - activeEntries
  };
}

// Função para verificar rate limit (usada no middleware)
export async function checkRateLimit(
  request: NextRequest, 
  configKey: keyof typeof rateLimitConfigs
) {
  const config = rateLimitConfigs[configKey];
  const limiter = rateLimit(config);
  const result = await limiter(request);
  
  return {
    allowed: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
    retryAfter: result.retryAfter,
    window: config.windowMs
  };
}

// Configuração para diferentes ambientes
export const getEnvironmentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  // const isProduction = process.env.NODE_ENV === 'production';
  
  if (isDevelopment) {
    // Limites mais relaxados em desenvolvimento
    return {
      public: { ...rateLimitConfigs.public, maxRequests: 1000 },
      auth: { ...rateLimitConfigs.auth, maxRequests: 50 },
      mutation: { ...rateLimitConfigs.mutation, maxRequests: 100 },
      admin: { ...rateLimitConfigs.admin, maxRequests: 200 },
      upload: { ...rateLimitConfigs.upload, maxRequests: 30 }
    };
  }
  
  return rateLimitConfigs;
};
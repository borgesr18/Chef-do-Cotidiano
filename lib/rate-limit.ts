import { NextRequest, NextResponse } from 'next/server'

// Interface para configuração do rate limiter
interface RateLimitConfig {
  windowMs: number // Janela de tempo em milissegundos
  maxRequests: number // Máximo de requests por janela
  message?: string // Mensagem de erro personalizada
  skipSuccessfulRequests?: boolean // Pular requests bem-sucedidos
  skipFailedRequests?: boolean // Pular requests com falha
}

// Store para armazenar contadores de rate limit
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Função para limpar entradas expiradas
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

// Função para obter identificador único do cliente
function getClientIdentifier(request: NextRequest): string {
  // Prioridade: IP real > IP do header > IP de fallback
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ip = realIp || forwarded?.split(',')[0] || 'unknown'
  
  // Para usuários autenticados, usar user ID se disponível
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    try {
      // Extrair user ID do token se possível (implementação simplificada)
      const token = authHeader.replace('Bearer ', '')
      // Em produção, você decodificaria o JWT aqui
      return `user:${token.slice(0, 10)}` // Usar parte do token como ID
    } catch {
      // Fallback para IP se não conseguir extrair user ID
    }
  }
  
  return `ip:${ip}`
}

// Middleware principal de rate limiting
export function createRateLimit(config: RateLimitConfig) {
  return async function rateLimit(request: NextRequest): Promise<NextResponse | null> {
    // Limpar entradas expiradas periodicamente
    if (Math.random() < 0.1) { // 10% de chance a cada request
      cleanupExpiredEntries()
    }

    const identifier = getClientIdentifier(request)
    const now = Date.now()
    // const windowStart = now
    const windowEnd = now + config.windowMs

    // Obter ou criar entrada para este cliente
    let entry = rateLimitStore.get(identifier)
    
    if (!entry || now > entry.resetTime) {
      // Criar nova entrada ou resetar se expirou
      entry = {
        count: 0,
        resetTime: windowEnd
      }
      rateLimitStore.set(identifier, entry)
    }

    // Incrementar contador
    entry.count++

    // Verificar se excedeu o limite
    if (entry.count > config.maxRequests) {
      const resetTime = Math.ceil((entry.resetTime - now) / 1000)
      
      return NextResponse.json(
        {
          error: config.message || 'Muitas tentativas. Tente novamente mais tarde.',
          retryAfter: resetTime,
          limit: config.maxRequests,
          windowMs: config.windowMs
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString(),
            'Retry-After': resetTime.toString()
          }
        }
      )
    }

    // Adicionar headers informativos
    // const remaining = Math.max(0, config.maxRequests - entry.count)
    
    // Retornar null indica que o request pode prosseguir
    // Os headers serão adicionados pela função wrapper
    return null
  }
}

// Configurações predefinidas para diferentes tipos de endpoints
export const rateLimitConfigs = {
  // APIs públicas (busca, listagem)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 100, // 100 requests por 15 min
    message: 'Muitas consultas. Tente novamente em alguns minutos.'
  },
  
  // APIs de autenticação
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    maxRequests: 5, // 5 tentativas por 15 min
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  
  // APIs de criação/modificação
  mutation: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 10, // 10 requests por minuto
    message: 'Muitas ações. Aguarde um momento antes de tentar novamente.'
  },
  
  // APIs de upload
  upload: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 3, // 3 uploads por minuto
    message: 'Limite de uploads atingido. Tente novamente em um minuto.'
  },
  
  // APIs administrativas
  admin: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20, // 20 requests por minuto
    message: 'Limite de ações administrativas atingido.'
  }
}

// Interface para contexto de route handlers (Next.js 15)
interface RouteContext {
  params: Promise<Record<string, string | string[]>>
}

// Função helper para aplicar rate limiting em route handlers
export function withRateLimit(
  handler: (request: NextRequest, context?: RouteContext) => Promise<NextResponse>,
  config: RateLimitConfig
) {
  const rateLimit = createRateLimit(config)
  
  return async function rateLimitedHandler(
    request: NextRequest,
    context?: RouteContext
  ): Promise<NextResponse> {
    // Aplicar rate limiting
    const rateLimitResponse = await rateLimit(request)
    
    if (rateLimitResponse) {
      // Rate limit excedido
      return rateLimitResponse
    }
    
    // Executar handler original
    const response = await handler(request, context)
    
    // Adicionar headers de rate limit à resposta
    const identifier = getClientIdentifier(request)
    const entry = rateLimitStore.get(identifier)
    
    if (entry) {
      const remaining = Math.max(0, config.maxRequests - entry.count)
      response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', entry.resetTime.toString())
    }
    
    return response
  }
}

// Função para obter estatísticas do rate limiter (útil para debugging)
export function getRateLimitStats() {
  cleanupExpiredEntries()
  
  return {
    totalEntries: rateLimitStore.size,
    entries: Array.from(rateLimitStore.entries()).map(([key, value]) => ({
      identifier: key,
      count: value.count,
      resetTime: new Date(value.resetTime).toISOString(),
      remaining: Math.max(0, rateLimitConfigs.public.maxRequests - value.count)
    }))
  }
}
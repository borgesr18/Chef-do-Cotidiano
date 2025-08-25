// Configurações de segurança centralizadas

// Content Security Policy
export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-eval'", // Necessário para Next.js dev
    "'unsafe-inline'", // Necessário para alguns componentes
    'https://va.vercel-scripts.com', // Vercel Analytics
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Necessário para Tailwind e styled-components
    'https://fonts.googleapis.com',
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://va.vercel-scripts.com',
  ],
  'media-src': [
    "'self'",
    'https:',
    'data:',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

// Gerar string CSP
export function generateCSP(): string {
  return Object.entries(cspDirectives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

// Headers de segurança padrão
export const securityHeaders = {
  // Previne ataques XSS
  'X-XSS-Protection': '1; mode=block',
  
  // Previne MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // Previne clickjacking
  'X-Frame-Options': 'DENY',
  
  // Força HTTPS em produção
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Controla referrer information
  'Referrer-Policy': 'origin-when-cross-origin',
  
  // Permissions Policy (Feature Policy)
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'interest-cohort=()', // Previne FLoC
  ].join(', '),
};

// CORS configuration
export const corsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Substitua pelo seu domínio
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400, // 24 horas
};

// Rate limiting configuration por tipo de endpoint
export const rateLimitConfig = {
  // APIs públicas (busca, listagem)
  public: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // 100 requests por IP
  },
  
  // APIs de mutação (criar, atualizar, deletar)
  mutation: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // 50 requests por IP
  },
  
  // APIs de autenticação
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 tentativas por IP
  },
  
  // APIs administrativas
  admin: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // 20 requests por IP
  },
};

// Função para validar origem CORS
export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  const allowedOrigins = corsConfig.origin;
  return allowedOrigins.includes(origin);
}

// Função para sanitizar headers
export function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  Object.entries(headers).forEach(([key, value]) => {
    // Remove caracteres perigosos
    const sanitizedKey = key.replace(/[^\w-]/g, '');
    const sanitizedValue = value.replace(/[\r\n]/g, '');
    
    if (sanitizedKey && sanitizedValue) {
      sanitized[sanitizedKey] = sanitizedValue;
    }
  });
  
  return sanitized;
}

// Função para gerar nonce para CSP
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Buffer.from(array).toString('base64');
}
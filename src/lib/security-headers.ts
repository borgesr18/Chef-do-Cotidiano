import { NextRequest, NextResponse } from 'next/server';

// Configurações de headers de segurança
export const securityHeaders = {
  // Content Security Policy - previne XSS
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' blob:",
    "connect-src 'self' https: wss:",
    "frame-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),

  // Previne clickjacking
  'X-Frame-Options': 'DENY',

  // Previne MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Força HTTPS
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',

  // Controla informações do referrer
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Previne XSS
  'X-XSS-Protection': '1; mode=block',

  // Controla recursos que podem ser carregados
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=(self)',
    'interest-cohort=()'
  ].join(', '),

  // Remove informações do servidor
  'X-Powered-By': '',
  'Server': ''
};

// Headers específicos para APIs
export const apiSecurityHeaders = {
  ...securityHeaders,
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Headers para upload de arquivos
export const uploadSecurityHeaders = {
  ...securityHeaders,
  'X-Content-Type-Options': 'nosniff',
  'Content-Disposition': 'attachment'
};

// Middleware para aplicar headers de segurança
export function withSecurityHeaders(response: NextResponse, type: 'page' | 'api' | 'upload' = 'page'): NextResponse {
  let headers: Record<string, string>;
  
  switch (type) {
    case 'api':
      headers = apiSecurityHeaders;
      break;
    case 'upload':
      headers = uploadSecurityHeaders;
      break;
    default:
      headers = securityHeaders;
  }

  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    } else {
      response.headers.delete(key);
    }
  });

  return response;
}

// Função para criar response com headers de segurança
export function createSecureResponse(
  data: string | number | boolean,
  status: number = 200,
  type: 'page' | 'api' | 'upload' = 'api'
): NextResponse {
  const response = NextResponse.json(data, { status });
  return withSecurityHeaders(response, type);
}

// Middleware para validar origem das requisições
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  
  // Lista de origens permitidas
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://chef-do-cotidiano.vercel.app',
    process.env.NEXT_PUBLIC_APP_URL
  ].filter(Boolean);

  // Se não há origem (requisições diretas), permite
  if (!origin) return true;
  
  // Verifica se a origem está na lista permitida
  return allowedOrigins.includes(origin) || origin.includes(host || '');
}

// Middleware para validar User-Agent
export function validateUserAgent(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent');
  
  // Bloqueia bots maliciosos conhecidos
  const blockedAgents = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'zap',
    'gobuster',
    'dirb'
  ];
  
  if (!userAgent) return false;
  
  return !blockedAgents.some(agent => 
    userAgent.toLowerCase().includes(agent)
  );
}

// Middleware para detectar ataques de força bruta
const attemptTracker = new Map<string, { count: number; lastAttempt: number }>();

export function detectBruteForce(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutos
): boolean {
  const now = Date.now();
  const attempts = attemptTracker.get(identifier);
  
  if (!attempts) {
    attemptTracker.set(identifier, { count: 1, lastAttempt: now });
    return false;
  }
  
  // Reset se passou da janela de tempo
  if (now - attempts.lastAttempt > windowMs) {
    attemptTracker.set(identifier, { count: 1, lastAttempt: now });
    return false;
  }
  
  // Incrementa tentativas
  attempts.count++;
  attempts.lastAttempt = now;
  
  return attempts.count > maxAttempts;
}

// Limpa tentativas antigas
export function cleanupBruteForceTracker(): void {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  
  for (const [key, attempts] of attemptTracker.entries()) {
    if (now - attempts.lastAttempt > windowMs) {
      attemptTracker.delete(key);
    }
  }
}

// Middleware de segurança completo
export function securityMiddleware(request: NextRequest): NextResponse | null {
  // Valida origem
  if (!validateOrigin(request)) {
    return createSecureResponse(
      'Origin not allowed',
      403
    );
  }
  
  // Valida User-Agent
  if (!validateUserAgent(request)) {
    return createSecureResponse(
      'Invalid user agent',
      403
    );
  }
  
  // Detecta força bruta por IP
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (detectBruteForce(ip, 10, 5 * 60 * 1000)) { // 10 tentativas em 5 minutos
    return createSecureResponse(
      'Too many requests',
      429
    );
  }
  
  return null; // Continua processamento
}

// Headers CORS seguros
export function setCorsHeaders(response: NextResponse, origin?: string): NextResponse {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://chef-do-cotidiano.vercel.app',
    process.env.NEXT_PUBLIC_APP_URL
  ].filter(Boolean);
  
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  }
  
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

// Sanitização de entrada
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>"'&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .trim();
}

// Validação de token CSRF
export function validateCsrfToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token');
  const cookie = request.cookies.get('csrf-token')?.value;
  
  return token === cookie && token !== undefined;
}

// Geração de token CSRF
export function generateCsrfToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
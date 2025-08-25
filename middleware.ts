import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from './src/lib/rate-limit';
import { 
  withSecurityHeaders, 
  securityMiddleware, 
  setCorsHeaders,
  validateOrigin,
  validateUserAgent
} from './src/lib/security-headers';
import { auditLogger, AuditSeverity } from './src/lib/audit';

// Rotas que precisam de autenticação
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/recipes/create',
  '/recipes/edit',
  '/admin'
];

// Rotas de API que precisam de rate limiting mais restritivo
const restrictedApiRoutes = [
  '/api/auth',
  '/api/upload',
  '/api/admin'
];

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/recipes',
  '/categories',
  '/about',
  '/contact',
  '/login',
  '/register'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');
  
  // Aplicar headers de segurança básicos
  let response = NextResponse.next();
  
  try {
    // 1. Validações de segurança básicas
    const securityCheck = securityMiddleware(request);
    if (securityCheck) {
      return securityCheck;
    }

    // 2. Rate limiting
    const rateLimitResult = await applyRateLimit(request, pathname);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // 3. Autenticação para rotas protegidas
    const authCheck = await checkAuthentication(request, pathname);
    if (authCheck) {
      return authCheck;
    }

    // 4. Middleware específico para APIs
    if (pathname.startsWith('/api/')) {
      response = await handleApiRequest(request, pathname);
    }

    // 5. Aplicar headers de segurança
    const responseType = pathname.startsWith('/api/') ? 'api' : 'page';
    response = withSecurityHeaders(response, responseType);

    // 6. Aplicar CORS se necessário
    if (origin && pathname.startsWith('/api/')) {
      response = setCorsHeaders(response, origin);
    }

    return response;

  } catch (error) {
    // Log de erro crítico
    auditLogger.securityViolation(
      request,
      `Middleware error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      AuditSeverity.CRITICAL
    );

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Função para aplicar rate limiting baseado na rota
async function applyRateLimit(request: NextRequest, pathname: string): Promise<NextResponse | null> {
  let rateLimitType: 'public' | 'auth' | 'mutation' | 'admin' | 'upload' = 'public';
  
  // Determinar tipo de rate limit baseado na rota
  if (pathname.startsWith('/api/admin')) {
    rateLimitType = 'admin';
  } else if (pathname.startsWith('/api/upload')) {
    rateLimitType = 'upload';
  } else if (restrictedApiRoutes.some(route => pathname.startsWith(route))) {
    rateLimitType = 'auth';
  } else if (request.method !== 'GET') {
    rateLimitType = 'mutation';
  }

  const rateLimitResult = await checkRateLimit(request, rateLimitType);
  
  if (!rateLimitResult.allowed) {
    // Log da violação de rate limit
    auditLogger.rateLimitExceeded(
      request,
      rateLimitResult.limit,
      rateLimitResult.window
    );

    return NextResponse.json(
      {
        error: 'Rate limit exceeded',
        retryAfter: rateLimitResult.retryAfter
      },
      {
        status: 429,
        headers: {
          'Retry-After': rateLimitResult.retryAfter?.toString() || '60'
        }
      }
    );
  }

  return null;
}

// Função para verificar autenticação
async function checkAuthentication(request: NextRequest, pathname: string): Promise<NextResponse | null> {
  // Verificar se a rota precisa de autenticação
  const needsAuth = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!needsAuth) {
    return null;
  }

  // Verificar token de autenticação
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirecionar para login se for uma página
    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Retornar erro para APIs
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Aqui você validaria o token com seu sistema de auth
  // Por enquanto, assumimos que o token é válido se existir
  const isValidToken = await validateAuthToken(token);
  
  if (!isValidToken) {
    // Log de tentativa de acesso com token inválido
    auditLogger.securityViolation(
      request,
      'Invalid authentication token',
      AuditSeverity.HIGH
    );

    if (!pathname.startsWith('/api/')) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  return null;
}

// Função para lidar com requisições de API
async function handleApiRequest(request: NextRequest, pathname: string): Promise<NextResponse> {
  const response = NextResponse.next();

  // Adicionar headers específicos para APIs
  response.headers.set('X-API-Version', '1.0');
  response.headers.set('X-Request-ID', generateRequestId());

  // Validações específicas para uploads
  if (pathname.startsWith('/api/upload')) {
    const contentLength = request.headers.get('content-length');
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength && parseInt(contentLength) > maxSize) {
      auditLogger.securityViolation(
        request,
        `File too large: ${contentLength} bytes`,
        AuditSeverity.MEDIUM
      );

      return NextResponse.json(
        { error: 'File too large' },
        { status: 413 }
      );
    }
  }

  // Validações para rotas de admin
  if (pathname.startsWith('/api/admin')) {
    const isAdmin = await checkAdminPermissions(request);
    
    if (!isAdmin) {
      auditLogger.securityViolation(
        request,
        'Unauthorized admin access attempt',
        AuditSeverity.HIGH
      );

      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  }

  return response;
}

// Função para validar token de autenticação
async function validateAuthToken(token: string): Promise<boolean> {
  try {
    // Aqui você implementaria a validação real do token
    // Por exemplo, verificar JWT, consultar banco de dados, etc.
    
    // Simulação de validação
    if (!token || token.length < 10) {
      return false;
    }

    // Em produção, você faria algo como:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // return !!decoded;
    
    return true;
  } catch (error) {
    return false;
  }
}

// Função para verificar permissões de admin
async function checkAdminPermissions(request: NextRequest): Promise<boolean> {
  try {
    const token = request.cookies.get('auth-token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return false;
    }

    // Aqui você verificaria se o usuário tem permissões de admin
    // Por exemplo, decodificar JWT e verificar role
    
    // Simulação
    return token.includes('admin'); // Muito simplificado!
  } catch (error) {
    return false;
  }
}

// Função para gerar ID único da requisição
function generateRequestId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Configuração do matcher para definir em quais rotas o middleware deve rodar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public|sw.js|manifest.json|icons).*)',
  ],
};

// Função para lidar com requisições OPTIONS (CORS preflight)
export function handleOptionsRequest(request: NextRequest): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  
  const origin = request.headers.get('origin');
  if (origin && validateOrigin(request)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  
  return response;
}
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

  // Bloquear acesso a /admin para não logados
  if (isAdminRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Bloquear acesso a /admin se não for admin (opcional: refine com role no user_metadata)
  if (isAdminRoute && session?.user?.user_metadata?.tipo !== 'admin') {
    return NextResponse.redirect(new URL('/nao-autorizado', req.url));
  }

  return res;
}

// Aplicar middleware apenas às rotas protegidas
export const config = {
  matcher: ['/admin/:path*'],
};

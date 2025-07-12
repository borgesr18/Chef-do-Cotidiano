import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = req.nextUrl.clone();

  if (!user) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('tipo')
    .eq('id', user.id)
    .single();

  if (req.nextUrl.pathname.startsWith('/admin') && perfil?.tipo !== 'ADMIN') {
    url.pathname = '/aluno/dashboard';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/aluno/:path*'],
};

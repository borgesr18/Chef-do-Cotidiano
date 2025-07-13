//app/api/verificar-certificado/route.ts — Audita acessos a certificados públicos
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { certificadoId } = await req.json();
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('host');
    const timestamp = new Date().toISOString();

    await supabase.from('acessos_certificados').insert({
      certificadoId,
      ip,
      acessado_em: timestamp
    });

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 });
  }
}

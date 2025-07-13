//app/api/emitir-certificado/route.ts — Gera certificado público ao concluir curso
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    const { cursoId, userId } = await req.json();
    const id = uuidv4();

    const { data: user } = await supabase
      .from('usuarios')
      .select('nome')
      .eq('id', userId)
      .single();

    const { data: curso } = await supabase
      .from('cursos')
      .select('titulo, autor')
      .eq('id', cursoId)
      .single();

    const { error: insertError } = await supabase.from('certificados_publicos').insert({
      id,
      user: { nome: user?.nome },
      curso,
      criado_em: new Date().toISOString(),
    });

    if (insertError) throw insertError;

    return NextResponse.json({ url: `${process.env.NEXT_PUBLIC_BASE_URL}/certificado/${id}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno do servidor' }, { status: 500 });
  }
}

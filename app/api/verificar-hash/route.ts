//app/api/verificar-hash/route.ts

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: Request) {
  try {
    const { token, email, hashInformado } = await req.json();

    if (!token || !email || !hashInformado) {
      return NextResponse.json({ erro: 'Dados incompletos' }, { status: 400 });
    }

    const hashEsperado = crypto.createHash('sha256').update(token + email).digest('hex');

    const valido = hashInformado === hashEsperado;

    return NextResponse.json({ valido });
  } catch (error) {
    console.error('Erro na verificação do hash:', error);
    return NextResponse.json({ erro: 'Erro interno no servidor' }, { status: 500 });
  }
}

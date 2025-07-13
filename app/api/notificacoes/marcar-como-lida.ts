// API: /api/notificacoes/marcar-como-lida.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { id } = await req.json();

  if (!id) return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 });

  // await prisma.notificacao.update({
  //   where: { id },
  //   data: { lida: true }
  // });

  return NextResponse.json({ ok: true });
}

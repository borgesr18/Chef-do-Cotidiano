//app/api/respostas/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUsuarioAutenticado } from '@/lib/auth';
import { notificarUsuario } from '@/lib/notificar';

export async function POST(req: NextRequest) {
  const usuario = await getUsuarioAutenticado();
  if (!usuario) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });

  const { comentarioId, texto } = await req.json();

  const comentario = await prisma.comentario.findUnique({
    where: { id: comentarioId },
    include: { autor: true },
  });

  if (!comentario) return NextResponse.json({ erro: 'Comentário não encontrado' }, { status: 404 });

  const resposta = await prisma.respostaComentario.create({
    data: {
      texto,
      comentarioId,
      userId: usuario.id,
    },
  });

  if (comentario.userId !== usuario.id) {
    await notificarUsuario({
      userId: comentario.userId,
      titulo: `Nova resposta ao seu comentário`,
      mensagem: `${usuario.nome} respondeu: "${texto}"`,
      tipo: 'resposta',
    });
  }

  return NextResponse.json({ sucesso: true, resposta });
}

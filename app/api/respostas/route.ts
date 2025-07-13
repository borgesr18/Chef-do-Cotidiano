//app/api/respostas/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notificarUsuario } from '@/lib/notificar';
import { createSupabaseEdgeClient } from '@/lib/auth-edge';

async function getUsuarioAutenticadoEdge() {
  const supabase = createSupabaseEdgeClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const usuario = await prisma.usuario.findUnique({
    where: { email: user.email! },
  });

  return usuario;
}

export async function POST(req: NextRequest) {
  const usuario = await getUsuarioAutenticadoEdge();
  if (!usuario) return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });

  const { comentarioId, texto } = await req.json();

  const comentario = await prisma.comentario.findUnique({
    where: { id: comentarioId },
    include: { usuario: true },
  });

  if (!comentario) return NextResponse.json({ erro: 'Comentário não encontrado' }, { status: 404 });

  const resposta = await prisma.comentario.create({
    data: {
      mensagem: `@${comentario.usuario.nome}: ${texto}`,
      usuarioId: usuario.id,
      aulaId: comentario.aulaId,
    },
  });

  if (comentario.usuarioId !== usuario.id) {
    await notificarUsuario({
      userId: comentario.usuarioId,
      titulo: `Nova resposta ao seu comentário`,
      mensagem: `${usuario.nome} respondeu: "${texto}"`,
      tipo: 'RESPOSTA',
    });
  }

  return NextResponse.json({ sucesso: true, resposta });
}

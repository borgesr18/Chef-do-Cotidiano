// app/api/comentarios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notificarUsuario } from '@/lib/notificar';
import { createSupabaseEdgeClient } from '@/lib/auth-edge';

async function getUsuarioAutenticadoEdge() {
  const supabase = createSupabaseEdgeClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Aqui você pode complementar com dados do usuário no banco (opcional)
  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
  });

  return usuario;
}

export async function POST(req: NextRequest) {
  const usuario = await getUsuarioAutenticadoEdge();

  if (!usuario) {
    return NextResponse.json({ erro: 'Não autenticado' }, { status: 401 });
  }

  const body = await req.json();
  const { receitaId, texto } = body;

  if (!texto || !receitaId) {
    return NextResponse.json({ erro: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  // 🔥 Criar o comentário
  const comentario = await prisma.comentario.create({
    data: {
      texto,
      receitaId,
      userId: usuario.id,
    },
    include: {
      receita: {
        select: {
          titulo: true,
          autorId: true,
        },
      },
    },
  });

  // 🔔 Notificar o autor da receita (se não for o próprio autor comentando)
  if (comentario.receita.autorId && comentario.receita.autorId !== usuario.id) {
    await notificarUsuario({
      userId: comentario.receita.autorId,
      titulo: `Novo comentário em sua receita: ${comentario.receita.titulo}`,
      mensagem: `O usuário ${usuario.nome} comentou: "${texto}"`,
      tipo: 'comentario',
    });
  }

  return NextResponse.json({ sucesso: true, comentario });
}

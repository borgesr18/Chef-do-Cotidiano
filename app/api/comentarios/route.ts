// app/api/comentarios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notificarUsuario } from '@/lib/notificar';
import { createSupabaseEdgeClient } from '@/lib/auth-edge';

// Garante que estamos rodando no ambiente correto (Node.js)
export const runtime = 'nodejs';

async function getUsuarioAutenticadoEdge() {
  const supabase = createSupabaseEdgeClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Busca o usuário no banco pelo ID do Supabase
  const usuario = await prisma.usuario.findUnique({
    where: { id: user.id },
  });

  return usuario;
}

export async function POST(req: NextRequest) {
  try {
    const usuario = await getUsuarioAutenticadoEdge();

    if (!usuario) {
      return NextResponse.json({ erro: 'Usuário não autenticado' }, { status: 401 });
    }

    const body = await req.json();
    const { receitaId, texto } = body;

    // Validações básicas
    if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
      return NextResponse.json({ erro: 'O texto do comentário é obrigatório' }, { status: 400 });
    }

    if (!receitaId) {
      return NextResponse.json({ erro: 'ID da receita é obrigatório' }, { status: 400 });
    }

    // Verifica se a receita existe
    const receita = await prisma.receita.findUnique({
      where: { id: receitaId },
    });

    if (!receita) {
      return NextResponse.json({ erro: 'Receita não encontrada' }, { status: 404 });
    }

    // Cria o comentário
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

    // Notifica o autor da receita (se não for o próprio autor comentando)
    if (comentario.receita.autorId && comentario.receita.autorId !== usuario.id) {
      await notificarUsuario({
        userId: comentario.receita.autorId,
        titulo: `Novo comentário na sua receita: ${comentario.receita.titulo}`,
        mensagem: `O usuário ${usuario.nome} comentou: "${texto}"`,
        tipo: 'comentario',
      });
    }

    return NextResponse.json({ sucesso: true, comentario }, { status: 201 });

  } catch (erro: any) {
    console.error('Erro ao criar comentário:', erro);
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 });
  }
}

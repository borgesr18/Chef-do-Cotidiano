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
    const { aulaId, texto } = body;

    // Validações básicas
    if (!texto || typeof texto !== 'string' || texto.trim().length === 0) {
      return NextResponse.json({ erro: 'O texto do comentário é obrigatório' }, { status: 400 });
    }

    if (!aulaId) {
      return NextResponse.json({ erro: 'ID da aula é obrigatório' }, { status: 400 });
    }

    // Verifica se a aula existe
    const aula = await prisma.aula.findUnique({
      where: { id: aulaId },
      include: {
        curso: {
          select: {
            titulo: true,
            autorId: true,
          },
        },
      },
    });

    if (!aula) {
      return NextResponse.json({ erro: 'Aula não encontrada' }, { status: 404 });
    }

    // Cria o comentário
    const comentario = await prisma.comentario.create({
      data: {
        mensagem: texto,
        aulaId,
        usuarioId: usuario.id,
      },
      include: {
        aula: {
          include: {
            curso: {
              select: {
                titulo: true,
                autorId: true,
              },
            },
          },
        },
      },
    });

    // Notifica o autor do curso (se não for o próprio autor comentando)
    if (comentario.aula.curso.autorId && comentario.aula.curso.autorId !== usuario.id) {
      await notificarUsuario({
        userId: comentario.aula.curso.autorId,
        titulo: `Novo comentário na aula: ${aula.titulo}`,
        mensagem: `O usuário ${usuario.nome} comentou: "${texto}"`,
        tipo: 'COMENTARIO',
      });
    }

    return NextResponse.json({ sucesso: true, comentario }, { status: 201 });

  } catch (erro: any) {
    console.error('Erro ao criar comentário:', erro);
    return NextResponse.json({ erro: 'Erro interno do servidor' }, { status: 500 });
  }
}

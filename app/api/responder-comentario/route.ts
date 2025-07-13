//app/api/responder-comentario/route.ts

import { notificarEmail, notificarWhatsapp } from '@/lib/notificar';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { comentarioId, userId, texto } = await req.json();

  const comentarioOriginal = await prisma.comentario.findUnique({
    where: { id: comentarioId },
    include: {
      usuario: true,
      aula: {
        include: {
          curso: true
        }
      }
    }
  });

  if (!comentarioOriginal) {
    return NextResponse.json({ erro: 'Comentário não encontrado' }, { status: 404 });
  }

  const resposta = await prisma.comentario.create({
    data: {
      mensagem: `@${comentarioOriginal.usuario.nome}: ${texto}`,
      usuarioId: userId,
      aulaId: comentarioOriginal.aulaId
    },
    include: {
      usuario: true,
      aula: true
    }
  });

  const destinatario = comentarioOriginal.usuario;

  if (destinatario.notificaEmail) {
    await notificarEmail(destinatario.email, `Nova resposta ao seu comentário`, `
      <p><strong>${resposta.usuario.nome}</strong> respondeu seu comentário na aula <strong>${resposta.aula.titulo}</strong>:</p>
      <blockquote>${texto}</blockquote>
    `);
  }

  if (destinatario.notificaWhatsapp && destinatario.telefone) {
    await notificarWhatsapp(destinatario.telefone, `💬 Nova resposta de ${resposta.usuario.nome} na aula "${resposta.aula.titulo}"`);
  }

  return NextResponse.json({ sucesso: true });
}

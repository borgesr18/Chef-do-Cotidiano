//app/api/responder-comentario/route.ts

import { notificarEmail, notificarWhatsapp } from '@/lib/notificar';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { comentarioId, userId, texto } = await req.json();

  const resposta = await prisma.resposta.create({
    data: {
      comentarioId,
      userId,
      texto
    },
    include: {
      comentario: {
        include: {
          autor: true,
          aula: true
        }
      },
      autor: true
    }
  });

  const destinatario = resposta.comentario.autor;

  if (destinatario.notificaEmail) {
    await notificarEmail(destinatario.email, `Nova resposta ao seu comentário`, `
      <p><strong>${resposta.autor.nome}</strong> respondeu seu comentário na aula <strong>${resposta.comentario.aula.titulo}</strong>:</p>
      <blockquote>${resposta.texto}</blockquote>
    `);
  }

  if (destinatario.notificaWhatsapp && destinatario.telefone) {
    await notificarWhatsapp(destinatario.telefone, `💬 Nova resposta de ${resposta.autor.nome} na aula "${resposta.comentario.aula.titulo}"`);
  }

  return NextResponse.json({ sucesso: true });
}

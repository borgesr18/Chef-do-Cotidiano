//app/api/concluir-aula/route.ts
import { notificarEmail, notificarWhatsapp } from '@/lib/notificar';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { aulaId, userId } = await req.json();

  const progresso = await prisma.progresso.upsert({
    where: {
      userId_aulaId: { userId, aulaId }
    },
    update: { concluido: true },
    create: { userId, aulaId, concluido: true }
  });

  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
    include: { curso: true }
  });

  const usuario = await prisma.usuario.findUnique({
    where: { id: userId }
  });

  if (usuario?.notificaEmail) {
    await notificarEmail(usuario.email, `✅ Aula concluída`, `
      <p>Você concluiu a aula <strong>${aula?.titulo}</strong> do curso <strong>${aula?.curso.titulo}</strong>.</p>
    `);
  }

  if (usuario?.notificaWhatsapp && usuario.telefone) {
    await notificarWhatsapp(usuario.telefone, `🎓 Aula concluída: ${aula?.titulo}`);
  }

  return NextResponse.json({ sucesso: true });
}

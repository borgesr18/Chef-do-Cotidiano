//app/api/emissao-certificado/route.ts
import { notificarEmail, notificarWhatsapp } from '@/lib/notificar';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { cursoId, userId } = await req.json();

  const token = crypto.randomUUID();

  const certificado = await prisma.certificado.create({
    data: { cursoId, userId, token }
  });

  const usuario = await prisma.usuario.findUnique({
    where: { id: userId }
  });

  const curso = await prisma.curso.findUnique({
    where: { id: cursoId }
  });

  if (usuario?.notificaEmail) {
    await notificarEmail(usuario.email, `📄 Certificado Disponível`, `
      <p>Parabéns! Seu certificado do curso <strong>${curso?.titulo}</strong> está pronto.</p>
      <p><a href="${process.env.NEXT_PUBLIC_URL}/certificado/${token}">Clique aqui para visualizar</a></p>
    `);
  }

  if (usuario?.notificaWhatsapp && usuario.telefone) {
    await notificarWhatsapp(usuario.telefone, `📄 Certificado do curso "${curso?.titulo}" disponível: ${process.env.NEXT_PUBLIC_URL}/certificado/${token}`);
  }

  return NextResponse.json({ sucesso: true });
}

//lib/notificar.ts
import { prisma } from './prisma';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY || '');

// Simulação de envio WhatsApp (você pode trocar isso futuramente)
async function enviarWhatsApp(numero: string, mensagem: string) {
  console.log(`📱 Enviando WhatsApp para ${numero}: ${mensagem}`);
  return { status: 'simulado' };
}

export async function notificarUsuario({
  userId,
  titulo,
  mensagem,
  tipo,
}: {
  userId: string;
  titulo: string;
  mensagem: string;
  tipo: 'comentario' | 'certificado' | 'aula' | 'resposta';
}) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!usuario) return;

  const notificacoesEnviadas = [];

  // 📨 Enviar por e-mail se permitido
  if (usuario.notificaEmail && usuario.email) {
    try {
      await resend.emails.send({
        from: 'Chef do Cotidiano <no-reply@chefdocotidiano.com>',
        to: usuario.email,
        subject: titulo,
        html: `<p>${mensagem}</p>`,
      });

      notificacoesEnviadas.push({
        canal: 'email',
        status: 'sucesso',
      });

      await prisma.notificacao.create({
        data: {
          userId,
          titulo,
          mensagem,
          tipo,
          canal: 'email',
        },
      });
    } catch (e) {
      console.error('Erro ao enviar e-mail:', e);
    }
  }

  // 📲 Enviar por WhatsApp se permitido
  if (usuario.notificaWhatsapp && usuario.telefone) {
    try {
      await enviarWhatsApp(usuario.telefone, mensagem);

      notificacoesEnviadas.push({
        canal: 'whatsapp',
        status: 'simulado',
      });

      await prisma.notificacao.create({
        data: {
          userId,
          titulo,
          mensagem,
          tipo,
          canal: 'whatsapp',
        },
      });
    } catch (e) {
      console.error('Erro ao enviar WhatsApp:', e);
    }
  }

  return notificacoesEnviadas;
}


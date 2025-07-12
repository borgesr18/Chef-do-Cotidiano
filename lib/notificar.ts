//lib/notificar.ts
import { Resend } from 'resend';
import { prisma } from './prisma';

const resend = new Resend(process.env.RESEND_API_KEY || 'simulado');

// Envio de e-mail real com fallback
export async function notificarEmail(destinatario: string, titulo: string, html: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Email] Para: ${destinatario}\nAssunto: ${titulo}\n${html}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Chef do Cotidiano <contato@chefdocotidiano.com>',
      to: destinatario,
      subject: titulo,
      html
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

// Envio simulado por WhatsApp (substituir por API real depois)
export async function notificarWhatsapp(numero: string, mensagem: string) {
  console.log(`[WhatsApp] Para: ${numero}\n${mensagem}`);
  // Aqui poderá futuramente fazer POST para uma API real do WhatsApp
}

// Registro da notificação na tabela
export async function registrarNotificacao(
  userId: string,
  titulo: string,
  mensagem: string,
  canal: 'email' | 'whatsapp',
  tipo: 'comentario' | 'aula' | 'certificado' | 'admin'
) {
  try {
    await prisma.notificacao.create({
      data: {
        userId,
        titulo,
        mensagem,
        canal,
        tipo
      }
    });
  } catch (err) {
    console.error('Erro ao registrar notificação:', err);
  }
}

// Enviar notificação para todos os administradores
export async function notificarAdmins(titulo: string, mensagem: string) {
  const admins = await prisma.usuario.findMany({
    where: { tipo: 'ADMIN' }
  });

  for (const admin of admins) {
    if (admin.notificaEmail) {
      await notificarEmail(admin.email, titulo, `<p>${mensagem}</p>`);
      await registrarNotificacao(admin.id, titulo, mensagem, 'email', 'admin');
    }

    if (admin.notificaWhatsapp && admin.telefone) {
      await notificarWhatsapp(admin.telefone, `🔔 ${titulo}: ${mensagem}`);
      await registrarNotificacao(admin.id, titulo, mensagem, 'whatsapp', 'admin');
    }
  }
}

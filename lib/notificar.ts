// lib/notificar.ts

import { prisma } from './prisma';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

const resend = new Resend(process.env.RESEND_API_KEY!);

// 📲 Função simulada de envio por WhatsApp
async function enviarWhatsApp(numero: string, mensagem: string) {
  console.log(`📱 Enviando WhatsApp para ${numero}: ${mensagem}`);
  return { status: 'simulado' }; // Trocar futuramente por integração real
}

interface NotificarUsuarioParams {
  userId: string;
  titulo: string;
  mensagem: string;
  tipo: 'COMENTARIO' | 'CERTIFICADO' | 'CONCLUSAO' | 'RESPOSTA' | 'PERSONALIZADA';
}

export async function notificarUsuario({
  userId,
  titulo,
  mensagem,
  tipo,
}: NotificarUsuarioParams) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: userId },
  });

  if (!usuario) {
    console.warn(`Usuário com ID ${userId} não encontrado.`);
    return [];
  }

  const notificacoesEnviadas: { canal: string; status: string }[] = [];

  // 📨 Enviar e-mail (Resend)
  if (usuario.notificaEmail && usuario.email) {
    try {
      const { error } = await resend.emails.send({
        from: 'Chef do Cotidiano <no-reply@chefdocotidiano.com>',
        to: usuario.email,
        subject: titulo,
        html: `<p>${mensagem}</p>`,
      });

      if (error) throw error;

      notificacoesEnviadas.push({ canal: 'email', status: 'sucesso' });

      await prisma.notificacao.create({
        data: {
          id: uuidv4(),
          userId,
          titulo,
          mensagem,
          tipo,
          canal: 'EMAIL',
        },
      });
    } catch (e) {
      console.error(`Erro ao enviar e-mail para ${usuario.email}:`, e);
    }
  }

  // 📲 Enviar WhatsApp (simulado ou real)
  if (usuario.notificaWhatsapp && usuario.telefone) {
    try {
      await enviarWhatsApp(usuario.telefone, mensagem);

      notificacoesEnviadas.push({ canal: 'whatsapp', status: 'simulado' });

      await prisma.notificacao.create({
        data: {
          id: uuidv4(),
          userId,
          titulo,
          mensagem,
          tipo,
          canal: 'WHATSAPP',
        },
      });
    } catch (e) {
      console.error(`Erro ao enviar WhatsApp para ${usuario.telefone}:`, e);
    }
  }

  return notificacoesEnviadas;
}

export async function notificarEmail(destinatario: string, titulo: string, html: string) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Email] Para: ${destinatario}\nAssunto: ${titulo}\n${html}`);
    return;
  }

  try {
    await resend.emails.send({
      from: 'Chef do Cotidiano <no-reply@chefdocotidiano.com>',
      to: destinatario,
      subject: titulo,
      html
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

export async function notificarWhatsapp(numero: string, mensagem: string) {
  console.log(`[WhatsApp] Para: ${numero}\n${mensagem}`);
  // Aqui poderá futuramente fazer POST para uma API real do WhatsApp
}

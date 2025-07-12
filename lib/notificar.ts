//lib/notificar.ts
import { Resend } from 'resend';
// import axios from 'axios'; // para WhatsApp se for API externa

const resend = new Resend(process.env.RESEND_API_KEY);

export async function notificarEmail(to: string, assunto: string, html: string) {
  return await resend.emails.send({
    from: 'notificacoes@chefdocotidiano.com',
    to,
    subject: assunto,
    html,
  });
}

export async function notificarWhatsapp(numero: string, mensagem: string) {
  if (!process.env.WHATSAPP_URL || !process.env.WHATSAPP_TOKEN) return;

  // Exemplo com API REST própria
  await fetch(`${process.env.WHATSAPP_URL}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: numero,
      message: mensagem,
    }),
  });
}

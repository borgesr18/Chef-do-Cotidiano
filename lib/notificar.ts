//lib/notificar.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || '');

// Envia e-mail usando Resend
export async function notificarEmail(to: string, assunto: string, html: string) {
  try {
    await resend.emails.send({
      from: 'notificacoes@chefdocotidiano.com',
      to,
      subject: assunto,
      html
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
  }
}

// Envia mensagem simulada no WhatsApp (apenas loga)
export async function notificarWhatsapp(numero: string, mensagem: string) {
  try {
    console.log(`📲 Simulando envio de WhatsApp para ${numero}: ${mensagem}`);
    // Aqui poderia ir uma chamada real para API futura (ex: Twilio)
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
  }
}

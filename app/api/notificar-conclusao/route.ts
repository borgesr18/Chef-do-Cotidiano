//app/api/notificar-conclusao/route.ts — API Route para envio de notificação por conclusão de aula

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Twilio } from 'twilio';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aulaId, userEmail } = body;

    // Envio por e-mail (via Resend)
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'notificacoes@chefdocotidiano.com',
      to: userEmail,
      subject: 'Aula concluída! 🎉',
      html: `<p>Parabéns por concluir a aula! Continue avançando no seu curso.</p>`
    });

    // Envio por WhatsApp (via Twilio)
    const twilio = new Twilio(
      process.env.TWILIO_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    await twilio.messages.create({
      body: '📚 Aula concluída com sucesso no Chef do Cotidiano! Continue aprendendo!',
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${process.env.ADMIN_WHATSAPP}` // Ou do próprio usuário se capturar
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// app/api/notificar-conclusao/route.ts — API Route para envio de notificação por conclusão de aula

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { Twilio } from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY!);
const twilio = new Twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { aulaId, userEmail } = body;

    if (!aulaId || !userEmail) {
      return NextResponse.json(
        { erro: 'Campos obrigatórios ausentes (aulaId, userEmail)' },
        { status: 400 }
      );
    }

    // Envio por e-mail (via Resend)
    const { error: emailError } = await resend.emails.send({
      from: 'Chef do Cotidiano <notificacoes@chefdocotidiano.com>',
      to: userEmail,
      subject: 'Aula concluída! 🎉',
      html: `<p>Parabéns por concluir a aula <strong>${aulaId}</strong>! Continue avançando no seu curso.</p>`,
    });

    if (emailError) {
      console.error('Erro ao enviar e-mail:', emailError);
    }

    // Envio por WhatsApp (via Twilio)
    const whatsappTo = process.env.ADMIN_WHATSAPP;
    const whatsappFrom = process.env.TWILIO_PHONE_NUMBER;

    if (whatsappTo && whatsappFrom) {
      await twilio.messages.create({
        body: '📚 Aula concluída com sucesso no Chef do Cotidiano! Continue aprendendo!',
        from: `whatsapp:${whatsappFrom}`,
        to: `whatsapp:${whatsappTo}`,
      });
    } else {
      console.warn('Número de WhatsApp não configurado corretamente no .env');
    }

    return NextResponse.json({ sucesso: true });
  } catch (error: any) {
    console.error('Erro ao enviar notificação:', error);
    return NextResponse.json(
      { sucesso: false, erro: error?.message || 'Erro interno' },
      { status: 500 }
    );
  }
}

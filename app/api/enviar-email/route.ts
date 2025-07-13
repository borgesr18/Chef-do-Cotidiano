//app/api/enviar-email/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.json();
  const { to, subject, html } = body;

  try {
    const data = await resend.emails.send({
      from: 'Chef do Cotidiano <no-reply@seudominio.com>',
      to,
      subject,
      html,
    });

    return NextResponse.json({ sucesso: true, data });
  } catch (error: any) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}

// app/api/enviar-email/route.ts

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, subject, html } = body;

    if (!to || !subject || !html) {
      return NextResponse.json(
        { erro: 'Parâmetros obrigatórios ausentes' },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'Chef do Cotidiano <no-reply@chefdocotidiano.com>',
      to,
      subject,
      html,
    });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({ sucesso: true, data });
  } catch (err: any) {
    return NextResponse.json(
      { erro: err?.message || 'Erro interno ao enviar o e-mail' },
      { status: 500 }
    );
  }
}

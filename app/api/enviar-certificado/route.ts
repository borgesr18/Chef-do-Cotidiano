// app/api/enviar-certificado/route.ts

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email, url } = await req.json();

    if (!email || !url) {
      return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: 'Chef do Cotidiano <nao-responda@chefdocotidiano.com>',
      to: email,
      subject: '📄 Seu Certificado – Chef do Cotidiano',
      html: `
        <p>Olá!</p>
        <p>Você concluiu com sucesso um curso e seu certificado está disponível.</p>
        <p><a href="${url}" target="_blank" style="color: #0070f3">📎 Clique aqui para ver ou baixar seu certificado</a></p>
        <br/>
        <p>Obrigado por cozinhar com a gente 🍳</p>
        <p>Equipe Chef do Cotidiano</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Erro inesperado' },
      { status: 500 }
    );
  }
}


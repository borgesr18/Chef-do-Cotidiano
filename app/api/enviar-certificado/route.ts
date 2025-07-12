//app/api/enviar-certificado/route.ts
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, url } = await req.json();

  if (!email || !url) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 });
  }

  try {
    const { data, error } = await resend.emails.send({
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
      `
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 });
  }
}

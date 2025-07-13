// Arquivo: app/api/verificacoes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { certificadoId, tipo, valor, ip } = body;

  if (!certificadoId || !tipo || !valor) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
  }

  try {
    await prisma.verificacao.create({
      data: {
        certificadoId,
        tipo,
        valor,
        ip,
        verificadoEm: new Date(),
      },
    });
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao salvar verificação.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const historico = await prisma.verificacao.findMany({
      include: {
        certificado: {
          include: {
            usuario: true,
            curso: true,
          },
        },
      },
      orderBy: {
        verificadoEm: 'desc',
      },
      take: 100,
    });

    return NextResponse.json(historico);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar histórico.' }, { status: 500 });
  }
}

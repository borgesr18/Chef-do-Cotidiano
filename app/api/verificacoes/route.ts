// Arquivo: app/api/verificacoes/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json();
  const { certificadoId, tipo, valor, ip, userId } = body;

  if (!certificadoId || !tipo || !valor || !userId) {
    return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 });
  }

  try {
    await prisma.auditoria.create({
      data: {
        userId,
        ip: ip || 'IP desconhecido',
        localizacao: `Verificação ${tipo}: ${valor}`,
        userAgent: `Certificado: ${certificadoId}`,
      },
    });
    return NextResponse.json({ sucesso: true });
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao salvar verificação.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const historico = await prisma.auditoria.findMany({
      where: {
        localizacao: {
          startsWith: 'Verificação'
        }
      },
      include: {
        usuario: true,
      },
      orderBy: {
        criadoEm: 'desc',
      },
      take: 100,
    });

    return NextResponse.json(historico);
  } catch (err) {
    return NextResponse.json({ error: 'Erro ao buscar histórico.' }, { status: 500 });
  }
}

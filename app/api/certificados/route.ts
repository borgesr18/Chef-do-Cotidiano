// Arquivo: app/api/certificados/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const inicio = searchParams.get('inicio');
  const fim = searchParams.get('fim');

  try {
    const filtroData = inicio && fim ? {
      gte: new Date(inicio),
      lte: new Date(fim),
    } : undefined;

    const certificados = await prisma.certificado.findMany({
      where: filtroData ? {
        data_emissao: filtroData
      } : undefined,
      include: {
        curso: true,
        usuario: true,
      },
      orderBy: {
        data_emissao: 'desc',
      }
    });

    return NextResponse.json(certificados);
  } catch (err) {
    console.error('Erro ao buscar certificados:', err);
    return NextResponse.json({ error: 'Erro ao buscar certificados.' }, { status: 500 });
  }
}

//app/api/ip/route.ts
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'IP desconhecido';

  return NextResponse.text(ip);
}

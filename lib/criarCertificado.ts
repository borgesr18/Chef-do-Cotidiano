//lib/criarCertificado.ts

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Cria um certificado com token e hashVerificacao
 * @param cursoId - ID do curso concluído
 * @param usuarioId - ID do aluno
 * @param emailDoUsuario - Email do aluno
 * @returns Certificado criado
 */
export async function criarCertificado(cursoId: string, usuarioId: string, emailDoUsuario: string) {
  // Gera token único
  const token = crypto.randomUUID();

  // Gera hash de verificação (SHA-256)
  const hashVerificacao = crypto
    .createHash('sha256')
    .update(token + emailDoUsuario)
    .digest('hex');

  // Cria o certificado no banco
  const certificado = await prisma.certificado.create({
    data: {
      token,
      cursoId,
      usuarioId,
      data_emissao: new Date(),
      hashVerificacao
    }
  });

  return certificado;
}

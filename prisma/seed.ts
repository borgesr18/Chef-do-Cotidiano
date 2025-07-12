import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar Admin
  const senhaCriptografada = await hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@chefdocotidiano.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@chefdocotidiano.com',
      senha: senhaCriptografada,
      tipo: 'ADMIN',
    },
  });

  // Criar Aluno
  const aluno = await prisma.usuario.upsert({
    where: { email: 'aluno@exemplo.com' },
    update: {},
    create: {
      nome: 'Aluno Teste',
      email: 'aluno@exemplo.com',
      senha: await hash('aluno123', 10),
    },
  });

  // Criar Curso com Aulas
  const curso = await prisma.curso.create({
    data: {
      titulo: 'Culinária Básica',
      descricao: 'Aprenda o essencial da cozinha prática',
      imagem_url: 'https://via.placeholder.com/300x200.png?text=Curso+Culinária',
      aulas: {
        createMany: {
          data: [
            { titulo: 'Introdução', ordem: 1, video_url: 'https://www.youtube.com/embed/xyz1' },
            { titulo: 'Técnicas Básicas', ordem: 2, video_url: 'https://www.youtube.com/embed/xyz2' },
          ],
        },
      },
    },
  });

  // Inscrever aluno
  await prisma.inscricao.create({
    data: {
      userId: aluno.id,
      cursoId: curso.id,
    },
  });

  console.log('🌱 Seed concluído com sucesso.');
}

main().finally(() => prisma.$disconnect());

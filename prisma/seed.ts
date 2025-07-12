import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 🔐 Criar usuários
  const senhaAdmin = await hash('admin123', 10);
  const senhaAluno = await hash('aluno123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@chefdocotidiano.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@chefdocotidiano.com',
      senha: senhaAdmin,
      tipo: 'ADMIN',
    },
  });

  const aluno = await prisma.usuario.upsert({
    where: { email: 'aluno@exemplo.com' },
    update: {},
    create: {
      nome: 'Aluno Teste',
      email: 'aluno@exemplo.com',
      senha: senhaAluno,
    },
  });

  // 📚 Cursos e Aulas
  const cursos = await prisma.$transaction([
    prisma.curso.create({
      data: {
        titulo: 'Culinária Básica',
        descricao: 'Aprenda o essencial da cozinha prática',
        imagem_url: 'https://via.placeholder.com/300x200.png?text=Culinária+Básica',
        aulas: {
          createMany: {
            data: [
              { titulo: 'Introdução', ordem: 1, video_url: 'https://www.youtube.com/embed/intro1' },
              { titulo: 'Técnicas Básicas', ordem: 2, video_url: 'https://www.youtube.com/embed/tech1' },
            ],
          },
        },
      },
    }),
    prisma.curso.create({
      data: {
        titulo: 'Carnes e Grelhados',
        descricao: 'Domine o preparo de carnes suculentas e grelhados perfeitos',
        imagem_url: 'https://via.placeholder.com/300x200.png?text=Carnes+e+Grelhados',
        aulas: {
          createMany: {
            data: [
              { titulo: 'Tipos de Carne', ordem: 1, video_url: 'https://www.youtube.com/embed/carne1' },
              { titulo: 'Técnica de Grelhar', ordem: 2, video_url: 'https://www.youtube.com/embed/grelhar1' },
            ],
          },
        },
      },
    }),
    prisma.curso.create({
      data: {
        titulo: 'Cozinha Rápida e Saudável',
        descricao: 'Receitas rápidas, práticas e equilibradas para o dia a dia',
        imagem_url: 'https://via.placeholder.com/300x200.png?text=Cozinha+Saudável',
        aulas: {
          createMany: {
            data: [
              { titulo: 'Organização na Cozinha', ordem: 1, video_url: 'https://www.youtube.com/embed/organiza1' },
              { titulo: 'Pratos Leves', ordem: 2, video_url: 'https://www.youtube.com/embed/leves1' },
            ],
          },
        },
      },
    }),
  ]);

  // 🎓 Inscrição do aluno no primeiro curso
  await prisma.inscricao.create({
    data: {
      userId: aluno.id,
      cursoId: cursos[0].id,
    },
  });

  // 🍲 Receitas
  const receitas = await prisma.$transaction([
    prisma.receita.create({
      data: {
        titulo: 'Arroz de Alho com Bacon',
        descricao: 'Um arroz saboroso e prático para qualquer refeição.',
        imagem_url: 'https://via.placeholder.com/300x200.png?text=Arroz+com+Bacon',
        autorId: admin.id,
      },
    }),
    prisma.receita.create({
      data: {
        titulo: 'Omelete Proteica',
        descricao: 'Rápida, leve e cheia de sabor para o café ou jantar.',
        imagem_url: 'https://via.placeholder.com/300x200.png?text=Omelete+Proteica',
        autorId: admin.id,
      },
    }),
    prisma.receita.create({
      data: {
        titulo: 'Macarrão na Manteiga com Alho',
        descricao: 'Clássico simples e saboroso, pronto em 10 minutos.',
        imagem_url: 'https://via.placeholder.com/300x200.png?text=Macarrão+Alho+e+Óleo',
        autorId: admin.id,
      },
    }),
  ]);

  // ❤️ Favoritar receitas para o aluno
  await prisma.$transaction(
    receitas.map((receita) =>
      prisma.favorito.create({
        data: {
          userId: aluno.id,
          receitaId: receita.id,
        },
      }),
    ),
  );

  console.log('🌱 Seed completo: cursos, aulas, receitas, usuários, favoritos.');
}

main().finally(() => prisma.$disconnect());


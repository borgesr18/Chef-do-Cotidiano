//app/dashboard/page.tsx
import { createSupabaseServerClient } from '@/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Placeholder para receitas e cursos (exemplo futuro)
  const receitasSalvas = [
    { id: 1, titulo: 'Hambúrguer Artesanal', tempo: '30min', imagem: '/imagens/hamburguer.jpg' },
    { id: 2, titulo: 'Estrogonofe de Frango', tempo: '25min', imagem: '/imagens/estrogonofe.jpg' }
  ];

  const cursosInscritos = [
    { id: 1, titulo: 'Curso Gratuito: Do Zero ao Prato Feito', descricao: 'Aprenda a base da cozinha prática.', imagem: '/imagens/curso.jpg' }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-neutral-900 mb-2">
          Bem-vindo de volta! 👋
        </h1>
        <p className="text-xl text-neutral-600">{user.email}</p>
      </div>

      <section className="mb-16">
        <h2 className="text-3xl font-display font-semibold text-neutral-900 mb-8">Receitas Salvas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {receitasSalvas.map((receita) => (
            <div key={receita.id} className="card group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img src={receita.imagem} alt={receita.titulo} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-neutral-700">
                  ⏱️ {receita.tempo}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">{receita.titulo}</h3>
              <p className="text-neutral-600 text-sm">Tempo: {receita.tempo}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-display font-semibold text-neutral-900 mb-8">Cursos Inscritos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {cursosInscritos.map((curso) => (
            <div key={curso.id} className="card group cursor-pointer">
              <div className="relative overflow-hidden rounded-lg mb-4">
                <img src={curso.imagem} alt={curso.titulo} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">{curso.titulo}</h3>
              <p className="text-neutral-600 text-sm">{curso.descricao}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


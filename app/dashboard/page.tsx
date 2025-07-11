//app/dashboard/page.tsx
import { createSupabaseServerClient } from '@/lib/auth';
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
    <div className="p-8 space-y-12">
      <h1 className="text-2xl font-bold mb-4">Bem-vindo, {user.email}</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Receitas Salvas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {receitasSalvas.map((receita) => (
            <div key={receita.id} className="bg-white rounded shadow p-4">
              <img src={receita.imagem} alt={receita.titulo} className="w-full h-40 object-cover rounded" />
              <h3 className="mt-2 font-bold">{receita.titulo}</h3>
              <p className="text-sm text-gray-600">Tempo: {receita.tempo}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Cursos Inscritos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cursosInscritos.map((curso) => (
            <div key={curso.id} className="bg-white rounded shadow p-4">
              <img src={curso.imagem} alt={curso.titulo} className="w-full h-40 object-cover rounded" />
              <h3 className="mt-2 font-bold">{curso.titulo}</h3>
              <p className="text-sm text-gray-600">{curso.descricao}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}


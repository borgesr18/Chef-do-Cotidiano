import { createSupabaseServerClient } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Chef do Cotidiano</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/cursos" className="text-gray-600 hover:text-gray-900 font-medium">Cursos</Link>
              <Link href="/receitas" className="text-gray-600 hover:text-gray-900 font-medium">Receitas</Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">Login</Link>
              <Link href="/cadastro" className="btn-primary">Começar Agora</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            Transforme-se em um Chef
          </h1>
          <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Culinária prática e descomplicada para homens que querem dominar a cozinha
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/cadastro" className="bg-white text-blue-600 hover:bg-gray-50 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200 shadow-lg hover:shadow-xl">
              Começar Agora
            </Link>
            <Link href="/receitas" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-lg text-lg transition-all duration-200">
              Ver Receitas
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o <span className="gradient-text">Chef do Cotidiano</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nossa metodologia foi desenvolvida especialmente para homens que querem aprender culinária de forma prática
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="feature-card">
              <div className="text-4xl mb-4">🍳</div>
              <h3 className="text-xl font-semibold mb-3">Foco Prático</h3>
              <p className="text-gray-600">Receitas diretas ao ponto, sem complicação. Aprenda fazendo.</p>
            </div>

            <div className="feature-card">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-semibold mb-3">Cursos Estruturados</h3>
              <p className="text-gray-600">Do básico ao avançado, com certificados de conclusão.</p>
            </div>

            <div className="feature-card">
              <div className="text-4xl mb-4">👨‍🍳</div>
              <h3 className="text-xl font-semibold mb-3">Para Homens</h3>
              <p className="text-gray-600">Conteúdo pensado especialmente para o público masculino.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Rodrigo Borges. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white py-24 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-blue-600 opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              Transforme-se em um
              <span className="bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent"> Chef</span>
            </h1>
            <p className="text-xl lg:text-2xl text-blue-100 mb-8 leading-relaxed">
              Culinária prática e descomplicada para homens que querem dominar a cozinha
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/cursos" className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-lg">
                Começar Agora
              </Link>
              <Link href="/receitas" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium px-8 py-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg">
                Ver Receitas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que escolher o Chef do Cotidiano?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa metodologia foi desenvolvida especialmente para homens que querem aprender culinária de forma prática
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Foco Prático</h3>
              <p className="text-gray-600">Receitas diretas ao ponto, sem complicação. Aprenda fazendo.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Cursos Estruturados</h3>
              <p className="text-gray-600">Do básico ao avançado, com certificados de conclusão.</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">👨‍🍳</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Para Homens</h3>
              <p className="text-gray-600">Conteúdo pensado especialmente para o público masculino.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

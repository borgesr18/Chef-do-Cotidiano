export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">🍳</span>
              </div>
              <h3 className="text-xl font-bold text-white">Chef do Cotidiano</h3>
            </div>
            <p className="text-gray-400 max-w-md">
              Transformando homens em chefs através de receitas práticas e cursos especializados.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/receitas" className="hover:text-blue-400 transition-colors">Receitas</a></li>
              <li><a href="/cursos" className="hover:text-blue-400 transition-colors">Cursos</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Rodrigo Borges. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

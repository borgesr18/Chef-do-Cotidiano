interface CardReceitaProps {
  titulo: string;
  tempo: string;
  imagem: string;
}

export default function CardReceita({ titulo, tempo, imagem }: CardReceitaProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img 
          src={imagem} 
          alt={titulo} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
          ⏱️ {tempo}
        </div>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {titulo}
      </h3>
      <div className="flex items-center text-gray-500 text-sm">
        <span>Tempo de preparo: {tempo}</span>
      </div>
    </div>
  );
}

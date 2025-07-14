interface CardCursoProps {
  titulo: string;
  descricao: string;
  imagem: string;
  preco?: string;
}

export default function CardCurso({ titulo, descricao, imagem, preco }: CardCursoProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg mb-4">
        <img 
          src={imagem} 
          alt={titulo} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
        {titulo}
      </h3>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">{descricao}</p>
      {preco && (
        <p className="text-green-600 font-bold text-lg">{preco}</p>
      )}
    </div>
  );
}

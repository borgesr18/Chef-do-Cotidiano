//components/CardCurso.tsx
interface CardCursoProps {
  titulo: string;
  descricao: string;
  imagem: string;
  preco?: string;
}

export default function CardCurso({ titulo, descricao, imagem, preco }: CardCursoProps) {
  return (
    <div className="bg-white rounded shadow p-4">
      <img src={imagem} alt={titulo} className="w-full h-40 object-cover rounded" />
      <h3 className="mt-2 font-bold text-lg">{titulo}</h3>
      <p className="text-sm text-gray-600">{descricao}</p>
      {preco && <p className="text-green-600 font-bold mt-2">{preco}</p>}
    </div>
  );
}

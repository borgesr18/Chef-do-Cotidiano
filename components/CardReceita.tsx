//components/CardReceita.tsx
interface CardReceitaProps {
  titulo: string;
  tempo: string;
  imagem: string;
}

export default function CardReceita({ titulo, tempo, imagem }: CardReceitaProps) {
  return (
    <div className="bg-white rounded shadow p-4">
      <img src={imagem} alt={titulo} className="w-full h-40 object-cover rounded" />
      <h3 className="mt-2 font-bold text-lg">{titulo}</h3>
      <p className="text-sm text-gray-600">Tempo: {tempo}</p>
    </div>
  );
}

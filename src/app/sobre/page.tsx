import Image from "next/image";

export const metadata = { title: "Sobre" };

export default function SobrePage() {
	return (
		<div className="mx-auto max-w-4xl px-4 py-10 grid md:grid-cols-[200px_1fr] gap-6 items-start">
			<Image src="/next.svg" alt="Foto do autor Rodrigo Borges" className="w-48 h-48 object-contain bg-[var(--color-neutral)] rounded" width={192} height={192} />
			<div>
				<h1 className="text-3xl font-bold">Sobre o autor</h1>
				<p className="mt-3 text-gray-700">Rodrigo Borges é o criador do Chef do Cotidiano. Apaixonado por gastronomia prática, ele desenvolve receitas testadas e acessíveis para o dia a dia.</p>
				<p className="mt-3 text-gray-700">Com foco em clareza e sabor, seus eBooks trazem passo a passo, tempo de preparo, rendimento e dicas para acertar sempre.</p>
			</div>
		</div>
	);
}
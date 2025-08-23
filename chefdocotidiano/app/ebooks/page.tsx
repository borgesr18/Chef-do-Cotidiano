import { EBOOKS } from "@/data/ebooks";
import EbookCard from "@/components/EbookCard";

export const metadata = {
	title: "Catálogo de eBooks",
	description: "Veja todos os eBooks de receitas disponíveis",
};

export default function EbooksPage() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-10">
			<h1 className="text-3xl font-bold">eBooks</h1>
			<div className="mt-6 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
				{EBOOKS.map((e) => (
					<EbookCard key={e.id} ebook={{ id: e.id, slug: e.slug, titulo: e.titulo, subtitulo: e.subtitulo, preco: e.preco, capa_url: e.capa_url }} />
				))}
			</div>
		</div>
	);
}
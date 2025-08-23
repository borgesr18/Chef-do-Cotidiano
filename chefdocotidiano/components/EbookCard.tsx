import Link from "next/link";

export type Ebook = {
	id: string;
	slug: string;
	titulo: string;
	subtitulo?: string;
	preco: number;
	capa_url: string;
};

export default function EbookCard({ ebook }: { ebook: Ebook }) {
	return (
		<article className="bg-white rounded-lg border border-neutral-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
			<Link href={`/ebook/${ebook.slug}`} className="block">
				<img src={ebook.capa_url} alt={`Capa do eBook ${ebook.titulo}`} className="w-full h-56 object-cover" loading="lazy" />
				<div className="p-4">
					<h3 className="font-semibold text-lg line-clamp-2">{ebook.titulo}</h3>
					{ebook.subtitulo ? (
						<p className="text-sm text-gray-600 mt-1 line-clamp-2">{ebook.subtitulo}</p>
					) : null}
					<div className="mt-3 flex items-center justify-between">
						<span className="font-bold text-[var(--color-primary)]">R$ {ebook.preco.toFixed(2)}</span>
						<span className="text-xs bg-[var(--color-accent)]/30 text-[#5a4500] px-2 py-1 rounded">PDF imediato</span>
					</div>
				</div>
			</Link>
		</article>
	);
}
import CTAButton from "@/components/CTAButton";
import FAQ from "@/components/FAQ";
import Testimonial from "@/components/Testimonial";
import { EBOOKS } from "@/data/ebooks";
import type { Metadata } from "next";

export async function generateStaticParams() {
	return EBOOKS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const ebook = EBOOKS.find((e) => e.slug === params.slug);
	if (!ebook) return { title: "eBook" };
	return {
		title: `${ebook.titulo}`,
		description: ebook.subtitulo,
		openGraph: {
			title: ebook.titulo,
			description: ebook.subtitulo,
			images: [{ url: ebook.capa_url }],
		},
	};
}

export default function ProductPage({ params }: { params: { slug: string } }) {
	const ebook = EBOOKS.find((e) => e.slug === params.slug);
	if (!ebook) return <div className="mx-auto max-w-6xl px-4 py-10">Produto não encontrado.</div>;
	const checkout = ebook.checkout_link || process.env.CHECKOUT_LINK_DEFAULT || "#";
	const priceBR = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(ebook.preco);
	const ld = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: ebook.titulo,
		image: [ebook.capa_url],
		description: ebook.subtitulo,
		offers: {
			"@type": "Offer",
			priceCurrency: "BRL",
			price: ebook.preco.toFixed(2),
			availability: "https://schema.org/InStock",
			url: `https://chefdocotidiano.com.br/ebook/${ebook.slug}`,
		},
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.9",
			reviewCount: "120",
		},
	};
	return (
		<div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-2 gap-8">
			<div>
				<img src={ebook.capa_url} alt={`Capa do eBook ${ebook.titulo}`} className="w-full h-auto rounded border border-neutral-200" />
				<ul className="mt-4 flex flex-wrap gap-2 text-xs">
					{ebook.callouts.map((c) => (
						<li key={c} className="bg-[var(--color-neutral)] px-2 py-1 rounded">{c}</li>
					))}
				</ul>
			</div>
			<div>
				<h1 className="text-3xl font-bold">{ebook.titulo}</h1>
				<p className="text-gray-700 mt-2">{ebook.subtitulo}</p>
				<p className="mt-4 text-2xl font-extrabold text-[var(--color-primary)]">{priceBR}</p>
				<div className="mt-4 flex gap-3">
					<CTAButton href={checkout}>Comprar agora</CTAButton>
					<CTAButton href="#sumario" variant="outline">Ver o que inclui</CTAButton>
				</div>
				<div id="sumario" className="mt-6">
					<h2 className="text-xl font-bold">O que você vai encontrar</h2>
					<ul className="list-disc pl-5 mt-2 text-sm text-gray-700 space-y-1">
						{ebook.sumario.map((s) => (
							<li key={s}>{s}</li>
						))}
					</ul>
					{ebook.bonus.length ? (
						<p className="mt-3 text-sm"><strong>Bônus:</strong> {ebook.bonus.join(", ")}</p>
					) : null}
					<p className="mt-3 text-sm"><strong>Garantia:</strong> {ebook.garantia_texto}</p>
				</div>
				<div className="mt-8 space-y-3">
					{ebook.depoimentos.map((d) => (
						<Testimonial key={d.nome} item={{ name: d.nome, content: d.texto }} />
					))}
				</div>
				<div className="mt-8">
					<h2 className="text-xl font-bold">Perguntas frequentes</h2>
					<div className="mt-2"><FAQ items={ebook.faq_itens} /></div>
				</div>
			</div>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
		</div>
	);
}
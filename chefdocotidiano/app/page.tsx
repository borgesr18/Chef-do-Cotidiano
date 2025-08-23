import CTAButton from "@/components/CTAButton";
import SocialProofBanner from "@/components/SocialProofBanner";
import Testimonial from "@/components/Testimonial";
import FAQ from "@/components/FAQ";
import EbookCard from "@/components/EbookCard";
import { EBOOKS } from "@/data/ebooks";

export default function HomePage() {
	const featured = EBOOKS[0];
	return (
		<div>
			<section className="mx-auto max-w-6xl px-4 pt-10 pb-12 grid md:grid-cols-2 gap-8 items-center">
				<div>
					<h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
						Receitas práticas e deliciosas para o seu dia a dia.
					</h1>
					<p className="mt-3 text-lg text-gray-700">
						Ebooks em PDF com passo a passo, tempo, rendimento e dicas do chef.
					</p>
					<div className="mt-4"><SocialProofBanner /></div>
					<div className="mt-6 flex items-center gap-3">
						<CTAButton href={`/ebook/${featured.slug}`}>Comprar eBook</CTAButton>
						<CTAButton href="/ebooks" variant="outline">Ver catálogo</CTAButton>
					</div>
				</div>
				<div className="relative">
					<img src="/window.svg" alt="Prato apetitoso" className="w-full h-auto" />
					<div className="absolute -bottom-3 -right-3"><span className="bg-[var(--color-accent)] px-3 py-1 rounded text-sm">Novo</span></div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-8">
				<h2 className="text-2xl font-bold">eBook #1 — Sabores do Cotidiano: 15 Receitas Práticas</h2>
				<p className="text-gray-700 mt-2">Inclui: Entradas, Pratos do dia a dia, Especiais, Sobremesas e Tabela de conversões.</p>
				<div className="mt-4 grid md:grid-cols-3 gap-6">
					<div className="md:col-span-2"><EbookCard ebook={{ id: featured.id, slug: featured.slug, titulo: featured.titulo, subtitulo: featured.subtitulo, preco: featured.preco, capa_url: featured.capa_url }} /></div>
					<div className="bg-[var(--color-neutral)] rounded-lg p-4">
						<ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
							<li>Entrega imediata em PDF</li>
							<li>Suporte por e-mail</li>
							<li>Acesso vitalício</li>
						</ul>
						<div className="mt-4"><CTAButton href={`/ebook/${featured.slug}`}>Comprar agora</CTAButton></div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-8">
				<h2 className="text-2xl font-bold">Depoimentos</h2>
				<div className="mt-4 grid md:grid-cols-3 gap-4">
					{featured.depoimentos.map((d) => (
						<Testimonial key={d.nome} item={{ name: d.nome, content: d.texto }} />
					))}
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-8">
				<h2 className="text-2xl font-bold">FAQ</h2>
				<div className="mt-4">
					<FAQ items={featured.faq_itens} />
				</div>
			</section>

			<section className="mx-auto max-w-6xl px-4 py-12">
				<div className="bg-white border border-neutral-200 rounded-lg p-6 grid md:grid-cols-2 gap-6 items-center">
					<div>
						<h3 className="text-xl font-bold">Baixe grátis 5 receitas-relâmpago em PDF</h3>
						<p className="text-sm text-gray-700 mt-1">Deixe seu nome e e-mail para receber agora.</p>
					</div>
					<form action="/lead" method="post" className="grid grid-cols-1 sm:grid-cols-3 gap-3" aria-label="Lead magnet">
						<input required name="nome" aria-label="Nome" placeholder="Seu nome" className="border border-neutral-300 rounded px-3 py-2 text-sm" />
						<input required type="email" name="email" aria-label="E-mail" placeholder="seu@email" className="border border-neutral-300 rounded px-3 py-2 text-sm" />
						<button className="bg-[var(--color-primary)] text-white rounded px-4 py-2 text-sm font-semibold">Quero receber</button>
					</form>
				</div>
			</section>
		</div>
	);
}

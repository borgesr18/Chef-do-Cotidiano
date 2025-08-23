import Link from "next/link";

export const metadata = { title: "Receitas grátis — Obrigado" };

export default function ObrigadoLeadPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-10">
			<h1 className="text-3xl font-bold">Receitas enviadas!</h1>
			<p className="mt-2 text-gray-700">Enviamos o PDF das 5 receitas-relâmpago para o seu e-mail. Aproveite para conhecer nosso eBook completo.</p>
			<div className="mt-4">
				<Link className="text-[var(--color-primary)] underline" href="/ebook/sabores-do-cotidiano-15-receitas-praticas">Conhecer o eBook pago</Link>
			</div>
		</div>
	);
}
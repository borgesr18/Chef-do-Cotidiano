import Link from "next/link";

export default function NotFound() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-20 text-center">
			<h1 className="text-4xl font-extrabold">404</h1>
			<p className="text-gray-700 mt-2">Página não encontrada.</p>
			<Link className="text-[var(--color-primary)] underline mt-4 inline-block" href="/">Voltar para a Home</Link>
		</div>
	);
}
import Link from "next/link";

export default function Footer() {
	const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/5500000000000?text=Quero%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20eBook";
	return (
		<footer className="bg-[var(--color-neutral)] mt-16 border-t border-neutral-200">
			<div className="mx-auto max-w-6xl px-4 py-8 grid gap-6 md:grid-cols-3">
				<div>
					<div className="font-bold text-[var(--color-primary)]">Chef do Cotidiano</div>
					<p className="text-sm text-gray-600 mt-2">© {new Date().getFullYear()} Rodrigo Borges. Todos os direitos reservados.</p>
				</div>
				<nav className="text-sm flex flex-col gap-2">
					<Link href="/politica-privacidade">Política de Privacidade</Link>
					<Link href="/termos">Termos de Uso</Link>
					<Link href="/contato">Contato</Link>
				</nav>
				<div className="text-sm">
					<div className="font-semibold mb-2">Redes e suporte</div>
					<ul className="space-y-1">
						<li>
							<a href={whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
								WhatsApp
							</a>
						</li>
						<li>
							<a href="mailto:suporte@chefdocotidiano.com.br">suporte@chefdocotidiano.com.br</a>
						</li>
					</ul>
				</div>
			</div>
		</footer>
	);
}
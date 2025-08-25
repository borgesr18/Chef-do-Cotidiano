export const metadata = { title: "Contato" };

export default function ContatoPage() {
	const whatsappUrl = process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/5500000000000?text=Quero%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20eBook";
	return (
		<div className="mx-auto max-w-3xl px-4 py-10">
			<h1 className="text-3xl font-bold">Contato</h1>
			<p className="text-gray-700 mt-2">Envie uma mensagem pelo formulário ou fale no WhatsApp.</p>
			<form className="mt-6 grid gap-3" action="mailto:suporte@chefdocotidiano.com.br" method="post">
				<input name="nome" required placeholder="Seu nome" className="border border-neutral-300 rounded px-3 py-2 text-sm" />
				<input name="email" type="email" required placeholder="Seu e-mail" className="border border-neutral-300 rounded px-3 py-2 text-sm" />
				<textarea name="mensagem" required placeholder="Sua mensagem" className="border border-neutral-300 rounded px-3 py-2 text-sm min-h-32" />
				<button className="bg-[var(--color-primary)] text-white rounded px-4 py-2 text-sm font-semibold w-max">Enviar</button>
			</form>
			<div className="mt-4">
				<a href={whatsappUrl} className="text-[var(--color-primary)] underline">Falar no WhatsApp</a>
			</div>
		</div>
	);
}
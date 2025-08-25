export const metadata = { title: "Obrigado" };

export default function ObrigadoPage() {
	return (
		<div className="mx-auto max-w-3xl px-4 py-10">
			<h1 className="text-3xl font-bold">Obrigado pela compra!</h1>
			<p className="mt-2 text-gray-700">Verifique seu e-mail para acessar o eBook em PDF. Caso não encontre, confira a caixa de spam ou entre em contato pelo suporte.</p>
			<div className="mt-4">
				<a href={process.env.CHECKOUT_LINK_DEFAULT || "#"} className="text-[var(--color-primary)] underline">Acessar área do produto</a>
			</div>
		</div>
	);
}
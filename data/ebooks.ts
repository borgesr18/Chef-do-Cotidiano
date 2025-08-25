export type Depoimento = { nome: string; avatar_url?: string; texto: string };
export type FAQItem = { question: string; answer: string };

export type EbookFull = {
	id: string;
	slug: string;
	titulo: string;
	subtitulo: string;
	preco: number;
	capa_url: string;
	paginas: number;
	formatos: string[];
	sumario: string[];
	bonus: string[];
	depoimentos: Depoimento[];
	garantia_texto: string;
	faq_itens: FAQItem[];
	callouts: string[];
	checkout_link?: string;
};

export const EBOOKS: EbookFull[] = [
	{
		id: "1",
		slug: "sabores-do-cotidiano-15-receitas-praticas",
		titulo: "Sabores do Cotidiano – 15 Receitas Práticas",
		subtitulo: "Receitas testadas, rápidas e deliciosas para a sua rotina.",
		preco: 19.9,
		capa_url: "/file.svg",
		paginas: 62,
		formatos: ["PDF"],
		sumario: ["Entradas", "Pratos do dia a dia", "Especiais", "Sobremesas", "Tabela de conversões"],
		bonus: ["Checklist de compras em 15min"],
		depoimentos: [
			{ nome: "Mariana S.", texto: "Receitas fáceis que salvam a semana!" },
			{ nome: "Carlos A.", texto: "O pudim ficou perfeito seguindo as dicas." },
			{ nome: "Fernanda R.", texto: "Vale muito pelo preço, super recomendo." },
		],
		garantia_texto: "7 dias de garantia",
		faq_itens: [
			{ question: "Como recebo o PDF?", answer: "Após a compra você recebe o link imediatamente no e-mail." },
			{ question: "Quais formas de pagamento?", answer: "PIX e Cartão de crédito pelo provedor de checkout." },
			{ question: "Tem suporte?", answer: "Sim, suporte por e-mail em até 24h úteis." },
			{ question: "Posso pedir reembolso?", answer: "Em até 7 dias da compra, conforme política." },
		],
		callouts: ["PDF imediato", "PIX/Cartão", "Acesso vitalício"],
		checkout_link: process.env.CHECKOUT_LINK_DEFAULT,
	},
];
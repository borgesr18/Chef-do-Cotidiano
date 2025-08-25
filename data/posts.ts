export type Post = {
	slug: string;
	titulo: string;
	capa_url?: string;
	conteudo: string;
	resumo?: string;
	data: string;
	tags?: string[];
};

export const POSTS: Post[] = [
	{
		slug: "trucos-arroz-soltinho",
		titulo: "3 truques para deixar o arroz soltinho",
		conteudo:
			"Lave bem o arroz, refogue os grãos no óleo com alho e mantenha a proporção de água correta. Deixe descansar 5 minutos antes de soltar com garfo.",
		resumo: "Como acertar o arroz no dia a dia em 3 passos.",
		data: "2025-01-01",
		tags: ["arroz", "basics"],
	},
	{
		slug: "pudim-sem-furinhos-guia",
		titulo: "Pudim sem furinhos: o guia completo",
		conteudo:
			"Asse em banho-maria, não bata demais a mistura, e controle a temperatura para um pudim liso.",
		resumo: "Segredos de textura perfeita no pudim.",
		data: "2025-01-05",
		tags: ["sobremesa", "pudim"],
	},
	{
		slug: "marmitas-da-semana-planejamento",
		titulo: "Marmitas da semana: como planejar",
		conteudo:
			"Escolha proteínas versáteis, prepare bases como arroz e legumes assados, e porcione em recipientes com etiquetas.",
		resumo: "Como organizar marmitas práticas para a semana.",
		data: "2025-01-10",
		tags: ["planejamento", "marmitas"],
	},
];
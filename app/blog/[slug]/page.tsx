import { POSTS } from "@/data/posts";
import type { Metadata } from "next";

export async function generateStaticParams() {
	return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
	const post = POSTS.find((p) => p.slug === params.slug);
	if (!post) return { title: "Post" };
	return {
		title: post.titulo,
		description: post.resumo,
	};
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
	const post = POSTS.find((p) => p.slug === params.slug);
	if (!post) return <div className="mx-auto max-w-6xl px-4 py-10">Post não encontrado.</div>;
	const ld = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: post.titulo,
		datePublished: post.data,
		author: { "@type": "Person", name: "Rodrigo Borges" },
	};
	return (
		<article className="mx-auto max-w-3xl px-4 py-10">
			<h1 className="text-3xl font-bold">{post.titulo}</h1>
			<p className="text-sm text-gray-500 mt-1">{new Date(post.data).toLocaleDateString("pt-BR")}</p>
			<div className="prose prose-neutral mt-6">
				<p>{post.conteudo}</p>
			</div>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
		</article>
	);
}
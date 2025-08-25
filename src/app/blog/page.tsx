import { POSTS } from "@/data/posts";
import Link from "next/link";

export const metadata = { title: "Blog" };

export default function BlogPage() {
	return (
		<div className="mx-auto max-w-6xl px-4 py-10">
			<h1 className="text-3xl font-bold">Blog</h1>
			<div className="mt-6 grid md:grid-cols-3 gap-6">
				{POSTS.map((p) => (
					<article key={p.slug} className="border border-neutral-200 rounded-lg p-4 bg-white">
						<h2 className="font-semibold text-lg"><Link href={`/blog/${p.slug}`}>{p.titulo}</Link></h2>
						<p className="text-sm text-gray-700 mt-1">{p.resumo}</p>
						<p className="text-xs text-gray-500 mt-2">{new Date(p.data).toLocaleDateString("pt-BR")}</p>
					</article>
				))}
			</div>
		</div>
	);
}
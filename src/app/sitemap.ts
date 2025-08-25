import { EBOOKS } from "@/data/ebooks";
import { POSTS } from "@/data/posts";

export default async function sitemap() {
	const base = "https://chefdocotidiano.com.br";
	const staticRoutes = ["/", "/ebooks", "/sobre", "/blog", "/contato", "/obrigado", "/obrigado-lead", "/politica-privacidade", "/termos"].map((route) => ({ url: base + route }));
	const productRoutes = EBOOKS.map((e) => ({ url: `${base}/ebook/${e.slug}` }));
	const blogRoutes = POSTS.map((p) => ({ url: `${base}/blog/${p.slug}` }));
	return [...staticRoutes, ...productRoutes, ...blogRoutes];
}
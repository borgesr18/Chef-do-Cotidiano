"use client";

import Link from "next/link";
import CTAButton from "@/components/CTAButton";
import { usePathname } from "next/navigation";

const navItems = [
	{ href: "/", label: "Home" },
	{ href: "/ebooks", label: "eBooks" },
	{ href: "/blog", label: "Blog" },
	{ href: "/sobre", label: "Sobre" },
	{ href: "/contato", label: "Contato" },
];

export default function Header() {
	const pathname = usePathname();
	return (
		<header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-neutral-200">
			<div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
				<Link href="/" className="font-bold text-xl text-[var(--color-primary)]">
					Chef do Cotidiano
				</Link>
				<nav className="hidden md:flex items-center gap-6" aria-label="Principal">
					{navItems.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className={`text-sm hover:text-[var(--color-primary)] ${pathname === item.href ? "text-[var(--color-primary)]" : "text-gray-700"}`}
						>
							{item.label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-3">
					<Link href="/ebooks" className="md:hidden text-sm text-gray-700">Menu</Link>
					<CTAButton href="/ebooks" variant="solid">Comprar</CTAButton>
				</div>
			</div>
		</header>
	);
}
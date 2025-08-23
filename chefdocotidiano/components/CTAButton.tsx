import Link from "next/link";
import type { ReactNode } from "react";

export default function CTAButton({ href, children, variant = "solid" }: { href: string; children: ReactNode; variant?: "solid" | "outline" }) {
	const base = "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors";
	const solid = "bg-[var(--color-primary)] text-white hover:bg-[#072a41] focus-visible:ring-[var(--color-accent)]";
	const outline = "border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white focus-visible:ring-[var(--color-accent)]";
	return (
		<Link href={href} className={`${base} ${variant === "solid" ? solid : outline}`}>{children}</Link>
	);
}
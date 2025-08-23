import type { ReactNode } from "react";

export default function Badge({ children, variant = "accent" }: { children: ReactNode; variant?: "accent" | "primary" | "neutral" }) {
	const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold";
	const styles: Record<string, string> = {
		accent: "bg-[var(--color-accent)]/30 text-[#5a4500]",
		primary: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
		neutral: "bg-[var(--color-neutral)] text-gray-700",
	};
	return <span className={`${base} ${styles[variant]}`}>{children}</span>;
}
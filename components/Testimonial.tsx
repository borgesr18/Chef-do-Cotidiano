import Image from "next/image";

export type TestimonialItem = {
	name: string;
	avatar_url?: string;
	content: string;
};

export default function Testimonial({ item }: { item: TestimonialItem }) {
	return (
		<figure className="bg-white border border-neutral-200 rounded-lg p-4 shadow-sm">
			<div className="flex items-center gap-3">
				{item.avatar_url ? (
					<Image src={item.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" width={40} height={40} />
				) : (
					<div className="w-10 h-10 rounded-full bg-[var(--color-neutral)]" aria-hidden />
				)}
				<figcaption className="font-semibold">{item.name}</figcaption>
			</div>
			<blockquote className="text-sm text-gray-700 mt-3">“{item.content}”</blockquote>
		</figure>
	);
}
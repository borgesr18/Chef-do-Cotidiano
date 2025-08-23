"use client";

import { useState } from "react";

type FAQItem = { question: string; answer: string };

export default function FAQ({ items }: { items: FAQItem[] }) {
	const [openIndex, setOpenIndex] = useState<number | null>(null);
	return (
		<div className="divide-y divide-neutral-200 border border-neutral-200 rounded-lg">
			{items.map((faq, index) => {
				const isOpen = openIndex === index;
				return (
					<div key={faq.question}>
						<button
							className="w-full text-left px-4 py-3 flex items-center justify-between gap-4"
							aria-expanded={isOpen}
							aria-controls={`faq-panel-${index}`}
							onClick={() => setOpenIndex(isOpen ? null : index)}
						>
							<span className="font-medium">{faq.question}</span>
							<span aria-hidden>{isOpen ? "−" : "+"}</span>
						</button>
						<div id={`faq-panel-${index}`} hidden={!isOpen} className="px-4 pb-4 text-sm text-gray-700">
							{faq.answer}
						</div>
					</div>
				);
			})}
		</div>
	);
}
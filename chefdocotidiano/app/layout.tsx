import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";

const montserrat = Montserrat({
	variable: "--font-montserrat",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700", "800"],
});

const lora = Lora({
	variable: "--font-lora",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: {
		template: "%s | Chef do Cotidiano",
		default: "Chef do Cotidiano — eBooks de Receitas",
	},
	description:
		"Receitas práticas e deliciosas para o seu dia a dia. eBooks em PDF com passo a passo, tempo, rendimento e dicas do chef.",
	metadataBase: new URL("https://chefdocotidiano.com.br"),
	openGraph: {
		title: "Chef do Cotidiano — eBooks de Receitas",
		description:
			"Receitas práticas e deliciosas para o seu dia a dia. eBooks em PDF com passo a passo.",
		type: "website",
		locale: "pt_BR",
		siteName: "Chef do Cotidiano",
	},
	twitter: {
		card: "summary_large_image",
		title: "Chef do Cotidiano — eBooks de Receitas",
		description:
			"Receitas práticas e deliciosas para o seu dia a dia. eBooks em PDF com passo a passo.",
	},
	icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const gaId = process.env.GA_ID;
	const metaPixelId = process.env.META_PIXEL_ID;
	return (
		<html lang="pt-BR">
			<body className={`${montserrat.variable} ${lora.variable} antialiased min-h-screen flex flex-col bg-white text-[#222]`}>
				<Header />
				<main className="flex-1">{children}</main>
				<Footer />

				{gaId ? (
					<>
						<Script
							src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
							strategy="afterInteractive"
						/>
						<Script id="ga-init" strategy="afterInteractive">
							{`
								window.dataLayer = window.dataLayer || [];
								function gtag(){dataLayer.push(arguments);}
								gtag('js', new Date());
								gtag('config', '${gaId}');
							`}
						</Script>
					</>
				) : null}

				{metaPixelId ? (
					<>
						<Script id="meta-pixel" strategy="afterInteractive">
							{`
								!function(f,b,e,v,n,t,s)
								{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
								n.callMethod.apply(n,arguments):n.queue.push(arguments)};
								if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
								n.queue=[];t=b.createElement(e);t.async=!0;
								t.src=v;s=b.getElementsByTagName(e)[0];
								s.parentNode.insertBefore(t,s)}(window, document,'script',
								'https://connect.facebook.net/en_US/fbevents.js');
								fbq('init', '${metaPixelId}');
								fbq('track', 'PageView');
							`}
						</Script>
						<noscript>
							<img height="1" width="1" alt="" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`} />
						</noscript>
					</>
				) : null}
			</body>
		</html>
	);
}

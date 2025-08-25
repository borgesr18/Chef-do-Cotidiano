import type { Metadata } from "next";
import { Montserrat, Lora } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Script from "next/script";
import Image from "next/image";
import { CacheProvider } from "@/providers/CacheProvider";
import PWAManager from "@/components/PWAManager";

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
	manifest: "/manifest.json",
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
	icons: {
		icon: "/favicon.ico",
		apple: [
			{ url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
			{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
		],
		other: [
			{ rel: "mask-icon", url: "/icons/icon.svg", color: "#f97316" },
		],
	},
	other: {
		"mobile-web-app-capable": "yes",
		"apple-mobile-web-app-capable": "yes",
		"apple-mobile-web-app-status-bar-style": "default",
		"apple-mobile-web-app-title": "Chef Cotidiano",
		"application-name": "Chef Cotidiano",
		"msapplication-TileColor": "#f97316",
		"msapplication-config": "/browserconfig.xml",
		"theme-color": "#f97316",
	},
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
			<head>
				<meta name="theme-color" content="#f97316" />
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Chef Cotidiano" />
				<meta name="mobile-web-app-capable" content="yes" />
				<link rel="manifest" href="/manifest.json" />
				<link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
			</head>
			<body className={`${montserrat.variable} ${lora.variable} antialiased min-h-screen flex flex-col bg-white text-[#222]`}>
				<CacheProvider>
					<PWAManager />
					<Header />
					<main className="flex-1">{children}</main>
					<Footer />
				</CacheProvider>

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
							<Image height={1} width={1} alt="" style={{ display: "none" }} src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`} />
						</noscript>
					</>
				) : null}
			</body>
		</html>
	);
}

# Chef do Cotidiano — Site de eBooks de Receitas (Next.js)

Site profissional para vender eBooks de receitas em PDF, focado em mobile, velocidade e SEO.

## Rodando localmente

```bash
pnpm install
pnpm dev
```

## Variáveis de ambiente

Crie `.env.local` baseado em `.env.example`:

- `NEXT_PUBLIC_WHATSAPP_URL`: link do WhatsApp com mensagem
- `CHECKOUT_PROVIDER`: `external` por padrão
- `CHECKOUT_LINK_DEFAULT`: URL do checkout (Kiwify/Hotmart)
- `GA_ID`: ID do Google Analytics
- `META_PIXEL_ID`: ID do Meta Pixel

## Onde editar

- Cores e fontes: `app/globals.css` (`--color-primary`, `--color-accent`, `--font-*`)
- Logo e header/footer: `components/Header.tsx`, `components/Footer.tsx`
- Home e seções: `app/page.tsx`
- Catálogo: `app/ebooks/page.tsx`
- Página do produto: `app/ebook/[slug]/page.tsx`
- Blog: `app/blog/*` e conteúdo em `data/posts.ts`
- eBooks (CMS simples): `data/ebooks.ts` (preço, capa, sumário, checkout_link)
- Lead magnet: rota `app/lead/route.ts` salva em `data/leads/leads.csv`

## Rotas

- `/` Home
- `/ebooks` Catálogo
- `/ebook/[slug]` Produto
- `/sobre`, `/blog`, `/blog/[slug]`, `/contato`
- `/obrigado`, `/obrigado-lead`
- `/politica-privacidade`, `/termos`

## SEO

- Metadados globais em `app/layout.tsx`
- JSON-LD para Produto e Artigo nas páginas respectivas
- `app/sitemap.ts` e `app/robots.ts`

## Deploy

Qualquer plataforma que suporte Next.js (Vercel, etc). Configure as variáveis em produção e domínio `chefdocotidiano.com.br`.

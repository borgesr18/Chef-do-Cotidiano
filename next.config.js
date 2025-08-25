/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações de performance
  experimental: {
    // Otimizar carregamento de páginas
    optimizePackageImports: [
      '@tanstack/react-query',
      'lucide-react',
      'date-fns',
    ],
    // Melhorar performance de CSS
    optimizeCss: true,
    // Otimizar fonts
    optimizeServerReact: true,
  },

  // Configurações do Turbopack
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Configurações de imagem otimizada
  images: {
    // Formatos modernos de imagem
    formats: ['image/webp', 'image/avif'],
    // Tamanhos de dispositivos para responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Tamanhos de imagem para diferentes breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Domínios permitidos para imagens externas
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
  },

  // Configurações de compilação
  compiler: {
    // Remover console.log em produção
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Headers de segurança e performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
      // Cache para recursos estáticos
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      // Cache para API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600'
          },
        ],
      },
    ];
  },

  // Configurações de webpack para otimização
  webpack: (config, { dev, isServer }) => {
    // Otimizações para produção
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk para bibliotecas externas
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: 10,
            },
            // Chunk específico para React Query
            reactQuery: {
              test: /[\\/]node_modules[\\/]@tanstack[\\/]react-query/,
              name: 'react-query',
              chunks: 'all',
              priority: 20,
            },
            // Chunk para componentes comuns
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Configurações para SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // Configurações de PWA (será expandido depois)
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
    ];
  },

  // Configurações de build
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  swcMinify: true,
  
  // Configurações de bundle
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      preventFullImport: true,
    },
  },
  
  // Configurações de desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    reactStrictMode: true,
  }),
};

module.exports = nextConfig;
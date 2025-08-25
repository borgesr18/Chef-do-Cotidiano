const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Ícone SVG base
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FF6B35;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F7931E;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" fill="url(#bg)"/>
  
  <!-- Chef Hat -->
  <ellipse cx="256" cy="180" rx="80" ry="60" fill="white"/>
  <rect x="176" y="160" width="160" height="40" fill="white"/>
  <circle cx="200" cy="140" r="15" fill="white"/>
  <circle cx="240" cy="120" r="18" fill="white"/>
  <circle cx="280" cy="130" r="16" fill="white"/>
  <circle cx="320" cy="145" r="14" fill="white"/>
  
  <!-- Pot -->
  <ellipse cx="256" cy="380" rx="100" ry="20" fill="#8B4513"/>
  <rect x="156" y="280" width="200" height="100" rx="10" fill="#A0522D"/>
  <ellipse cx="256" cy="280" rx="100" ry="20" fill="#CD853F"/>
  
  <!-- Pot Handle -->
  <path d="M 140 320 Q 120 320 120 340 Q 120 360 140 360" stroke="#8B4513" stroke-width="8" fill="none"/>
  <path d="M 372 320 Q 392 320 392 340 Q 392 360 372 360" stroke="#8B4513" stroke-width="8" fill="none"/>
  
  <!-- Utensils -->
  <rect x="200" y="240" width="6" height="80" fill="#C0C0C0"/>
  <ellipse cx="203" cy="235" rx="8" ry="12" fill="#C0C0C0"/>
  
  <rect x="220" y="240" width="6" height="80" fill="#C0C0C0"/>
  <rect x="218" y="230" width="10" height="15" fill="#C0C0C0"/>
  <rect x="220" y="225" width="6" height="8" fill="#C0C0C0"/>
  <rect x="222" y="220" width="2" height="8" fill="#C0C0C0"/>
  
  <!-- Steam -->
  <path d="M 230 260 Q 235 250 230 240 Q 225 230 230 220" stroke="white" stroke-width="3" fill="none" opacity="0.7"/>
  <path d="M 250 265 Q 255 255 250 245 Q 245 235 250 225" stroke="white" stroke-width="3" fill="none" opacity="0.7"/>
  <path d="M 270 260 Q 275 250 270 240 Q 265 230 270 220" stroke="white" stroke-width="3" fill="none" opacity="0.7"/>
</svg>
`;

// Tamanhos de ícones necessários para PWA
const iconSizes = [
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' }
];

async function generateIcons() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  
  // Criar diretório se não existir
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('Gerando ícones PWA...');

  for (const icon of iconSizes) {
    try {
      const outputPath = path.join(iconsDir, icon.name);
      
      await sharp(Buffer.from(iconSvg))
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
      
      console.log(`✓ Gerado: ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`✗ Erro ao gerar ${icon.name}:`, error.message);
    }
  }

  console.log('\n🎉 Todos os ícones PWA foram gerados com sucesso!');
}

// Executar a geração
generateIcons().catch(console.error);
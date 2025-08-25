const CACHE_NAME = 'chef-cotidiano-v1';
const STATIC_CACHE = 'chef-static-v1';
const DYNAMIC_CACHE = 'chef-dynamic-v1';
const IMAGE_CACHE = 'chef-images-v1';
const API_CACHE = 'chef-api-v1';

// Recursos para cache estático (sempre em cache)
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/offline.html',
];

// Recursos para cache dinâmico (cache sob demanda)
const CACHE_STRATEGIES = {
  // Cache first para recursos estáticos
  static: [
    /\/_next\/static\//,
    /\/icons\//,
    /\/images\//,
    /\.(css|js|woff2?|ttf|eot)$/,
  ],
  // Network first para APIs
  networkFirst: [
    /\/api\//,
  ],
  // Stale while revalidate para páginas
  staleWhileRevalidate: [
    /\/(recipes|categories|search)/,
  ],
};

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Remover caches antigos
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE &&
                cacheName !== IMAGE_CACHE &&
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim();
      })
  );
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requisições não HTTP
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Estratégia baseada no tipo de recurso
  if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isApiRequest(request.url)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (isImageRequest(request.url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isPageRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Estratégia Cache First
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('Service Worker: Serving from cache', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
      console.log('Service Worker: Cached new resource', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Service Worker: Cache first failed', error);
    return getOfflineFallback(request);
  }
}

// Estratégia Network First
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      const responseClone = networkResponse.clone();
      
      // Cache apenas GET requests
      if (request.method === 'GET') {
        cache.put(request, responseClone);
        console.log('Service Worker: Updated cache from network', request.url);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Service Worker: Network failed, trying cache', request.url);
    
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return getOfflineFallback(request);
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Buscar nova versão em background
  const networkPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const responseClone = networkResponse.clone();
        cache.put(request, responseClone);
        console.log('Service Worker: Background update completed', request.url);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('Service Worker: Background update failed', error);
    });
  
  // Retornar cache imediatamente se disponível
  if (cachedResponse) {
    console.log('Service Worker: Serving stale content', request.url);
    return cachedResponse;
  }
  
  // Se não há cache, aguardar network
  try {
    return await networkPromise;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

// Verificar se é recurso estático
function isStaticAsset(url) {
  return CACHE_STRATEGIES.static.some(pattern => pattern.test(url));
}

// Verificar se é requisição de API
function isApiRequest(url) {
  return CACHE_STRATEGIES.networkFirst.some(pattern => pattern.test(url));
}

// Verificar se é requisição de imagem
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg|avif)$/i.test(url);
}

// Verificar se é requisição de página
function isPageRequest(request) {
  return request.method === 'GET' && 
         request.headers.get('accept')?.includes('text/html');
}

// Fallback para offline
async function getOfflineFallback(request) {
  if (isPageRequest(request)) {
    const cache = await caches.open(STATIC_CACHE);
    return cache.match('/offline.html') || new Response('Offline', { status: 503 });
  }
  
  if (isImageRequest(request.url)) {
    return new Response(
      '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">Imagem offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
  
  return new Response('Recurso não disponível offline', { status: 503 });
}

// Limpar cache antigo periodicamente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAN_CACHE') {
    cleanOldCache();
  }
});

async function cleanOldCache() {
  const cacheNames = await caches.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
  
  for (const cacheName of cacheNames) {
    if (cacheName.includes('dynamic') || cacheName.includes('api')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        const dateHeader = response?.headers.get('date');
        
        if (dateHeader) {
          const cacheDate = new Date(dateHeader).getTime();
          if (now - cacheDate > maxAge) {
            await cache.delete(request);
            console.log('Service Worker: Cleaned old cache entry', request.url);
          }
        }
      }
    }
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: 'Nova receita disponível!',
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/icon-72x72.svg',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'Ver receita',
        icon: '/icons/view.svg'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/close.svg'
      }
    ]
  };
  
  if (event.data) {
    try {
      const data = event.data.json();
      options.body = data.body || options.body;
      options.data = { ...options.data, ...data };
    } catch (error) {
      console.error('Service Worker: Error parsing push data', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Chef do Cotidiano', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});
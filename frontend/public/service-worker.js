const CACHE_NAME = 'sirius-prism-v1';
const RUNTIME_CACHE = 'sirius-prism-runtime';

// Ресурсы для кэширования при установке
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия кэширования: Network First для API, Cache First для статики
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем Vite dev server ресурсы
  if (url.pathname.startsWith('/@vite/') || 
      url.pathname.startsWith('/@react-refresh') ||
      url.pathname.startsWith('/@fs/') ||
      url.pathname.includes('.tsx') ||
      url.pathname.includes('.ts') ||
      url.pathname.includes('?t=')) {
    return;
  }

  // Пропускаем запросы к другим доменам (кроме GraphQL)
  if (url.origin !== location.origin && !url.pathname.includes('graphql')) {
    return;
  }

  // Network First для API запросов
  if (url.pathname.includes('/graphql') || url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Кэшируем успешные ответы
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Если сеть недоступна, пытаемся вернуть из кэша
          return caches.match(request);
        })
    );
    return;
  }

  // Cache First для статических ресурсов
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Кэшируем только успешные GET запросы
        if (
          !response ||
          response.status !== 200 ||
          response.type === 'error' ||
          request.method !== 'GET'
        ) {
          return response;
        }

        const responseClone = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      });
    })
  );
});

// Обработка фоновой синхронизации
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-posts') {
    event.waitUntil(syncPosts());
  }
});

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Sirius Prism', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Функция синхронизации постов
async function syncPosts() {
  try {
    const cache = await caches.open(RUNTIME_CACHE);
    // Логика синхронизации
    console.log('[SW] Posts synced');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}


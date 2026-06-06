// Gold Alert AI - Service Worker
const CACHE_NAME = 'gold-alert-v2';
const RUNTIME_CACHE = 'gold-alert-runtime';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/css/style.css',
    '/assets/js/i18n.js',
    '/assets/js/api.js',
    '/assets/js/notifications.js',
    '/assets/js/app.js',
    '/assets/locales/ar.js',
    '/assets/locales/en.js',
    '/assets/locales/es.js',
    '/assets/locales/fr.js',
    '/assets/locales/de.js',
    '/assets/locales/tr.js',
    '/assets/locales/hi.js',
    '/assets/locales/zh.js',
    '/assets/icons/icon-72.png',
    '/assets/icons/icon-96.png',
    '/assets/icons/icon-128.png',
    '/assets/icons/icon-144.png',
    '/assets/icons/icon-152.png',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-384.png',
    '/assets/icons/icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[SW] Skip waiting');
                return self.skipWaiting();
            })
    );
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                    .map((name) => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('[SW] Claiming clients');
            return self.clients.claim();
        })
    );
});

// استراتيجية: Cache First, then Network
self.addEventListener('fetch', (event) => {
    // تجاهل طلبات Chrome extensions
    if (!event.request.url.startsWith('http')) return;
    
    // تجاهل طلبات API (لو كانت موجودة)
    if (event.request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // إرجاع من الكاش إذا وجد
            if (cachedResponse) {
                // تحديث الكاش في الخلفية
                fetch(event.request).then((response) => {
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(RUNTIME_CACHE).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                }).catch(() => {});
                
                return cachedResponse;
            }

            // إذا لم يوجد في الكاش، جلب من الشبكة
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseClone = response.clone();
                caches.open(RUNTIME_CACHE).then((cache) => {
                    cache.put(event.request, responseClone);
                });

                return response;
            }).catch(() => {
                // إذا فشل الاتصال، إرجاع صفحة رئيسية للتطبيق
                if (event.request.mode === 'navigate') {
                    return caches.match('/index.html');
                }
                return new Response('لا يوجد اتصال بالإنترنت', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            });
        })
    );
});

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push received');
    
    let data = {
        title: 'Gold Alert AI',
        body: 'إشارة تداول جديدة',
        icon: '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-72.png',
        data: { url: '/' }
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: data.icon,
        badge: data.badge,
        vibrate: [200, 100, 200, 100, 200],
        data: data.data,
        actions: [
            { action: 'view', title: 'عرض' },
            { action: 'close', title: 'إغلاق' }
        ],
        tag: data.tag || 'gold-alert',
        renotify: true,
        requireInteraction: data.requireInteraction || false
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click');
    event.notification.close();

    if (event.action === 'close') return;

    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data?.url || '/');
            }
        })
    );
});

// مزامنة الخلفية
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);
    if (event.tag === 'sync-signals') {
        event.waitUntil(syncSignals());
    }
});

async function syncSignals() {
    // هنا يمكن مزامنة الإشارات مع الخادم
    console.log('[SW] Syncing signals...');
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
        client.postMessage({ type: 'sync-complete', message: 'تمت المزامنة' });
    });
}
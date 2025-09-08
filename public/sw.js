// Service worker for better caching and preventing blank page issues
const CACHE_NAME = 'merlin-gallery-v2';
const STATIC_CACHE = 'merlin-static-v2';

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll([
                    '/',
                    '/favicon.png',
                ]);
            })
    );
    self.skipWaiting();
});

// Fetch event - handle different types of requests
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Always fetch API requests fresh (no caching)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    // If API fails, return a basic response
                    return new Response(
                        JSON.stringify({ finished: [], wip: [] }),
                        {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                })
        );
        return;
    }

    // For static assets, try cache first, then network
    event.respondWith(
        caches.match(request)
            .then((response) => {
                if (response) {
                    return response;
                }

                return fetch(request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();
                        caches.open(STATIC_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch(() => {
                        // If all else fails, return a basic HTML page
                        if (request.destination === 'document') {
                            return new Response(
                                `<!DOCTYPE html>
                                <html>
                                <head>
                                    <title>Merlin's Gallery</title>
                                    <meta charset="utf-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1">
                                </head>
                                <body>
                                    <h1>Loading...</h1>
                                    <p>Please refresh the page if this persists.</p>
                                    <script>window.location.reload();</script>
                                </body>
                                </html>`,
                                {
                                    status: 200,
                                    headers: { 'Content-Type': 'text/html' }
                                }
                            );
                        }
                    });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

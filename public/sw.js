// Service worker for caching static assets only
const STATIC_CACHE = 'merlin-static-v3';

// Detect if we're in development mode
const isDevelopment = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

// Install event - cache static resources
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll([
                    '/favicon.png',
                    '/vite.svg'
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

    // For static assets (images, CSS, JS), try cache first, then network
    if (request.destination === 'image' ||
        request.destination === 'script' ||
        request.destination === 'style' ||
        url.pathname.endsWith('.png') ||
        url.pathname.endsWith('.jpg') ||
        url.pathname.endsWith('.jpeg') ||
        url.pathname.endsWith('.webp') ||
        url.pathname.endsWith('.svg') ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js')) {

        // In development mode, be less aggressive with caching
        if (isDevelopment) {
            // Skip caching for Vite HMR assets and development files
            if (url.searchParams.has('t') || // Vite timestamp parameter
                url.pathname.includes('src/') || // Source files
                url.pathname.includes('@vite/') || // Vite client
                url.pathname.includes('@react-refresh') || // React refresh
                url.pathname.includes('node_modules/.vite/')) { // Vite deps

                console.log('Service Worker: Development mode - bypassing cache for:', request.url);
                event.respondWith(fetch(request));
                return;
            }
        }

        event.respondWith(
            caches.match(request)
                .then((response) => {
                    if (response) {
                        console.log('Service Worker: Serving from cache:', request.url);
                        return response;
                    }

                    return fetch(request)
                        .then((response) => {
                            // Don't cache if not a valid response
                            if (!response || response.status !== 200 || response.type !== 'basic') {
                                return response;
                            }

                            // In development, don't cache everything
                            if (isDevelopment) {
                                // Only cache truly static assets in development
                                const isStaticAsset = url.pathname.endsWith('.png') ||
                                    url.pathname.endsWith('.jpg') ||
                                    url.pathname.endsWith('.jpeg') ||
                                    url.pathname.endsWith('.webp') ||
                                    url.pathname.endsWith('.svg') ||
                                    url.pathname === '/favicon.png' ||
                                    url.pathname === '/vite.svg';

                                if (!isStaticAsset) {
                                    console.log('Service Worker: Development mode - not caching:', request.url);
                                    return response;
                                }
                            }

                            // Clone the response and cache it
                            const responseToCache = response.clone();
                            caches.open(STATIC_CACHE)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                    console.log('Service Worker: Cached new asset:', request.url);
                                });

                            return response;
                        })
                        .catch(() => {
                            console.log('Service Worker: Failed to fetch:', request.url);
                            return fetch(request); // Fallback to network
                        });
                })
        );
        return;
    }

    // For all other requests (including HTML), always fetch fresh
    event.respondWith(fetch(request));
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== STATIC_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

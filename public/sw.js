// Virtual Gavel - Mobile-First PWA Service Worker
const CACHE_NAME = 'virtual-gavel-v1'
const STATIC_CACHE = 'virtual-gavel-static-v1'
const DYNAMIC_CACHE = 'virtual-gavel-dynamic-v1'

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.jpg',
  '/icon-512x512.jpg',
  '/courtroom-background.jpg',
  '/data/cases.json'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Installed successfully')
        return self.skipWaiting()
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return
  
  // Skip non-http requests
  if (!event.request.url.startsWith('http')) return
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache:', event.request.url)
          return cachedResponse
        }
        
        // Otherwise fetch from network
        console.log('Service Worker: Fetching from network:', event.request.url)
        return fetch(event.request)
          .then((response) => {
            // Check if response is valid
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }
            
            // Clone response for caching
            const responseToCache = response.clone()
            
            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })
            
            return response
          })
          .catch(() => {
            // Network failed - serve offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/index.html')
            }
          })
      })
  )
})

// Background sync for game data
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered')
  if (event.tag === 'background-sync-game-data') {
    event.waitUntil(
      // Sync game progress when connection is restored
      syncGameData()
    )
  }
})

// Push notifications for game updates
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New game update available!',
    icon: '/icon-192x192.jpg',
    badge: '/icon-192x192.jpg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Play Now',
        icon: '/icon-192x192.jpg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.jpg'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Virtual Gavel', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  event.notification.close()
  
  if (event.action === 'explore') {
    // Open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Sync game data function
async function syncGameData() {
  try {
    console.log('Service Worker: Syncing game data...')
    // Implementation would depend on your game data structure
    // This is a placeholder for game progress sync
  } catch (error) {
    console.error('Service Worker: Error syncing game data:', error)
  }
}
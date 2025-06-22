// Service Worker for intelligent caching
const CACHE_NAME = 'bct-trading-v1'
const STATIC_CACHE = 'bct-static-v1'
const API_CACHE = 'bct-api-v1'

// Critical assets to cache immediately
const CRITICAL_ASSETS = [
  '/',
  '/trade',
  '/bctlogo.png',
  '/computerlogo.svg',
  '/_next/static/css/app/layout.css',
]

// API endpoints to cache with different strategies
const CACHEABLE_APIS = [
  '/api/token',
  '/api/trades',
  '/api/portfolio',
]

// External resources to cache
const EXTERNAL_RESOURCES = [
  'https://ipfs.io/ipfs/bafkreigxnxbmmov3vziotzzbcni4oja3qxdnrch6wjx6yqvm5xad2m3kce',
  'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache critical static assets
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_ASSETS)
      }),
      // Cache external resources
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(EXTERNAL_RESOURCES.map(url => new Request(url, { mode: 'cors' })))
      })
    ]).then(() => {
      self.skipWaiting()
    })
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      self.clients.claim()
    })
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle API requests with cache-first for token data, network-first for trades
  if (CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
    if (url.pathname.startsWith('/api/token')) {
      // Token data - cache first (rarely changes)
      event.respondWith(cacheFirstStrategy(request, API_CACHE, 5 * 60 * 1000)) // 5 min cache
    } else if (url.pathname.startsWith('/api/trades')) {
      // Trades data - network first (changes frequently)
      event.respondWith(networkFirstStrategy(request, API_CACHE, 30 * 1000)) // 30 sec cache
    } else {
      // Other APIs - network first with fallback
      event.respondWith(networkFirstStrategy(request, API_CACHE, 2 * 60 * 1000)) // 2 min cache
    }
    return
  }

  // Handle static assets
  if (request.destination === 'image' || request.destination === 'font' || request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE))
    return
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/')
      })
    )
    return
  }

  // Default: network first
  event.respondWith(fetch(request))
})

// Cache-first strategy with optional TTL
async function cacheFirstStrategy(request, cacheName, ttl) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  
  if (cached) {
    // Check TTL if provided
    if (ttl) {
      const cachedDate = new Date(cached.headers.get('date'))
      const now = new Date()
      if (now - cachedDate > ttl) {
        // Cache expired, fetch new data in background
        fetchAndCache(request, cache)
        return cached // Return stale data immediately
      }
    }
    return cached
  }

  // Not in cache, fetch and cache
  return fetchAndCache(request, cache)
}

// Network-first strategy with cache fallback
async function networkFirstStrategy(request, cacheName, ttl) {
  const cache = await caches.open(cacheName)
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Cache successful responses
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Network failed, try cache
    const cached = await cache.match(request)
    if (cached) {
      return cached
    }
    throw error
  }
}

// Helper function to fetch and cache
async function fetchAndCache(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    throw error
  }
} 
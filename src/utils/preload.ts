// Preload utility for critical application data
export class PreloadService {
  private static instance: PreloadService
  private preloadCache = new Map<string, Promise<any>>()

  static getInstance(): PreloadService {
    if (!PreloadService.instance) {
      PreloadService.instance = new PreloadService()
    }
    return PreloadService.instance
  }

  // Preload critical token data
  async preloadCriticalTokens() {
    const criticalTokens = [
      'So11111111111111111111111111111111111111112', // SOL
      'D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk', // BCT
    ]

    const promises = criticalTokens.map(tokenId => 
      this.preloadWithCache(`token-${tokenId}`, () => 
        fetch(`/api/token?id=${tokenId}`).then(res => res.json())
      )
    )

    return Promise.allSettled(promises)
  }

  // Preload Jupiter quote for common pairs
  async preloadCommonQuotes() {
    const commonPairs = [
      {
        input: 'So11111111111111111111111111111111111111112', // SOL
        output: 'D3CVUkqyXZKgVBdRD7XfuRxQXFKJ86474XyFZrqAbonk', // BCT
        amount: '1000000000' // 1 SOL in lamports
      }
    ]

    const promises = commonPairs.map(pair => 
      this.preloadWithCache(`quote-${pair.input}-${pair.output}`, () => 
        fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${pair.input}&outputMint=${pair.output}&amount=${pair.amount}&slippageBps=50`)
          .then(res => res.json())
          .catch(() => null) // Graceful failure
      )
    )

    return Promise.allSettled(promises)
  }

  // Preload portfolio data for authenticated users
  async preloadPortfolioData(walletAddress?: string) {
    if (!walletAddress) return

    return this.preloadWithCache(`portfolio-${walletAddress}`, () => 
      fetch(`/api/portfolio?walletAddress=${walletAddress}`)
        .then(res => res.json())
        .catch(() => null) // Graceful failure
    )
  }

  // Preload recent trades
  async preloadRecentTrades() {
    return this.preloadWithCache('recent-trades', () => 
      fetch('/api/trades')
        .then(res => res.json())
        .catch(() => null) // Graceful failure
    )
  }

  // Cache wrapper to prevent duplicate requests
  private preloadWithCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    if (this.preloadCache.has(key)) {
      return this.preloadCache.get(key)!
    }

    const promise = fetcher()
    this.preloadCache.set(key, promise)
    
    // Clean up cache after 5 minutes
    setTimeout(() => {
      this.preloadCache.delete(key)
    }, 5 * 60 * 1000)

    return promise
  }

  // Preload critical images (only local images to avoid CSP violations)
  preloadImages() {
    const criticalImages = [
      '/bctlogo.png',
      '/computerlogo.svg',
      // Removed external images to prevent CSP violations
    ]

    criticalImages.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  }

  // Initialize all preloading
  async initializePreloading(walletAddress?: string) {
    // Start all preloading in parallel
    const preloadTasks = [
      this.preloadCriticalTokens(),
      this.preloadCommonQuotes(),
      this.preloadRecentTrades(),
    ]

    if (walletAddress) {
      preloadTasks.push(this.preloadPortfolioData(walletAddress))
    }

    // Don't await - let them load in background
    Promise.allSettled(preloadTasks).then(() => {
      console.log('✅ Critical data preloading completed')
    })

    // Preload images immediately
    if (typeof window !== 'undefined') {
      this.preloadImages()
    }
  }

  // Clear all cached preloaded data (user-specific and global)
  public clearCache() {
    this.preloadCache.clear();
  }
}

// Export singleton instance
export const preloadService = PreloadService.getInstance() 
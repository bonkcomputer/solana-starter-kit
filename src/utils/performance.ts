// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor
  private metrics = new Map<string, number>()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Mark the start of an operation
  markStart(operation: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${operation}-start`)
    }
  }

  // Mark the end of an operation and calculate duration
  markEnd(operation: string) {
    if (typeof window !== 'undefined' && window.performance) {
      performance.mark(`${operation}-end`)
      try {
        performance.measure(operation, `${operation}-start`, `${operation}-end`)
        const measure = performance.getEntriesByName(operation)[0]
        this.metrics.set(operation, measure.duration)
        
        // Log slow operations
        if (measure.duration > 1000) {
          console.warn(`🐌 Slow operation: ${operation} took ${measure.duration.toFixed(2)}ms`)
        } else {
          console.log(`⚡ ${operation} completed in ${measure.duration.toFixed(2)}ms`)
        }
      } catch (error) {
        console.warn('Performance measurement failed:', error)
      }
    }
  }

  // Get metrics for analysis
  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  // Monitor Core Web Vitals
  monitorWebVitals() {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      console.log('🎯 LCP:', lastEntry.startTime.toFixed(2) + 'ms')
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const fidEntry = entry as any // PerformanceEventTiming not available in all browsers
        if (fidEntry.processingStart) {
          console.log('⚡ FID:', fidEntry.processingStart - fidEntry.startTime + 'ms')
        }
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const clsEntry = entry as any // LayoutShift interface not available in all browsers
        if (clsEntry.hadRecentInput !== undefined && !clsEntry.hadRecentInput) {
          console.log('📐 CLS:', clsEntry.value)
        }
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Monitor resource loading
  monitorResources() {
    if (typeof window === 'undefined') return

    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        const resource = entry as PerformanceResourceTiming
        if (resource.duration > 1000) {
          console.warn(`🐌 Slow resource: ${resource.name} took ${resource.duration.toFixed(2)}ms`)
        }
      })
    }).observe({ entryTypes: ['resource'] })
  }

  // Initialize all monitoring
  initialize() {
    if (typeof window !== 'undefined') {
      this.monitorWebVitals()
      this.monitorResources()
      
      // Log initial page load performance
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
          console.log('📊 Page Load Metrics:', {
            'DOM Content Loaded': navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart + 'ms',
            'Load Complete': navigation.loadEventEnd - navigation.loadEventStart + 'ms',
            'Total Load Time': navigation.loadEventEnd - navigation.fetchStart + 'ms'
          })
        }, 0)
      })
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance()

// Utility function to measure async operations
export async function measureAsync<T>(operation: string, fn: () => Promise<T>): Promise<T> {
  performanceMonitor.markStart(operation)
  try {
    const result = await fn()
    performanceMonitor.markEnd(operation)
    return result
  } catch (error) {
    performanceMonitor.markEnd(operation)
    throw error
  }
} 
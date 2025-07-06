// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Mark the start of a performance measurement
  mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`);
      this.metrics.set(`${name}-start`, performance.now());
    }
  }

  // Mark the end of a performance measurement and calculate duration
  measure(name: string): number {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const startTime = this.metrics.get(`${name}-start`);
      if (startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        performance.mark(`${name}-end`);
        performance.measure(name, `${name}-start`, `${name}-end`);
        
        console.log(`⚡ ${name}: ${duration.toFixed(2)}ms`);
        return duration;
      }
    }
    return 0;
  }

  // Log Core Web Vitals
  logCoreWebVitals(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // First Contentful Paint
      const fcpEntries = performance.getEntriesByName('first-contentful-paint');
      if (fcpEntries.length > 0) {
        console.log(`🎨 First Contentful Paint: ${fcpEntries[0].startTime.toFixed(2)}ms`);
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log(`🖼️ Largest Contentful Paint: ${lastEntry.startTime.toFixed(2)}ms`);
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // First Input Delay
      if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            console.log(`⌨️ First Input Delay: ${entry.processingStart - entry.startTime}ms`);
          });
        });
        observer.observe({ entryTypes: ['first-input'] });
      }
    }
  }

  // Monitor API call performance
  monitorApiCall(url: string, duration: number): void {
    const threshold = 1000; // 1 second threshold
    if (duration > threshold) {
      console.warn(`🐌 Slow API call detected: ${url} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`🚀 API call: ${url} completed in ${duration.toFixed(2)}ms`);
    }
  }

  // Get navigation timing
  getNavigationTiming(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('📊 Navigation Timing:');
        console.log(`  DNS lookup: ${navigation.domainLookupEnd - navigation.domainLookupStart}ms`);
        console.log(`  TCP connect: ${navigation.connectEnd - navigation.connectStart}ms`);
        console.log(`  Request: ${navigation.responseStart - navigation.requestStart}ms`);
        console.log(`  Response: ${navigation.responseEnd - navigation.responseStart}ms`);
        console.log(`  DOM processing: ${navigation.domComplete - navigation.domContentLoadedEventStart}ms`);
        console.log(`  Load complete: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
      }
    }
  }

  // Monitor bundle size (development only)
  logBundleInfo(): void {
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 Bundle optimization tips:');
      console.log('  - Run `pnpm analyze` to analyze bundle size');
      console.log('  - Check for duplicate dependencies');
      console.log('  - Use dynamic imports for large components');
      console.log('  - Optimize images and assets');
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility function to wrap API calls with performance monitoring
export function monitoredFetch(url: string, options?: RequestInit): Promise<Response> {
  const startTime = performance.now();
  
  return fetch(url, options)
    .then(response => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      performanceMonitor.monitorApiCall(url, duration);
      return response;
    })
    .catch(error => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.error(`❌ API call failed: ${url} (${duration.toFixed(2)}ms)`, error);
      throw error;
    });
}

// React hook for performance monitoring
export function usePerformanceMonitor() {
  return {
    mark: performanceMonitor.mark.bind(performanceMonitor),
    measure: performanceMonitor.measure.bind(performanceMonitor),
    monitorApiCall: performanceMonitor.monitorApiCall.bind(performanceMonitor),
  };
} 
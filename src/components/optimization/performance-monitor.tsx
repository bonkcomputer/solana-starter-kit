"use client";

import { useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';

export function PerformanceMonitorComponent() {
  useEffect(() => {
    // Start monitoring when component mounts
    performanceMonitor.mark('app-initialization');

    // Log navigation timing after page load
    const handleLoad = () => {
      setTimeout(() => {
        performanceMonitor.getNavigationTiming();
        performanceMonitor.logCoreWebVitals();
        performanceMonitor.logBundleInfo();
        performanceMonitor.measure('app-initialization');
      }, 100);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Monitor route changes (for Next.js App Router)
    const handleRouteChange = () => {
      performanceMonitor.mark('route-change');
      
      // Measure route change after a short delay
      setTimeout(() => {
        performanceMonitor.measure('route-change');
      }, 100);
    };

    // Listen for Next.js route changes
    if (typeof window !== 'undefined') {
      // For App Router, we can listen to popstate events
      window.addEventListener('popstate', handleRouteChange);
      
      // Also monitor pushState/replaceState for programmatic navigation
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;
      
      history.pushState = function(...args) {
        handleRouteChange();
        return originalPushState.apply(history, args);
      };
      
      history.replaceState = function(...args) {
        handleRouteChange();
        return originalReplaceState.apply(history, args);
      };
    }

    // Cleanup
    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Monitor React rendering performance in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderStart = performance.now();
      
      return () => {
        const renderEnd = performance.now();
        const renderTime = renderEnd - renderStart;
        
        if (renderTime > 16) { // 16ms threshold for 60fps
          console.warn(`🐌 Slow render detected: ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  });

  return null; // This component doesn't render anything
} 
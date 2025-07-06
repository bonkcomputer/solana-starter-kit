/**
 * Comprehensive logout cleanup utility
 * Ensures ALL user data is completely cleared when user logs out
 */

import { useSwapStore } from '@/components/trade/stores/use-swap-store';
import { preloadService } from '@/utils/preload';

export interface CleanupResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  completedSteps: string[];
  failedSteps: string[];
}

export class LogoutCleanupService {
  private static instance: LogoutCleanupService;
  private readonly CLEANUP_TIMEOUT = 10000; // 10 seconds timeout
  private readonly MAX_RETRIES = 2;

  static getInstance(): LogoutCleanupService {
    if (!LogoutCleanupService.instance) {
      LogoutCleanupService.instance = new LogoutCleanupService();
    }
    return LogoutCleanupService.instance;
  }

  /**
   * Performs comprehensive cleanup of all user data with enhanced error handling
   */
  async performCompleteCleanup(): Promise<CleanupResult> {
    console.log('🧹 Starting comprehensive logout cleanup...');

    const result: CleanupResult = {
      success: false,
      errors: [],
      warnings: [],
      completedSteps: [],
      failedSteps: []
    };

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Cleanup timeout')), this.CLEANUP_TIMEOUT);
    });

    try {
      // Race cleanup against timeout
      await Promise.race([
        this.executeCleanupSteps(result),
        timeoutPromise
      ]);

      // Determine overall success
      result.success = result.failedSteps.length === 0;
      
      if (result.success) {
        console.log('✅ Logout cleanup completed successfully');
      } else {
        console.warn('⚠️ Logout cleanup completed with some failures:', result.failedSteps);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Critical error during logout cleanup:', errorMessage);
      result.errors.push(`Critical cleanup failure: ${errorMessage}`);
      result.success = false;
    }

    return result;
  }

  /**
   * Execute all cleanup steps with individual error handling
   */
  private async executeCleanupSteps(result: CleanupResult): Promise<void> {
    const cleanupSteps = [
      { name: 'Browser Storage', fn: () => this.clearBrowserStorage() },
      { name: 'Service Worker Caches', fn: () => this.clearServiceWorkerCaches() },
      { name: 'Zustand Stores', fn: () => this.clearZustandStores() },
      { name: 'Preload Cache', fn: () => this.clearPreloadCache() },
      { name: 'React Query/SWR Cache', fn: () => this.clearReactQueryCache() },
      { name: 'IndexedDB', fn: () => this.clearIndexedDB() },
      { name: 'Memory References', fn: () => this.clearMemoryReferences() }
    ];

    for (const step of cleanupSteps) {
      await this.executeStepWithRetry(step.name, step.fn, result);
    }
  }

  /**
   * Execute a cleanup step with retry logic
   */
  private async executeStepWithRetry(
    stepName: string, 
    stepFn: () => Promise<void> | void, 
    result: CleanupResult
  ): Promise<void> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await stepFn();
        result.completedSteps.push(stepName);
        console.log(`✅ ${stepName} cleanup completed`);
        return; // Success, exit retry loop
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`⚠️ ${stepName} cleanup failed (attempt ${attempt}/${this.MAX_RETRIES}):`, lastError.message);
        
        if (attempt < this.MAX_RETRIES) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
      }
    }

    // All retries failed
    const errorMessage = `${stepName} cleanup failed after ${this.MAX_RETRIES} attempts: ${lastError?.message}`;
    result.failedSteps.push(stepName);
    result.errors.push(errorMessage);
    console.error(`❌ ${errorMessage}`);
  }

  /**
   * Clear browser storage (localStorage, sessionStorage)
   * Preserves only essential app state like computer on/off
   */
  private clearBrowserStorage(): void {
    console.log('🗑️ Clearing browser storage...');

    // Clear localStorage except for essential app state
    const keysToKeep = [
      'bct-computer-on',           // Computer state
      'theme',                     // User theme preference (non-sensitive)
      'app-version',               // App version info
      'performance-settings'       // Performance settings (non-sensitive)
    ];

    const allKeys = Object.keys(localStorage);
    let removedCount = 0;
    
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        try {
          localStorage.removeItem(key);
          removedCount++;
          console.log(`   Removed localStorage key: ${key}`);
        } catch (error) {
          console.warn(`   Failed to remove localStorage key ${key}:`, error);
          throw new Error(`Failed to remove localStorage key: ${key}`);
        }
      }
    });

    // Clear all sessionStorage
    try {
      const sessionStorageLength = sessionStorage.length;
      sessionStorage.clear();
      console.log(`   Cleared sessionStorage (${sessionStorageLength} items)`);
    } catch (error) {
      console.warn('   Failed to clear sessionStorage:', error);
      throw new Error('Failed to clear sessionStorage');
    }

    console.log(`   Browser storage cleanup: ${removedCount} localStorage items removed`);
  }

  /**
   * Clear Service Worker caches (user-specific data)
   */
  private async clearServiceWorkerCaches(): Promise<void> {
    console.log('🗑️ Clearing service worker caches...');

    if (!('caches' in window)) {
      console.log('   Cache API not available, skipping...');
      return;
    }

    try {
      const cacheNames = await caches.keys();
      let deletedCount = 0;
      
      for (const cacheName of cacheNames) {
        // Clear API caches and user-specific caches
        if (cacheName.includes('api') || 
            cacheName.includes('user') || 
            cacheName.includes('profile') ||
            cacheName.includes('auth')) {
          try {
            await caches.delete(cacheName);
            deletedCount++;
            console.log(`   Deleted cache: ${cacheName}`);
          } catch (error) {
            console.warn(`   Failed to delete cache ${cacheName}:`, error);
            // Don't throw for individual cache failures
          }
        }
      }

      console.log(`   Service worker cache cleanup: ${deletedCount} caches deleted`);
    } catch (error) {
      console.error('   Error accessing cache API:', error);
      throw new Error('Failed to access cache API');
    }
  }

  /**
   * Clear Zustand stores
   */
  private clearZustandStores(): void {
    console.log('🗑️ Clearing Zustand stores...');

    try {
      // Reset swap store to default state
      const swapStore = useSwapStore.getState();
      swapStore.setOpen(false);
      swapStore.setInputs({
        inputMint: 'So11111111111111111111111111111111111111112', // SOL_MINT
        outputMint: 'BctKKhj4Bq5Fzng9mFYqKDR2UWTmNxMGHJFXvEYKNdgP', // BCT_MINT
        inputAmount: 0,
      });
      console.log('   Reset swap store');

      // Add other Zustand stores here as needed
      // Example: otherStore.getState().reset();

    } catch (error) {
      console.error('   Error clearing Zustand stores:', error);
      throw new Error('Failed to clear Zustand stores');
    }
  }

  /**
   * Clear preload cache
   */
  private clearPreloadCache(): void {
    console.log('🗑️ Clearing preload cache...');

    try {
      preloadService.clearCache();
      console.log('   Cleared preload cache');
    } catch (error) {
      console.error('   Error clearing preload cache:', error);
      throw new Error('Failed to clear preload cache');
    }
  }

  /**
   * Clear React Query/SWR cache if present
   */
  private clearReactQueryCache(): void {
    console.log('🗑️ Clearing React Query/SWR cache...');

    let clearedCaches = 0;

    try {
      // If using SWR, clear its cache
      if (typeof window !== 'undefined' && (window as any).swrCache) {
        (window as any).swrCache.clear();
        clearedCaches++;
        console.log('   Cleared SWR cache');
      }

      // If using React Query, clear its cache
      if (typeof window !== 'undefined' && (window as any).queryClient) {
        (window as any).queryClient.clear();
        clearedCaches++;
        console.log('   Cleared React Query cache');
      }

      if (clearedCaches === 0) {
        console.log('   No React Query/SWR caches found');
      }

    } catch (error) {
      console.error('   Error clearing React Query/SWR cache:', error);
      throw new Error('Failed to clear React Query/SWR cache');
    }
  }

  /**
   * Clear IndexedDB databases (if any)
   */
  private async clearIndexedDB(): Promise<void> {
    console.log('🗑️ Clearing IndexedDB...');

    if (!('indexedDB' in window)) {
      console.log('   IndexedDB not available, skipping...');
      return;
    }

    try {
      // List common database names that might contain user data
      const dbNamesToClear = [
        'user-data',
        'profile-cache',
        'trading-data',
        'wallet-cache',
        'points-cache'
      ];

      let deletedCount = 0;

      for (const dbName of dbNamesToClear) {
                  try {
            indexedDB.deleteDatabase(dbName);
            deletedCount++;
            console.log(`   Deleted IndexedDB: ${dbName}`);
          } catch (_error) {
            // Database might not exist, which is fine
            console.log(`   IndexedDB ${dbName} not found or already deleted`);
          }
      }

      console.log(`   IndexedDB cleanup: ${deletedCount} databases processed`);
    } catch (error) {
      console.error('   Error clearing IndexedDB:', error);
      throw new Error('Failed to clear IndexedDB');
    }
  }

  /**
   * Clear any remaining memory references
   */
  private clearMemoryReferences(): void {
    console.log('🗑️ Clearing memory references...');

    try {
      let clearedCount = 0;

      // Clear any global variables that might contain user data
      if (typeof window !== 'undefined') {
        const keysToDelete = [
          'cachedUserData',
          'userProfile',
          'walletInfo',
          'tradingData',
          'pointsCache'
        ];

        keysToDelete.forEach(key => {
          if ((window as any)[key]) {
            delete (window as any)[key];
            clearedCount++;
          }
        });
        
        console.log(`   Cleared ${clearedCount} global memory references`);
      }

      // Force garbage collection if available (development only)
      if (process.env.NODE_ENV === 'development' && (window as any).gc) {
        (window as any).gc();
        console.log('   Triggered garbage collection');
      }

    } catch (error) {
      console.error('   Error clearing memory references:', error);
      throw new Error('Failed to clear memory references');
    }
  }

  /**
   * Verify cleanup was successful with enhanced checking
   */
  async verifyCleanup(): Promise<{ success: boolean; issues: string[]; warnings: string[] }> {
    console.log('🔍 Verifying logout cleanup...');

    const issues: string[] = [];
    const warnings: string[] = [];

    try {
      // Check localStorage for user data
      const sensitiveKeys = ['user', 'profile', 'wallet', 'auth', 'token', 'privy'];
      Object.keys(localStorage).forEach(key => {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          issues.push(`Sensitive data still in localStorage: ${key}`);
        }
      });

      // Check sessionStorage (should be empty)
      if (sessionStorage.length > 0) {
        const items = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key) items.push(key);
        }
        issues.push(`SessionStorage not empty: ${items.join(', ')}`);
      }

      // Check for user-specific caches
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          const userCaches = cacheNames.filter(name => 
            name.includes('user') || name.includes('profile') || name.includes('auth')
          );
          if (userCaches.length > 0) {
            warnings.push(`User caches still present: ${userCaches.join(', ')}`);
          }
        } catch (_error) {
          warnings.push('Could not verify cache cleanup');
        }
      }

      // Check for global variables
      if (typeof window !== 'undefined') {
        const sensitiveGlobals = ['cachedUserData', 'userProfile', 'walletInfo'];
        sensitiveGlobals.forEach(key => {
          if ((window as any)[key]) {
            issues.push(`Global variable still present: ${key}`);
          }
        });
      }

      const success = issues.length === 0;
      
      if (success) {
        console.log('✅ Cleanup verification passed');
      } else {
        console.warn(`⚠️ Cleanup verification found ${issues.length} issues`);
        issues.forEach(issue => console.warn(`   - ${issue}`));
      }

      if (warnings.length > 0) {
        warnings.forEach(warning => console.warn(`   Warning: ${warning}`));
      }

      return { success, issues, warnings };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error verifying cleanup:', errorMessage);
      return { 
        success: false, 
        issues: [`Verification failed: ${errorMessage}`], 
        warnings: [] 
      };
    }
  }
}

// Export singleton instance
export const logoutCleanupService = LogoutCleanupService.getInstance();

// Enhanced convenience function with error handling
export async function performLogoutCleanup(): Promise<CleanupResult> {
  try {
    return await logoutCleanupService.performCompleteCleanup();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Logout cleanup failed:', errorMessage);
    
    return {
      success: false,
      errors: [errorMessage],
      warnings: [],
      completedSteps: [],
      failedSteps: ['All steps']
    };
  }
}

// Enhanced verification function
export async function verifyLogoutCleanup(): Promise<{ success: boolean; issues: string[]; warnings: string[] }> {
  try {
    return await logoutCleanupService.verifyCleanup();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      issues: [`Verification error: ${errorMessage}`], 
      warnings: [] 
    };
  }
} 
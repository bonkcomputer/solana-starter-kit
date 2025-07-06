/**
 * Comprehensive test for logout cleanup functionality
 * Tests user switching scenarios and data isolation
 */

// Simulate browser environment
global.window = {
  localStorage: {
    data: {},
    getItem(key) { return this.data[key] || null },
    setItem(key, value) { this.data[key] = value },
    removeItem(key) { delete this.data[key] },
    clear() { this.data = {} },
    get length() { return Object.keys(this.data).length },
    key(index) { return Object.keys(this.data)[index] || null }
  },
  sessionStorage: {
    data: {},
    getItem(key) { return this.data[key] || null },
    setItem(key, value) { this.data[key] = value },
    removeItem(key) { delete this.data[key] },
    clear() { this.data = {} },
    get length() { return Object.keys(this.data).length },
    key(index) { return Object.keys(this.data)[index] || null }
  },
  caches: {
    _caches: new Map(),
    async keys() { return Array.from(this._caches.keys()) },
    async delete(name) { return this._caches.delete(name) },
    async open(name) { 
      if (!this._caches.has(name)) {
        this._caches.set(name, new Map());
      }
      return { name };
    }
  },
  indexedDB: {
    deleteDatabase(name) { 
      console.log(`Mock: Deleted IndexedDB ${name}`);
      return { onsuccess: null, onerror: null };
    }
  },
  dispatchEvent(event) {
    console.log(`Mock: Dispatched event ${event.type}`);
  },
  addEventListener() {},
  removeEventListener() {}
};

global.CustomEvent = class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options?.detail;
  }
};

// Mock Zustand store
const mockSwapStore = {
  getState: () => ({
    setOpen: (open) => console.log(`Mock: Set swap dialog open: ${open}`),
    setInputs: (inputs) => console.log(`Mock: Set swap inputs:`, inputs)
  })
};

// Mock preload service
const mockPreloadService = {
  clearCache: () => console.log('Mock: Cleared preload cache')
};

// Mock the imports
const useSwapStore = mockSwapStore;
const preloadService = mockPreloadService;

// Import the cleanup service (simulated)
class LogoutCleanupService {
  constructor() {
    this.CLEANUP_TIMEOUT = 10000;
    this.MAX_RETRIES = 2;
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new LogoutCleanupService();
    }
    return this.instance;
  }

  async performCompleteCleanup() {
    console.log('🧹 Starting comprehensive logout cleanup...');

    const result = {
      success: false,
      errors: [],
      warnings: [],
      completedSteps: [],
      failedSteps: []
    };

    try {
      await this.executeCleanupSteps(result);
      result.success = result.failedSteps.length === 0;
      
      if (result.success) {
        console.log('✅ Logout cleanup completed successfully');
      } else {
        console.warn('⚠️ Logout cleanup completed with some failures:', result.failedSteps);
      }

    } catch (error) {
      const errorMessage = error.message || 'Unknown error';
      console.error('❌ Critical error during logout cleanup:', errorMessage);
      result.errors.push(`Critical cleanup failure: ${errorMessage}`);
      result.success = false;
    }

    return result;
  }

  async executeCleanupSteps(result) {
    const cleanupSteps = [
      { name: 'Browser Storage', fn: () => this.clearBrowserStorage() },
      { name: 'Service Worker Caches', fn: () => this.clearServiceWorkerCaches() },
      { name: 'Zustand Stores', fn: () => this.clearZustandStores() },
      { name: 'Preload Cache', fn: () => this.clearPreloadCache() },
      { name: 'React Component State', fn: () => this.clearReactComponentState() },
      { name: 'IndexedDB', fn: () => this.clearIndexedDB() },
      { name: 'Memory References', fn: () => this.clearMemoryReferences() },
      { name: 'Network Caches', fn: () => this.clearNetworkCaches() }
    ];

    for (const step of cleanupSteps) {
      await this.executeStepWithRetry(step.name, step.fn, result);
    }
  }

  async executeStepWithRetry(stepName, stepFn, result) {
    let lastError = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await stepFn();
        result.completedSteps.push(stepName);
        console.log(`✅ ${stepName} cleanup completed`);
        return;
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${stepName} cleanup failed (attempt ${attempt}/${this.MAX_RETRIES}):`, error.message);
        
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, 100 * attempt));
        }
      }
    }

    const errorMessage = `${stepName} cleanup failed after ${this.MAX_RETRIES} attempts: ${lastError?.message}`;
    result.failedSteps.push(stepName);
    result.errors.push(errorMessage);
    console.error(`❌ ${errorMessage}`);
  }

  clearBrowserStorage() {
    console.log('🗑️ Clearing browser storage...');

    const keysToKeep = [
      'bct-computer-on',
      'theme',
      'app-version',
      'performance-settings'
    ];

    const sensitiveKeyPatterns = [
      'privy', 'auth', 'user', 'profile', 'wallet', 'token',
      'points', 'trading', 'swap', 'portfolio', 'session', 'login', 'cache'
    ];

    const allKeys = Object.keys(window.localStorage.data);
    let removedCount = 0;
    
    allKeys.forEach(key => {
      const shouldRemove = !keysToKeep.includes(key) && 
        (sensitiveKeyPatterns.some(pattern => key.toLowerCase().includes(pattern)) || 
         !keysToKeep.includes(key));

      if (shouldRemove) {
        window.localStorage.removeItem(key);
        removedCount++;
        console.log(`   Removed localStorage key: ${key}`);
      }
    });

    const sessionStorageLength = window.sessionStorage.length;
    window.sessionStorage.clear();
    console.log(`   Cleared sessionStorage (${sessionStorageLength} items)`);
    console.log(`   Browser storage cleanup: ${removedCount} localStorage items removed`);
  }

  async clearServiceWorkerCaches() {
    console.log('🗑️ Clearing service worker caches...');

    const cacheNames = await window.caches.keys();
    let deletedCount = 0;
    
    for (const cacheName of cacheNames) {
      if (cacheName.includes('api') || 
          cacheName.includes('user') || 
          cacheName.includes('profile') ||
          cacheName.includes('auth')) {
        await window.caches.delete(cacheName);
        deletedCount++;
        console.log(`   Deleted cache: ${cacheName}`);
      }
    }

    console.log(`   Service worker cache cleanup: ${deletedCount} caches deleted`);
  }

  clearZustandStores() {
    console.log('🗑️ Clearing Zustand stores...');
    
    const swapStore = useSwapStore.getState();
    swapStore.setOpen(false);
    swapStore.setInputs({
      inputMint: 'So11111111111111111111111111111111111111112',
      outputMint: 'BctKKhj4Bq5Fzng9mFYqKDR2UWTmNxMGHJFXvEYKNdgP',
      inputAmount: 0,
    });
    console.log('   Reset swap store');
  }

  clearPreloadCache() {
    console.log('🗑️ Clearing preload cache...');
    preloadService.clearCache();
    console.log('   Cleared preload cache');
  }

  clearReactComponentState() {
    console.log('🗑️ Clearing React Component State...');
    
    const stateKeysToDelete = [
      'cachedUserData', 'userProfile', 'walletInfo', 'tradingData', 'pointsCache',
      'currentUserState', 'profileData', 'authState', 'loginState'
    ];

    let clearedCount = 0;
    stateKeysToDelete.forEach(key => {
      if (window[key]) {
        delete window[key];
        clearedCount++;
      }
    });

    window.dispatchEvent(new CustomEvent('user-logout-cleanup', {
      detail: { timestamp: Date.now(), reason: 'user-logout' }
    }));
    
    console.log(`   Cleared ${clearedCount} React component state references`);
  }

  async clearIndexedDB() {
    console.log('🗑️ Clearing IndexedDB...');
    
    const dbNamesToClear = [
      'user-data', 'profile-cache', 'trading-data', 'wallet-cache', 'points-cache'
    ];

    let deletedCount = 0;
    for (const dbName of dbNamesToClear) {
      window.indexedDB.deleteDatabase(dbName);
      deletedCount++;
      console.log(`   Deleted IndexedDB: ${dbName}`);
    }

    console.log(`   IndexedDB cleanup: ${deletedCount} databases processed`);
  }

  clearMemoryReferences() {
    console.log('🗑️ Clearing memory references...');
    
    const keysToDelete = [
      'cachedUserData', 'userProfile', 'walletInfo', 'tradingData', 'pointsCache'
    ];

    let clearedCount = 0;
    keysToDelete.forEach(key => {
      if (window[key]) {
        delete window[key];
        clearedCount++;
      }
    });
    
    console.log(`   Cleared ${clearedCount} global memory references`);
  }

  async clearNetworkCaches() {
    console.log('🗑️ Clearing Network Caches...');
    
    const cacheNames = await window.caches.keys();
    const networkCaches = cacheNames.filter(name => 
      name.includes('network') || name.includes('fetch') || name.includes('http')
    );
    
    for (const cacheName of networkCaches) {
      await window.caches.delete(cacheName);
      console.log(`   Deleted network cache: ${cacheName}`);
    }
    
    if (networkCaches.length === 0) {
      console.log('   No network caches found');
    }
    
    console.log('   Network cache cleanup completed');
  }

  async verifyCleanup() {
    console.log('🔍 Verifying logout cleanup...');

    const issues = [];
    const warnings = [];

    // Check localStorage for user data
    const sensitiveKeys = ['user', 'profile', 'wallet', 'auth', 'token', 'privy'];
    Object.keys(window.localStorage.data).forEach(key => {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        issues.push(`Sensitive data still in localStorage: ${key}`);
      }
    });

    // Check sessionStorage (should be empty)
    if (window.sessionStorage.length > 0) {
      const items = [];
      for (let i = 0; i < window.sessionStorage.length; i++) {
        const key = window.sessionStorage.key(i);
        if (key) items.push(key);
      }
      issues.push(`SessionStorage not empty: ${items.join(', ')}`);
    }

    // Check for user-specific caches
    const cacheNames = await window.caches.keys();
    const userCaches = cacheNames.filter(name => 
      name.includes('user') || name.includes('profile') || name.includes('auth')
    );
    if (userCaches.length > 0) {
      warnings.push(`User caches still present: ${userCaches.join(', ')}`);
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
  }
}

// Test scenarios
async function runComprehensiveTests() {
  console.log('🚀 Starting comprehensive logout cleanup tests...\n');

  const cleanupService = LogoutCleanupService.getInstance();

  // Test 1: User switching scenario
  console.log('📋 Test 1: User switching scenario');
  console.log('Setting up User A data...');
  
  // Simulate User A data
  window.localStorage.setItem('privy-user-id', 'user-a-12345');
  window.localStorage.setItem('user-profile', JSON.stringify({ username: 'userA', wallet: 'wallet-a' }));
  window.localStorage.setItem('auth-token', 'token-a-xyz');
  window.localStorage.setItem('bct-computer-on', 'true'); // Should be preserved
  window.localStorage.setItem('trading-history', JSON.stringify([{ trade: 'buy', amount: 100 }]));
  window.sessionStorage.setItem('session-data', 'user-a-session');
  
  // Add some caches
  await window.caches.open('api-user-cache');
  await window.caches.open('profile-cache');
  await window.caches.open('static-assets'); // Should not be deleted
  
  // Add global state
  window.cachedUserData = { userId: 'user-a', profile: 'data' };
  window.walletInfo = { address: 'wallet-a', balance: 1000 };

  console.log('📊 Before cleanup:');
  console.log(`   localStorage items: ${window.localStorage.length}`);
  console.log(`   sessionStorage items: ${window.sessionStorage.length}`);
  console.log(`   Cache names: ${(await window.caches.keys()).join(', ')}`);
  console.log(`   Global state: cachedUserData=${!!window.cachedUserData}, walletInfo=${!!window.walletInfo}`);

  // Perform cleanup
  console.log('\n🧹 Performing logout cleanup...');
  const result = await cleanupService.performCompleteCleanup();

  // Verify cleanup
  console.log('\n🔍 After cleanup:');
  console.log(`   localStorage items: ${window.localStorage.length}`);
  console.log(`   sessionStorage items: ${window.sessionStorage.length}`);
  console.log(`   Cache names: ${(await window.caches.keys()).join(', ')}`);
  console.log(`   Global state: cachedUserData=${!!window.cachedUserData}, walletInfo=${!!window.walletInfo}`);
  console.log(`   bct-computer-on preserved: ${window.localStorage.getItem('bct-computer-on')}`);

  // Run verification
  const verification = await cleanupService.verifyCleanup();
  
  console.log('\n📊 Test 1 Results:');
  console.log(`   Cleanup success: ${result.success}`);
  console.log(`   Completed steps: ${result.completedSteps.length}/${result.completedSteps.length + result.failedSteps.length}`);
  console.log(`   Verification success: ${verification.success}`);
  console.log(`   Issues found: ${verification.issues.length}`);
  console.log(`   Warnings: ${verification.warnings.length}`);

  if (result.errors.length > 0) {
    console.log('   Errors:', result.errors);
  }

  // Test 2: Simulate User B login after cleanup
  console.log('\n📋 Test 2: User B login simulation');
  console.log('Setting up User B data...');
  
  window.localStorage.setItem('privy-user-id', 'user-b-67890');
  window.localStorage.setItem('user-profile', JSON.stringify({ username: 'userB', wallet: 'wallet-b' }));
  window.localStorage.setItem('auth-token', 'token-b-abc');
  window.sessionStorage.setItem('session-data', 'user-b-session');
  
  console.log('✅ User B data set successfully');
  console.log(`   New user ID: ${window.localStorage.getItem('privy-user-id')}`);
  console.log(`   Computer state preserved: ${window.localStorage.getItem('bct-computer-on')}`);

  // Test 3: Edge case - cleanup during error conditions
  console.log('\n📋 Test 3: Error handling test');
  
  // Simulate storage errors
  const originalRemoveItem = window.localStorage.removeItem;
  window.localStorage.removeItem = function(key) {
    if (key === 'error-key') {
      throw new Error('Simulated storage error');
    }
    return originalRemoveItem.call(this, key);
  };
  
  window.localStorage.setItem('error-key', 'will cause error');
  window.localStorage.setItem('normal-key', 'should be removed');
  
  const errorResult = await cleanupService.performCompleteCleanup();
  
  console.log('📊 Error handling test results:');
  console.log(`   Cleanup completed despite errors: ${errorResult.completedSteps.length > 0}`);
  console.log(`   Error handled gracefully: ${errorResult.errors.length > 0}`);
  
  // Restore original function
  window.localStorage.removeItem = originalRemoveItem;

  console.log('\n🎉 All tests completed!');
  
  // Final summary
  const allTestsPassed = result.success && verification.success && errorResult.completedSteps.length > 0;
  console.log(`\n🏆 Overall test result: ${allTestsPassed ? 'PASSED' : 'FAILED'}`);
  
  if (allTestsPassed) {
    console.log('✅ Logout cleanup is fully functional and ready for user switching!');
  } else {
    console.log('❌ Some tests failed - review the implementation');
  }

  return allTestsPassed;
}

// Run the tests
runComprehensiveTests().catch(console.error); 
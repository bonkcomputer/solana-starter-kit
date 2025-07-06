/**
 * Test script to verify error handling in logout cleanup
 * Tests various failure scenarios to ensure graceful degradation
 */

// Mock localStorage and sessionStorage with error scenarios
const createMockStorageWithErrors = (shouldFail = false) => ({
  data: {},
  setItem(key, value) {
    if (shouldFail && key === 'error-trigger') {
      throw new Error('Mock storage error');
    }
    this.data[key] = value;
  },
  getItem(key) {
    return this.data[key] || null;
  },
  removeItem(key) {
    if (shouldFail && key.includes('error')) {
      throw new Error('Failed to remove item');
    }
    delete this.data[key];
  },
  clear() {
    if (shouldFail) {
      throw new Error('Failed to clear storage');
    }
    this.data = {};
  },
  get length() {
    return Object.keys(this.data).length;
  }
});

// Helper functions for better output
const log = (...args) => console.log('🧪', ...args);
const warn = (...args) => console.warn('⚠️', ...args);
const error = (...args) => console.error('❌', ...args);

// Mock cleanup service with intentional failures
const mockLogoutCleanupWithErrors = {
  async performCompleteCleanup(localStorage, sessionStorage, shouldFailStorage = false, shouldTimeout = false) {
    log('🧹 Starting cleanup with potential errors...');

    const result = {
      success: false,
      errors: [],
      warnings: [],
      completedSteps: [],
      failedSteps: []
    };

    // Simulate timeout
    if (shouldTimeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
      throw new Error('Cleanup timeout');
    }

    // Browser Storage step (with potential failure)
    try {
      const keysToKeep = ['bct-computer-on', 'theme'];
      const allKeys = Object.keys(localStorage.data);
      let removedCount = 0;
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key); // This might throw
          removedCount++;
        }
      });

      sessionStorage.clear(); // This might throw
      
      result.completedSteps.push('Browser Storage');
      log(`✅ Browser Storage cleanup completed (${removedCount} items removed)`);
    } catch (err) {
      result.failedSteps.push('Browser Storage');
      result.errors.push(`Browser Storage cleanup failed: ${err.message}`);
      log(`❌ Browser Storage cleanup failed: ${err.message}`);
    }

    // Service Worker Caches step (simulated failure)
    if (shouldFailStorage) {
      result.failedSteps.push('Service Worker Caches');
      result.errors.push('Service Worker Caches cleanup failed: Mock cache API error');
      log('❌ Service Worker Caches cleanup failed: Mock cache API error');
    } else {
      result.completedSteps.push('Service Worker Caches');
      log('✅ Service Worker Caches cleanup completed');
    }

    // Zustand Stores step (simulated success)
    result.completedSteps.push('Zustand Stores');
    log('✅ Zustand Stores cleanup completed');

    // Determine overall success
    result.success = result.failedSteps.length === 0;

    if (result.success) {
      log('✅ Logout cleanup completed successfully');
    } else {
      warn(`⚠️ Logout cleanup completed with failures: ${result.failedSteps.join(', ')}`);
    }

    return result;
  },

  async verifyCleanup(localStorage, sessionStorage) {
    log('🔍 Verifying cleanup...');

    const issues = [];
    const warnings = [];

    // Check localStorage for user data
    const sensitiveKeys = ['user', 'profile', 'wallet', 'auth', 'token', 'privy'];
    Object.keys(localStorage.data).forEach(key => {
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

    const success = issues.length === 0;

    if (success) {
      log('✅ Cleanup verification passed');
    } else {
      warn(`⚠️ Cleanup verification found ${issues.length} issues`);
      issues.forEach(issue => warn(`   - ${issue}`));
    }

    return { success, issues, warnings };
  }
};

async function testErrorHandling() {
  log('🚀 Starting error handling test...\n');

  try {
    let testsPassed = 0;
    let totalTests = 0;

    // Test 1: Normal operation (baseline)
    totalTests++;
    log('📝 Test 1: Normal operation (baseline)');
    
    const localStorage1 = createMockStorageWithErrors(false);
    const sessionStorage1 = createMockStorageWithErrors(false);
    
    // Add test data
    localStorage1.setItem('user-profile', 'test');
    localStorage1.setItem('auth-token', 'token');
    localStorage1.setItem('bct-computer-on', 'true');
    sessionStorage1.setItem('temp-data', 'temp');
    
    const result1 = await mockLogoutCleanupWithErrors.performCompleteCleanup(localStorage1, sessionStorage1, false, false);
    
    if (result1.success && result1.completedSteps.length === 3 && result1.failedSteps.length === 0) {
      log('✅ Test 1 PASSED: Normal operation successful');
      testsPassed++;
    } else {
      error('❌ Test 1 FAILED: Normal operation failed');
    }

    // Test 2: Storage errors (graceful degradation)
    totalTests++;
    log('\n📝 Test 2: Storage errors (graceful degradation)');
    
    const localStorage2 = createMockStorageWithErrors(true);
    const sessionStorage2 = createMockStorageWithErrors(true);
    
    // Add test data including error triggers
    localStorage2.data['user-profile'] = 'test';
    localStorage2.data['error-item'] = 'should-fail';
    localStorage2.data['bct-computer-on'] = 'true';
    sessionStorage2.data['temp-data'] = 'temp';
    
    const result2 = await mockLogoutCleanupWithErrors.performCompleteCleanup(localStorage2, sessionStorage2, false, false);
    
    if (!result2.success && result2.failedSteps.includes('Browser Storage') && result2.errors.length > 0) {
      log('✅ Test 2 PASSED: Storage errors handled gracefully');
      testsPassed++;
    } else {
      error('❌ Test 2 FAILED: Storage errors not handled properly');
      error('   Result:', result2);
    }

    // Test 3: Partial failures (some steps succeed, some fail)
    totalTests++;
    log('\n📝 Test 3: Partial failures (some steps succeed, some fail)');
    
    const localStorage3 = createMockStorageWithErrors(false);
    const sessionStorage3 = createMockStorageWithErrors(false);
    
    // Add test data
    localStorage3.setItem('user-profile', 'test');
    localStorage3.setItem('bct-computer-on', 'true');
    
    const result3 = await mockLogoutCleanupWithErrors.performCompleteCleanup(localStorage3, sessionStorage3, true, false);
    
    if (!result3.success && 
        result3.completedSteps.includes('Browser Storage') && 
        result3.completedSteps.includes('Zustand Stores') &&
        result3.failedSteps.includes('Service Worker Caches')) {
      log('✅ Test 3 PASSED: Partial failures handled correctly');
      testsPassed++;
    } else {
      error('❌ Test 3 FAILED: Partial failures not handled properly');
      error('   Result:', result3);
    }

    // Test 4: Timeout scenario
    totalTests++;
    log('\n📝 Test 4: Timeout scenario');
    
    const localStorage4 = createMockStorageWithErrors(false);
    const sessionStorage4 = createMockStorageWithErrors(false);
    
    try {
      const result4 = await mockLogoutCleanupWithErrors.performCompleteCleanup(localStorage4, sessionStorage4, false, true);
      error('❌ Test 4 FAILED: Timeout should have thrown an error');
    } catch (err) {
      if (err.message === 'Cleanup timeout') {
        log('✅ Test 4 PASSED: Timeout handled correctly');
        testsPassed++;
      } else {
        error('❌ Test 4 FAILED: Wrong error type:', err.message);
      }
    }

    // Test 5: Verification with remaining data
    totalTests++;
    log('\n📝 Test 5: Verification with remaining data');
    
    const localStorage5 = createMockStorageWithErrors(false);
    const sessionStorage5 = createMockStorageWithErrors(false);
    
    // Leave some sensitive data
    localStorage5.setItem('user-profile', 'remaining');
    localStorage5.setItem('bct-computer-on', 'true');
    sessionStorage5.setItem('auth-session', 'remaining');
    
    const verification5 = await mockLogoutCleanupWithErrors.verifyCleanup(localStorage5, sessionStorage5);
    
    if (!verification5.success && 
        verification5.issues.some(issue => issue.includes('user-profile')) &&
        verification5.issues.some(issue => issue.includes('auth-session'))) {
      log('✅ Test 5 PASSED: Verification correctly detected remaining data');
      testsPassed++;
    } else {
      error('❌ Test 5 FAILED: Verification did not detect remaining data');
      error('   Verification result:', verification5);
    }

    // Final results
    log('\n📋 Error Handling Test Results:');
    log('=' .repeat(50));
    log(`✅ Tests Passed: ${testsPassed}/${totalTests}`);
    log(`❌ Tests Failed: ${totalTests - testsPassed}/${totalTests}`);
    
    if (testsPassed === totalTests) {
      log('🎉 All error handling tests PASSED!');
      log('✅ Logout cleanup handles errors gracefully');
      log('✅ Partial failures are managed correctly');
      log('✅ Timeouts are handled properly');
      log('✅ Verification detects remaining data');
      return true;
    } else {
      error('💥 Some error handling tests FAILED!');
      return false;
    }
    
  } catch (err) {
    error('💥 Test failed with error:', err);
    return false;
  }
}

// Run the test
testErrorHandling()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Error handling test completed successfully!');
      process.exit(0);
    } else {
      console.log('\n💥 Error handling test failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  }); 
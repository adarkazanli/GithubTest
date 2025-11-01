/**
 * Global Test Setup
 *
 * This file runs before all tests to set up the testing environment.
 * Configured in vitest.config.js setupFiles.
 */

// Polyfills for Node.js environment
if (typeof global.crypto === 'undefined') {
  global.crypto = {
    randomUUID: () => {
      // Simple UUID v4 implementation for test environment
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  };
}

// Global test configuration
console.log('Test environment initialized');

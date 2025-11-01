import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use JSDOM environment for browser API emulation
    environment: 'jsdom',

    // Global test setup file
    setupFiles: ['./tests/setup.js'],

    // Test execution timeouts
    testTimeout: 5000,  // 5 seconds max per test
    hookTimeout: 10000, // 10 seconds max for setup/teardown

    // Coverage configuration
    coverage: {
      provider: 'v8',  // Built-in, faster than istanbul
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.js'],
      exclude: [
        'src/main.js',
        'src/components/ResetButton.js',  // Has test implementation
        'src/services/ExcelImporter.js',  // Has test implementation
        'src/services/StorageService.js', // Has test implementation
        'tests/**',
        'node_modules/**'
      ],

      // Coverage thresholds (for tested modules: Task, TaskCalculator, TimeUtils)
      thresholds: {
        lines: 75,
        functions: 60,
        branches: 75,
        statements: 75
      },

      // Report directories
      reportsDirectory: './coverage'
    },

    // Test file patterns
    include: ['tests/**/*.test.js'],

    // Reporters
    reporters: ['default'],

    // Globals (optional, enables global test functions without imports)
    globals: false
  }
});

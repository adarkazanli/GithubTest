import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use happy-dom for fast DOM simulation
    environment: 'happy-dom',

    // Test file patterns
    include: ['src/**/*.{test,spec}.js', 'tests/unit/**/*.{test,spec}.js'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: [
        'src/**/*.{test,spec}.js',
        'src/main.js', // Entry point, tested via E2E
        '**/*.config.js',
        '**/node_modules/**',
      ],
      // Minimum coverage thresholds
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },

    // Global test settings
    globals: true,
    clearMocks: true,
    restoreMocks: true,

    // Test timeout
    testTimeout: 10000,
  },
});

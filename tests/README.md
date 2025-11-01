# Test Suite

This directory contains automated tests for the Task Scheduler application.

## Structure

```
tests/
├── e2e/                 # End-to-end tests (Playwright)
│   └── import.spec.js   # Import and reset functionality tests
├── fixtures/            # Test data files (Excel files, JSON, etc.)
│   └── sample-tasks.xlsx # Sample Excel file for testing imports
└── README.md            # This file
```

Unit tests are co-located with source files in `src/`:
```
src/
├── utils/
│   ├── TimeUtils.js
│   └── TimeUtils.test.js   # Unit tests for TimeUtils
├── models/
│   ├── Task.js
│   └── Task.test.js        # Unit tests for Task model
└── services/
    ├── StorageService.js
    └── StorageService.test.js  # Integration tests for StorageService
```

## Running Tests

### Unit & Integration Tests (Vitest)

```bash
# Run all unit tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with interactive UI
npm run test:ui
```

### End-to-End Tests (Playwright)

```bash
# First-time setup: Install browsers
npm run install:browsers

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

### Pre-commit Checks

```bash
# Run linting and unit tests (required before commits)
npm run precommit
```

## Writing Tests

### Unit Tests (Vitest)

Place unit test files next to the source files with `.test.js` extension:

```javascript
// src/utils/MyUtil.test.js
import { describe, it, expect } from 'vitest';
import MyUtil from './MyUtil.js';

describe('MyUtil', () => {
  it('should do something', () => {
    expect(MyUtil.doSomething()).toBe(expectedValue);
  });
});
```

### Integration Tests (Vitest)

Integration tests use browser APIs and may require mocking:

```javascript
// src/services/MyService.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import MyService from './MyService.js';

describe('MyService', () => {
  beforeEach(() => {
    // Mock browser APIs
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    };
  });

  it('should interact with localStorage', async () => {
    await MyService.save('key', 'value');
    expect(localStorage.setItem).toHaveBeenCalledWith('key', 'value');
  });
});
```

### E2E Tests (Playwright)

Create E2E tests in `tests/e2e/` with `.spec.js` extension:

```javascript
// tests/e2e/my-feature.spec.js
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should work correctly', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Click Me")');
    await expect(page.locator('.result')).toContainText('Success');
  });
});
```

## Test Coverage Requirements

Per the constitution (v1.1.0):

- **Unit Tests**: Minimum 80% code coverage for utilities and models
- **Integration Tests**: Test all storage and service interactions
- **E2E Tests**: Cover critical user workflows
- **Pre-commit**: All unit and integration tests must pass

## Debugging Tests

### Vitest

```bash
# Run tests with --inspect flag
node --inspect-brk ./node_modules/.bin/vitest

# Or use VS Code debugger with this launch.json:
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:watch"],
  "console": "integratedTerminal"
}
```

### Playwright

```bash
# Run with headed browser to see what's happening
npm run test:e2e:headed

# Use Playwright UI mode for step-by-step debugging
npm run test:e2e:ui

# Enable debug mode
PWDEBUG=1 npm run test:e2e
```

## Test Fixtures

Create test fixtures in `tests/fixtures/`:

- **Excel files**: Sample .xlsx files for testing import functionality
- **JSON data**: Mock data for testing data structures
- **Images**: Sample images if needed for testing

Example Excel file structure for `sample-tasks.xlsx`:

| Order ID | Task Name        | Estimated Time |
|----------|------------------|----------------|
| 1        | Review documents | 1:30           |
| 2        | Write report     | 2:00           |
| 3        | Send to client   | 0:30           |

## CI/CD Integration

Tests should run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: |
    npm install
    npm run install:browsers
    npm run lint
    npm test
    npm run test:e2e
```

## Best Practices

1. **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification
2. **Descriptive names**: Use clear, descriptive test names that explain what is being tested
3. **Single responsibility**: Each test should verify one specific behavior
4. **Isolation**: Tests should not depend on each other
5. **Clean up**: Use beforeEach/afterEach to reset state
6. **Avoid brittle selectors**: Use data-testid attributes or semantic selectors
7. **Test behavior, not implementation**: Focus on what the code does, not how

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testingjavascript.com/)

# Test Suite Documentation

## Overview

Comprehensive test suite for the Task Scheduler application with **141 passing tests** covering all critical functionality through unit and integration tests.

## Quick Start

```bash
# Run all tests
npm test

# Run with watch mode (development)
npm run test:watch

# Run with UI
npm run test:ui

# Generate coverage report
npm run coverage

# Run in CI mode
npm run test:ci
```

## Test Statistics

- **Total Tests**: 141
- **Test Files**: 10
- **Pass Rate**: 100%
- **Execution Time**: ~1.4 seconds
- **Code Coverage**: 87.85% (statements), 95.45% (branches), 75% (functions)

## Test Structure

### Unit Tests (87 tests)

Located in `tests/unit/`, covering individual modules in isolation:

- **TimeUtils** (13 tests) - Time parsing, formatting, arithmetic operations
- **Task Model** (15 tests) - Task creation, validation, serialization, cloning
- **TaskCalculator** (14 tests) - Time calculations, midnight crossover handling
- **StorageService** (14 tests) - Data persistence with localStorage
- **ExcelImporter** (16 tests) - Excel file parsing, validation, error handling
- **ResetButton** (15 tests) - UI component initialization, dialogs, callbacks

### Integration Tests (54 tests)

Located in `tests/integration/`, covering complete workflows:

- **Excel Import Workflow** (8 tests) - File upload → parse → validate → store
- **Database Reset Workflow** (11 tests) - Confirmation → reset → cleanup → callbacks
- **Time Update Workflow** (17 tests) - Change start time → recalculate → persist
- **Task Reordering Workflow** (18 tests) - Drag-drop → reorder → recalculate → save

## Test Helpers

### Mocks (`tests/helpers/`)

- **storage-mock.js** - localStorage mock for Node.js environment
- **file-mock.js** - File API mocks for Excel file testing
- **dom-setup.js** - DOM setup/teardown for component testing
- **data-generators.js** - Generate random test data

### Fixtures (`tests/fixtures/`)

- **task-data.js** - Predefined task objects
- **storage-states.js** - Storage state fixtures
- **generate-excel-fixtures.js** - Script to generate Excel test files
- ***.xlsx** - Generated Excel fixture files

## Running Specific Tests

```bash
# Run unit tests only
npm test tests/unit/

# Run integration tests only
npm test tests/integration/

# Run specific test file
npm test tests/unit/models/Task.test.js

# Run tests matching pattern
npm test -- --grep "should handle"
```

## Coverage Reports

After running `npm run coverage`, open `coverage/index.html` in your browser to view detailed coverage reports.

### Current Coverage

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| Task.js | 97.41% | 95.45% | 85.71% | 97.41% |
| TaskCalculator.js | 100% | 100% | 100% | 100% |
| TimeUtils.js | 75.34% | 93.33% | 57.14% | 75.34% |

## Writing New Tests

### Test File Structure

```javascript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  test('should do something specific', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe('expected');
  });
});
```

### Best Practices

1. **AAA Pattern**: Arrange, Act, Assert - structure tests clearly
2. **Descriptive Names**: Test names should describe what they verify
3. **One Assertion Focus**: Each test should verify one behavior
4. **Independent Tests**: Tests should not depend on each other
5. **Clean Setup/Teardown**: Use beforeEach/afterEach for consistent state
6. **Mock External Dependencies**: Use provided mocks for localStorage, files, DOM

## CI/CD Integration

The test suite is designed for CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:ci

- name: Check Coverage
  run: npm run coverage
```

## Troubleshooting

### Tests Failing Locally

1. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
2. Check Node.js version (requires Node 18+)
3. Ensure all dependencies installed: `npm install`

### Coverage Not Generated

1. Ensure @vitest/coverage-v8 is installed: `npm install -D @vitest/coverage-v8@1.6.1`
2. Check vitest.config.js has correct coverage settings

### Slow Test Execution

1. Use `npm run test:watch` for development (runs only changed tests)
2. Run specific test files instead of full suite
3. Check for async operations without proper timeout handling

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)
- [Project Tasks](/specs/001-test-suite/tasks.md)
- [Test Implementation Plan](/specs/001-test-suite/plan.md)

---

**Last Updated**: 2025-11-01
**Test Suite Version**: 1.0
**Vitest Version**: 1.6.1

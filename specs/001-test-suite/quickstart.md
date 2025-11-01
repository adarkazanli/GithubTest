# Quickstart Guide: Running Tests

**Feature**: Comprehensive Test Suite
**Audience**: Developers
**Last Updated**: 2025-11-01

## Overview

This guide helps developers set up and run the test suite for the Task Scheduler application. The test suite includes unit tests, integration tests, and coverage reporting.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher (comes with Node.js)
- **Git**: For cloning the repository (optional)

Check your versions:
```bash
node --version   # Should be v18.x.x or higher
npm --version    # Should be v8.x.x or higher
```

## Installation

### 1. Install Dependencies

From the project root directory:

```bash
npm install
```

This installs both production and development dependencies, including the Vitest test framework.

### 2. Verify Installation

Check that Vitest is installed:

```bash
npx vitest --version
```

You should see output like: `vitest/1.0.0`

## Running Tests

### Quick Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests once (CI mode) |
| `npm run test:watch` | Run tests in watch mode (re-runs on file changes) |
| `npm run test:ui` | Open interactive browser-based test UI |
| `npm run coverage` | Run tests and generate coverage report |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |

### Basic Usage

**Run all tests:**
```bash
npm test
```

Expected output:
```
 ✓ tests/unit/utils/TimeUtils.test.js (5 tests) 234ms
 ✓ tests/unit/models/Task.test.js (8 tests) 156ms
 ✓ tests/unit/services/TaskCalculator.test.js (12 tests) 423ms
 ✓ tests/unit/services/StorageService.test.js (10 tests) 612ms
 ✓ tests/unit/services/ExcelImporter.test.js (15 tests) 1.2s
 ✓ tests/unit/components/ResetButton.test.js (7 tests) 398ms
 ✓ tests/integration/import-workflow.test.js (4 tests) 892ms
 ✓ tests/integration/reorder-workflow.test.js (3 tests) 645ms
 ✓ tests/integration/time-update-workflow.test.js (3 tests) 523ms
 ✓ tests/integration/reset-workflow.test.js (4 tests) 712ms

Test Files  10 passed (10)
     Tests  71 passed (71)
  Start at  10:30:42
  Duration  6.2s
```

**Run tests in watch mode** (recommended during development):
```bash
npm run test:watch
```

This will re-run tests automatically when you save files. Press:
- `a` - Run all tests
- `f` - Run only failed tests
- `t` - Filter by test name pattern
- `p` - Filter by file name pattern
- `q` - Quit watch mode

## Understanding Test Results

### Test Status Indicators

- ✓ **Green checkmark**: Test passed
- ✗ **Red X**: Test failed
- ⊘ **Circle with line**: Test skipped
- ⌛ **Hourglass**: Test running

### Reading Failures

When a test fails, you'll see:

```
 FAIL  tests/unit/services/TaskCalculator.test.js
  TaskCalculator
    calculateTimes
      ✗ should calculate end time correctly (123ms)

  ● TaskCalculator › calculateTimes › should calculate end time correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "10:30"
    Received: "10:15"

      45 |   const tasks = [{ ...task, estimatedDuration: 90 }];
      46 |   TaskCalculator.calculateTimes(tasks, "09:00");
    > 47 |   expect(tasks[0].endTime).toBe("10:30");
         |                            ^
      48 | });
```

**Key information:**
1. **File and test name**: `tests/unit/services/TaskCalculator.test.js › TaskCalculator › calculateTimes`
2. **Assertion that failed**: `expect(received).toBe(expected)`
3. **Expected vs Actual**: "10:30" expected, "10:15" received
4. **Line number**: Line 47 in the test file
5. **Code snippet**: Shows the failing assertion in context

## Code Coverage

### Generate Coverage Report

```bash
npm run coverage
```

Output:
```
 % Coverage report from v8
----------------|---------|----------|---------|---------|-------------------
File            | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
----------------|---------|----------|---------|---------|-------------------
All files       |   82.45 |    78.32 |   85.71 |   82.45 |
 models         |   95.00 |    90.00 |  100.00 |   95.00 |
  Task.js       |   95.00 |    90.00 |  100.00 |   95.00 | 42-43
 services       |   78.50 |    72.00 |   81.25 |   78.50 |
  StorageService|   82.00 |    75.00 |   87.50 |   82.00 | 28-30,45
  TaskCalculator|   88.00 |    85.00 |   90.00 |   88.00 | 67
  ExcelImporter |   65.00 |    58.00 |   66.67 |   65.00 | 89-102,115-120
 utils          |   92.00 |    88.00 |   95.00 |   92.00 |
  TimeUtils.js  |   92.00 |    88.00 |   95.00 |   92.00 | 15
 components     |   70.00 |    65.00 |   75.00 |   70.00 |
  ResetButton.js|   70.00 |    65.00 |   75.00 |   70.00 | 78-85,92-95
----------------|---------|----------|---------|---------|-------------------
```

**Columns explained:**
- **% Stmts**: Percentage of statements executed
- **% Branch**: Percentage of if/else branches taken
- **% Funcs**: Percentage of functions called
- **% Lines**: Percentage of lines executed
- **Uncovered Line #s**: Line numbers not covered by tests

### View HTML Coverage Report

After running `npm run coverage`, open:

```bash
open coverage/index.html   # macOS
xdg-open coverage/index.html   # Linux
start coverage/index.html   # Windows
```

This shows:
- Color-coded file list (red = low coverage, yellow = medium, green = good)
- Line-by-line coverage highlighting
- Branch coverage details
- Function coverage

## Running Specific Tests

### Run Single Test File

```bash
npx vitest tests/unit/services/TaskCalculator.test.js
```

### Run Tests Matching Pattern

```bash
npx vitest -t "should calculate"
```

This runs only tests with "should calculate" in their name.

### Run Tests in Specific Directory

```bash
npx vitest tests/unit/
```

## Debugging Tests

### Option 1: Console Logging

Add `console.log()` statements in tests:

```javascript
test('should calculate times', () => {
  const tasks = [task1, task2];
  console.log('Before calculation:', tasks);
  TaskCalculator.calculateTimes(tasks, "09:00");
  console.log('After calculation:', tasks);
  expect(tasks[0].startTime).toBe("09:00");
});
```

Run tests to see output:
```bash
npm test
```

### Option 2: Vitest UI

```bash
npm run test:ui
```

Opens a browser interface where you can:
- See test results visually
- Inspect test code and output
- Re-run individual tests
- View coverage inline

### Option 3: Node.js Debugger

Add `debugger;` statement in test:

```javascript
test('should calculate times', () => {
  const tasks = [task1, task2];
  debugger;  // Execution pauses here
  TaskCalculator.calculateTimes(tasks, "09:00");
});
```

Run with Node inspector:
```bash
node --inspect-brk node_modules/.bin/vitest
```

Then open Chrome DevTools (`chrome://inspect`) to debug.

## Writing Your First Test

### 1. Create Test File

Create `tests/unit/services/MyService.test.js`:

```javascript
import { describe, test, expect, beforeEach } from 'vitest';
import { MyService } from '../../../src/services/MyService.js';

describe('MyService', () => {
  let service;

  beforeEach(() => {
    // Runs before each test
    service = new MyService();
  });

  test('should do something', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = service.doSomething(input);

    // Assert
    expect(result).toBe('expected output');
  });
});
```

### 2. Run Your Test

```bash
npm test tests/unit/services/MyService.test.js
```

### 3. Common Assertions

```javascript
// Equality
expect(actual).toBe(expected);           // Strict equality (===)
expect(actual).toEqual(expected);        // Deep equality for objects/arrays

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(10);
expect(value).toBeLessThan(100);
expect(value).toBeCloseTo(10.5, 0.1);    // Within 0.1 of 10.5

// Strings
expect(string).toMatch(/pattern/);
expect(string).toContain('substring');

// Arrays
expect(array).toHaveLength(5);
expect(array).toContain(item);

// Objects
expect(obj).toHaveProperty('key');
expect(obj).toMatchObject({ key: 'value' });

// Async
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow('error message');

// Functions
expect(fn).toThrow();
expect(fn).toHaveBeenCalled();
expect(fn).toHaveBeenCalledWith(arg1, arg2);
```

## Continuous Integration (CI)

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: Run Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install dependencies
      run: npm install

    - name: Run tests
      run: npm run test:ci

    - name: Generate coverage
      run: npm run coverage

    - name: Upload coverage reports
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/coverage-final.json
```

### CI-Specific npm Script

In `package.json`:

```json
{
  "scripts": {
    "test:ci": "vitest run --coverage --reporter=verbose"
  }
}
```

This ensures:
- Tests run once (not in watch mode)
- Coverage is generated
- Verbose output for CI logs

## Troubleshooting

### Tests Fail Locally but Pass in CI (or vice versa)

**Cause**: Environment differences (Node version, OS, timezone)

**Solution**:
```bash
# Check Node version matches CI
node --version

# Run tests with same environment variables as CI
TZ=UTC npm test
```

### "Cannot find module" Errors

**Cause**: Missing or incorrect import paths

**Solution**:
- Ensure imports use relative paths: `../../../src/services/MyService.js`
- Check file extensions are included: `.js` at the end
- Verify file exists at the path

### localStorage is not defined

**Cause**: Test environment not configured for browser APIs

**Solution**:
Ensure `vitest.config.js` has:
```javascript
export default {
  test: {
    environment: 'jsdom'
  }
}
```

### Tests Timeout

**Cause**: Async operations not completing or infinite loops

**Solution**:
```javascript
test('slow test', async () => {
  // Increase timeout for this test only
}, { timeout: 10000 });  // 10 seconds
```

Or in `vitest.config.js`:
```javascript
export default {
  test: {
    testTimeout: 10000  // 10 seconds for all tests
  }
}
```

### Coverage Below Threshold

**Error**: `ERROR: Coverage for lines (75%) does not meet threshold (80%)`

**Solution**:
1. Run `npm run coverage` to see which files need more coverage
2. Open `coverage/index.html` to see uncovered lines
3. Add tests for uncovered code paths
4. Re-run `npm run coverage`

## Best Practices

### 1. Test Naming

```javascript
// ✅ Good: Describes behavior
test('should calculate end time when given start time and duration', () => {});

// ❌ Bad: Vague
test('test 1', () => {});
```

### 2. Test Organization

```javascript
describe('TaskCalculator', () => {
  describe('calculateTimes', () => {
    test('should handle single task', () => {});
    test('should handle multiple tasks', () => {});
    test('should handle invalid input', () => {});
  });

  describe('validateDuration', () => {
    test('should accept positive numbers', () => {});
    test('should reject negative numbers', () => {});
  });
});
```

### 3. Use beforeEach for Setup

```javascript
describe('StorageService', () => {
  let service;
  let mockStorage;

  beforeEach(() => {
    mockStorage = new StorageMock();
    global.localStorage = mockStorage;
    service = new StorageService();
  });

  test('test 1', () => { /* service is ready */ });
  test('test 2', () => { /* service is fresh */ });
});
```

### 4. Keep Tests Fast

```javascript
// ✅ Good: Uses mocks
test('should save to storage', async () => {
  const mockStorage = { setItem: vi.fn() };
  await service.save(data);
  expect(mockStorage.setItem).toHaveBeenCalled();
});

// ❌ Bad: Real file I/O
test('should save to file', async () => {
  await fs.writeFile('./test.json', data);  // Slow!
});
```

### 5. Test One Thing at a Time

```javascript
// ✅ Good: Focused test
test('should calculate start time', () => {
  expect(task.startTime).toBe("09:00");
});

test('should calculate end time', () => {
  expect(task.endTime).toBe("10:00");
});

// ❌ Bad: Testing multiple things
test('should calculate times and save to storage and update UI', () => {
  // Too many responsibilities
});
```

## Getting Help

- **Documentation**: See [test-api.md](./contracts/test-api.md) for helper function contracts
- **Examples**: Look at existing test files in `tests/unit/` and `tests/integration/`
- **Vitest Docs**: https://vitest.dev/
- **Report Issues**: Open a GitHub issue with test output and error messages

## Next Steps

After running tests successfully:
1. Review coverage report to identify gaps
2. Add tests for new features before implementing them (TDD)
3. Set up CI to run tests automatically on every commit
4. Explore Vitest UI for interactive test development

---

**Happy Testing!** 🧪

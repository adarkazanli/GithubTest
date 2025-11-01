# Research: Test Suite Implementation

**Feature**: Comprehensive Test Suite
**Phase**: 0 - Research & Decision Making
**Date**: 2025-11-01

## Overview

This document captures research findings and technical decisions for implementing a comprehensive test suite for the Task Scheduler application. The test suite must support unit testing, integration testing, and provide coverage reporting while maintaining compatibility with the application's static, offline-capable architecture.

## Research Questions

### 1. Test Framework Selection

**Question**: Which JavaScript test framework best suits our needs for testing vanilla JavaScript modules with browser API dependencies?

**Options Evaluated**:

| Framework | Pros | Cons | Fit Score |
|-----------|------|------|-----------|
| **Vitest** | Fast (Vite-powered), built-in coverage, modern ESM support, JSDOM included, excellent DX | Relatively new, smaller community | 9/10 |
| **Jest** | Industry standard, huge ecosystem, mature, excellent mocking | Slower, ESM support improving but not perfect, heavier | 8/10 |
| **Mocha + Chai** | Flexible, lightweight, well-established | Requires multiple packages, manual configuration, no built-in coverage | 6/10 |

**Decision**: **Vitest**

**Rationale**:
- Native ESM support matches our modern JavaScript codebase
- Built-in JSDOM for DOM mocking eliminates extra dependencies
- Vite-powered speed meets our <10 second test execution goal
- Built-in coverage reporting (via c8/istanbul)
- Compatible with Jest API, easy migration path if needed
- Zero-config philosophy aligns with our simplicity goals

**Alternatives Considered**:
- Jest: Rejected due to slower execution and ESM configuration complexity
- Mocha + Chai: Rejected due to fragmented tooling requiring multiple packages (nyc for coverage, sinon for mocking, etc.)

### 2. DOM Mocking Strategy

**Question**: How do we test browser-dependent code (localStorage, File API, DOM manipulation) in a Node.js test environment?

**Decision**: **JSDOM via Vitest's built-in environment**

**Rationale**:
- Vitest includes `happy-dom` and `jsdom` environments out of the box
- JSDOM provides full browser API emulation (localStorage, File API, DOM)
- Established standard for testing browser code in Node.js
- No additional dependencies required

**Implementation Approach**:
```javascript
// vitest.config.js
export default {
  test: {
    environment: 'jsdom',  // Enables browser API mocking
    setupFiles: ['./tests/setup.js']
  }
}
```

**Alternatives Considered**:
- happy-dom: Faster but less complete API coverage; may miss edge cases
- Custom mocks: Rejected due to maintenance burden and incomplete coverage

### 3. Browser API Mocking (localStorage, File API)

**Question**: What approach should we use for mocking browser-specific APIs like localStorage and the File API?

**Decision**: **Layered mocking strategy**
1. JSDOM provides basic localStorage implementation
2. Custom mock wrapper for advanced scenarios (quota limits, errors)
3. File API mocked using Blob/ArrayBuffer polyfills

**Rationale**:
- JSDOM's localStorage is sufficient for most tests
- Custom wrapper enables testing error conditions (quota exceeded, etc.)
- File API mocking allows Excel import tests without real files
- Fixtures use real .xlsx files converted to ArrayBuffer for authenticity

**Implementation**:
```javascript
// tests/helpers/storage-mock.js
export class StorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) { return this.store[key] || null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}

// tests/helpers/file-mock.js
export function createMockFile(buffer, filename, type) {
  return new File([buffer], filename, { type });
}
```

**Alternatives Considered**:
- Real browser automation (Playwright/Puppeteer): Rejected as too slow for unit tests
- No mocking: Rejected as tests must run in CI without browser

### 4. Excel File Testing Strategy

**Question**: How do we test Excel import/export functionality without relying on external files or network requests?

**Decision**: **Static fixture files with programmatic generation**

**Rationale**:
- Store real .xlsx files in `tests/fixtures/` for integration tests
- Generate Excel files programmatically using SheetJS in tests for edge cases
- Ensures tests are self-contained and reproducible
- No network dependencies or external file access required

**Implementation**:
```javascript
// tests/fixtures/sample-tasks.xlsx - real file checked into repo
// tests/unit/services/ExcelImporter.test.js
import * as XLSX from 'xlsx';

test('imports valid Excel file', async () => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Order ID', 'Task Name', 'Duration'],
    ['001', 'Test Task', '30']
  ]);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const file = createMockFile(buffer, 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  const result = await ExcelImporter.importFile(file);
  expect(result.tasks).toHaveLength(1);
});
```

**Alternatives Considered**:
- Text-based CSV instead of Excel: Rejected as doesn't test real Excel parsing
- External test files downloaded at runtime: Rejected due to offline requirement

### 5. Code Coverage Configuration

**Question**: What code coverage thresholds and reporting approach should we use?

**Decision**: **80% coverage threshold with HTML + terminal reporting**

**Rationale**:
- 80% aligns with spec success criteria (SC-002)
- HTML reports for detailed analysis, terminal for quick feedback
- Coverage enforced on business logic (src/models, src/services, src/utils)
- UI components (src/components) and main.js have lower thresholds (60%)

**Configuration**:
```javascript
// vitest.config.js
export default {
  test: {
    coverage: {
      provider: 'v8',  // Built-in, faster than istanbul
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.js'],
      exclude: ['src/main.js', 'tests/**'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      }
    }
  }
}
```

**Alternatives Considered**:
- 100% coverage: Rejected as impractical for UI code and diminishing returns
- No thresholds: Rejected as doesn't enforce quality standards

### 6. Test Organization and Naming Conventions

**Question**: How should tests be organized and named for maintainability?

**Decision**: **Mirror source structure + descriptive naming**

**Rationale**:
- Test files located in `tests/unit/` and `tests/integration/` mirroring `src/` structure
- Naming: `<module>.test.js` for clarity
- Describe blocks group related tests by functionality
- Test names follow "should [expected behavior] when [condition]" pattern

**Example Structure**:
```
tests/
├── unit/
│   └── services/
│       └── TaskCalculator.test.js
│           describe('TaskCalculator')
│             describe('calculateTimes')
│               test('should calculate start and end times for single task')
│               test('should calculate cumulative times for multiple tasks')
│               test('should handle invalid start time format')
```

**Alternatives Considered**:
- Co-located tests (src/services/TaskCalculator.test.js): Rejected to keep test code separate
- Flat structure (all tests in tests/): Rejected as harder to navigate with 20+ test files

### 7. Async Testing Approach

**Question**: How do we test asynchronous operations (storage, file reading) reliably?

**Decision**: **Async/await with Vitest's native async support**

**Rationale**:
- All async operations return Promises (modern JavaScript)
- Vitest natively supports async test functions
- Cleaner syntax than callbacks or done() patterns
- Timeout configuration prevents hanging tests

**Example**:
```javascript
test('should save tasks to storage', async () => {
  const service = new StorageService();
  await service.init();
  await service.saveTasks([task1, task2]);

  const retrieved = await service.getTasks();
  expect(retrieved).toHaveLength(2);
});
```

**Configuration**:
```javascript
// vitest.config.js
export default {
  test: {
    testTimeout: 5000,  // 5 second max per test
    hookTimeout: 10000  // 10 second max for setup/teardown
  }
}
```

**Alternatives Considered**:
- Callback-based tests: Rejected as outdated and error-prone
- Synchronous mocks only: Rejected as doesn't match real async behavior

### 8. CI/CD Integration

**Question**: How do we ensure tests run automatically in continuous integration?

**Decision**: **npm scripts with exit codes + GitHub Actions workflow**

**Rationale**:
- npm scripts provide standard interface (`npm test`, `npm run coverage`)
- Exit codes (0 = pass, non-zero = fail) integrate with any CI system
- GitHub Actions workflow template provided for easy setup
- Works offline (no external test services like Travis CI)

**npm Scripts**:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "coverage": "vitest run --coverage",
    "test:ci": "vitest run --coverage --reporter=verbose"
  }
}
```

**GitHub Actions Workflow** (optional, documented in quickstart):
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:ci
```

**Alternatives Considered**:
- External CI services: Rejected to maintain offline-first philosophy
- Manual test execution only: Rejected as doesn't prevent regressions

## Dependencies Summary

### Production Dependencies
**None** - Test framework is development-only, no runtime impact

### Development Dependencies
```json
{
  "devDependencies": {
    "vitest": "^1.0.0",           // Test runner + assertions + coverage
    "jsdom": "^23.0.0",            // DOM mocking (Vitest peer dependency)
    "@vitest/ui": "^1.0.0"         // Optional: browser-based test UI
  }
}
```

**Total new dependencies**: 3 packages (~10MB installed)
**Bundle size impact**: 0 bytes (dev dependencies only)

## Performance Expectations

Based on research and benchmarks from similar projects:

| Metric | Target | Expected |
|--------|--------|----------|
| Unit test execution | <5s | ~2-3s (20-30 tests) |
| Integration test execution | <5s | ~3-4s (4 workflows) |
| Total test suite | <10s | ~6-8s |
| Coverage report generation | <3s | ~1-2s |
| First test run (cold start) | <15s | ~10-12s |

## Testing Best Practices

Based on research, the following practices will be followed:

1. **AAA Pattern**: Arrange-Act-Assert structure for all tests
2. **Isolation**: Each test resets mocks and state (beforeEach/afterEach)
3. **Single Assertion**: Each test validates one behavior (exceptions for related assertions)
4. **Descriptive Names**: Test names describe expected behavior, not implementation
5. **Fast Tests**: No artificial delays, use mocks for slow operations
6. **Deterministic**: Tests produce same results every run (no random data)
7. **Independent**: Tests can run in any order without failures

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Tests too slow (>10s) | Use Vitest's parallel execution, minimize DOM operations |
| Flaky tests (intermittent failures) | Enforce deterministic test data, avoid timing dependencies |
| Low coverage | Coverage thresholds block PRs, require tests for new code |
| Maintenance burden | Mirror source structure, use shared fixtures/helpers |
| Browser API incompatibilities | JSDOM covers 95% of cases, document known limitations |

## Next Steps (Phase 1)

1. Generate `data-model.md` documenting test data structures and fixtures
2. Create `contracts/test-api.md` specifying test helper function interfaces
3. Generate `quickstart.md` with developer setup and usage guide
4. Update agent context (CLAUDE.md) with test framework information
5. Re-evaluate Constitution Check for any design conflicts

## References

- [Vitest Documentation](https://vitest.dev/)
- [JSDOM Documentation](https://github.com/jsdom/jsdom)
- [SheetJS Testing Guide](https://docs.sheetjs.com/docs/demos/testing/)
- [JavaScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

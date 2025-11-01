# Test API Contracts

**Feature**: Comprehensive Test Suite
**Phase**: 1 - Design
**Date**: 2025-11-01

## Overview

This document defines the interfaces and contracts for test helper utilities, mock objects, and fixture generators used throughout the test suite. These contracts ensure consistency and maintainability across all test files.

## Test Helper Contracts

### 1. Storage Mock

**Module**: `tests/helpers/storage-mock.js`

**Purpose**: Provides a localStorage-compatible mock for testing storage-dependent code in Node.js environment.

#### Interface

```javascript
class StorageMock {
  /**
   * Creates a new storage mock instance with empty store
   */
  constructor();

  /**
   * Retrieves a value from storage
   * @param {string} key - Storage key
   * @returns {string | null} - Stored value or null if not found
   */
  getItem(key: string): string | null;

  /**
   * Stores a value in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store (will be converted to string)
   * @returns {void}
   */
  setItem(key: string, value: string): void;

  /**
   * Removes a value from storage
   * @param {string} key - Storage key to remove
   * @returns {void}
   */
  removeItem(key: string): void;

  /**
   * Clears all values from storage
   * @returns {void}
   */
  clear(): void;

  /**
   * Gets the number of items in storage
   * @returns {number} - Count of stored items
   */
  get length(): number;

  /**
   * Gets the key at the specified index
   * @param {number} index - Index position
   * @returns {string | null} - Key at index or null if out of bounds
   */
  key(index: number): string | null;
}
```

#### Contract Requirements

- **Synchronous**: All methods execute synchronously (matching browser localStorage API)
- **String Conversion**: Values stored via `setItem` must be converted to strings
- **Null Returns**: `getItem` must return `null` for non-existent keys (not `undefined`)
- **Isolation**: Each instance maintains independent storage (no shared state)
- **Reset**: `clear()` must remove all items, leaving empty store

#### Usage Example

```javascript
import { StorageMock } from '../helpers/storage-mock.js';

describe('StorageService', () => {
  let storage;

  beforeEach(() => {
    global.localStorage = new StorageMock();
    storage = new StorageService();
  });

  test('should save and retrieve tasks', async () => {
    await storage.saveTasks([task1, task2]);
    const tasks = await storage.getTasks();
    expect(tasks).toHaveLength(2);
  });
});
```

---

### 2. File Mock

**Module**: `tests/helpers/file-mock.js`

**Purpose**: Creates File API-compatible mock objects for testing file upload/import functionality.

#### Interface

```javascript
/**
 * Creates a mock File object from an ArrayBuffer
 * @param {ArrayBuffer} buffer - File content as ArrayBuffer
 * @param {string} fileName - File name (e.g., "test.xlsx")
 * @param {string} mimeType - MIME type (e.g., "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
 * @returns {File} - Mock File object with browser File API interface
 */
function createMockFile(
  buffer: ArrayBuffer,
  fileName: string,
  mimeType: string
): File;

/**
 * Creates a mock File object from a string
 * @param {string} content - File content as string
 * @param {string} fileName - File name (e.g., "test.txt")
 * @param {string} mimeType - MIME type (e.g., "text/plain")
 * @returns {File} - Mock File object
 */
function createMockFileFromString(
  content: string,
  fileName: string,
  mimeType: string
): File;

/**
 * Creates a mock Excel file from a 2D array
 * @param {Array<Array<string>>} data - Excel data as 2D array (rows x columns)
 * @param {string} fileName - File name (e.g., "tasks.xlsx")
 * @returns {Promise<File>} - Resolves to mock Excel File object
 */
async function createMockExcelFile(
  data: Array<Array<string>>,
  fileName: string
): Promise<File>;
```

#### Contract Requirements

- **File API Compatibility**: Returned objects must implement File interface (name, size, type, lastModified, arrayBuffer())
- **ArrayBuffer Method**: `arrayBuffer()` must return a Promise resolving to the original buffer
- **Size Accuracy**: `size` property must match `buffer.byteLength`
- **Timestamp**: `lastModified` must be a valid timestamp (Date.now() acceptable)

#### Usage Example

```javascript
import { createMockExcelFile } from '../helpers/file-mock.js';

test('should import Excel file', async () => {
  const excelData = [
    ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
    ['001', 'Test Task', '30']
  ];

  const file = await createMockExcelFile(excelData, 'test.xlsx');
  const result = await ExcelImporter.importFile(file);

  expect(result.tasks).toHaveLength(1);
  expect(result.tasks[0].taskName).toBe('Test Task');
});
```

---

### 3. DOM Setup

**Module**: `tests/helpers/dom-setup.js`

**Purpose**: Manages DOM environment setup and teardown for integration tests.

#### Interface

```javascript
/**
 * Sets up basic DOM structure matching index.html
 * Creates necessary elements: import-panel, task-list, reset-button, etc.
 * @returns {void}
 */
function setupDOM(): void;

/**
 * Removes all created DOM elements and resets document.body
 * @returns {void}
 */
function cleanupDOM(): void;

/**
 * Creates a mock DOM element with attributes and content
 * @param {string} tagName - HTML tag name (e.g., "div", "button")
 * @param {object} attributes - Key-value pairs of attributes (e.g., { id: "test", class: "btn" })
 * @param {string} innerHTML - Inner HTML content
 * @returns {HTMLElement} - Created element
 */
function createMockElement(
  tagName: string,
  attributes: object,
  innerHTML: string
): HTMLElement;

/**
 * Simulates a click event on an element
 * @param {HTMLElement} element - Target element
 * @returns {void}
 */
function simulateClick(element: HTMLElement): void;

/**
 * Simulates a file input change event
 * @param {HTMLInputElement} input - File input element
 * @param {File} file - Mock file to attach
 * @returns {void}
 */
function simulateFileInput(input: HTMLInputElement, file: File): void;
```

#### Contract Requirements

- **Idempotent Setup**: `setupDOM()` can be called multiple times safely (clears previous setup)
- **Complete Teardown**: `cleanupDOM()` must remove all elements and event listeners
- **Event Compatibility**: Simulated events must trigger registered event listeners
- **JSDOM Compatible**: All functions must work within JSDOM environment

#### Usage Example

```javascript
import { setupDOM, cleanupDOM, simulateClick } from '../helpers/dom-setup.js';

describe('Integration: Reset Button', () => {
  beforeEach(() => {
    setupDOM();
  });

  afterEach(() => {
    cleanupDOM();
  });

  test('should show confirmation dialog on click', () => {
    const resetBtn = document.getElementById('reset-button');
    simulateClick(resetBtn);

    const dialog = document.getElementById('reset-dialog');
    expect(dialog.hasAttribute('hidden')).toBe(false);
  });
});
```

---

### 4. Data Generators

**Module**: `tests/helpers/data-generators.js`

**Purpose**: Generates random test data for property-based testing and bulk scenarios.

#### Interface

```javascript
/**
 * Generates a single task with random or overridden values
 * @param {object} overrides - Fields to override in generated task
 * @returns {object} - Task object matching Task data model
 */
function generateTask(overrides: object = {}): object;

/**
 * Generates multiple tasks
 * @param {number} count - Number of tasks to generate
 * @param {object} overrides - Fields to override in all generated tasks
 * @returns {Array<object>} - Array of task objects
 */
function generateTasks(count: number, overrides: object = {}): Array<object>;

/**
 * Generates Excel data as 2D array
 * @param {number} rowCount - Number of data rows (excluding header)
 * @returns {Array<Array<string>>} - Excel data with header row
 */
function generateExcelData(rowCount: number): Array<Array<string>>;

/**
 * Generates a mock storage state
 * @param {object} options - Configuration options
 * @param {number} options.taskCount - Number of tasks to include
 * @param {string} options.startTime - Estimated start time
 * @param {boolean} options.includeImportHistory - Whether to include import history
 * @returns {object} - Storage state object
 */
function generateStorageState(options: {
  taskCount?: number,
  startTime?: string,
  includeImportHistory?: boolean
}): object;
```

#### Contract Requirements

- **Deterministic IDs**: Use `crypto.randomUUID()` for IDs to ensure uniqueness
- **Valid Defaults**: Generated data must pass all validation rules by default
- **Override Support**: All generators must respect provided override values
- **Consistency**: Generated data must be internally consistent (e.g., start/end times calculated from duration)

#### Usage Example

```javascript
import { generateTasks, generateExcelData } from '../helpers/data-generators.js';

test('should handle bulk task import', async () => {
  const excelData = generateExcelData(100);
  const file = await createMockExcelFile(excelData, 'bulk.xlsx');

  const result = await ExcelImporter.importFile(file);
  expect(result.tasks).toHaveLength(100);
});
```

---

## Fixture Loader Contracts

### 5. Fixture Loader

**Module**: `tests/helpers/fixture-loader.js`

**Purpose**: Loads and manages test fixture files.

#### Interface

```javascript
/**
 * Loads an Excel fixture file as a File object
 * @param {string} fixtureName - Name of fixture file (e.g., "sample-tasks.xlsx")
 * @returns {Promise<File>} - Resolves to File object
 */
async function loadExcelFixture(fixtureName: string): Promise<File>;

/**
 * Loads a JSON fixture file
 * @param {string} fixtureName - Name of fixture file (e.g., "task-data.json")
 * @returns {Promise<object>} - Resolves to parsed JSON object
 */
async function loadJSONFixture(fixtureName: string): Promise<object>;

/**
 * Lists all available fixtures in a directory
 * @param {string} fixtureType - Type of fixture ("excel", "json", "all")
 * @returns {Promise<Array<string>>} - Resolves to array of fixture file names
 */
async function listFixtures(fixtureType: string): Promise<Array<string>>;
```

#### Contract Requirements

- **Path Resolution**: Automatically resolves paths relative to `tests/fixtures/`
- **Error Handling**: Throws descriptive errors for missing fixtures
- **Caching**: May cache loaded fixtures for performance (but must be clearable)
- **Type Safety**: Validates file extensions match requested type

---

## Assertion Helpers

### 6. Custom Assertions

**Module**: `tests/helpers/assertions.js`

**Purpose**: Provides domain-specific assertion helpers for cleaner test code.

#### Interface

```javascript
/**
 * Asserts that a task object is valid
 * @param {object} task - Task object to validate
 * @returns {void}
 * @throws {AssertionError} - If task is invalid
 */
function assertValidTask(task: object): void;

/**
 * Asserts that two task arrays are equal (ignoring order)
 * @param {Array<object>} actual - Actual task array
 * @param {Array<object>} expected - Expected task array
 * @returns {void}
 */
function assertTaskArraysEqual(actual: Array<object>, expected: Array<object>): void;

/**
 * Asserts that a time string is valid (HH:MM format)
 * @param {string} timeString - Time string to validate
 * @returns {void}
 */
function assertValidTimeFormat(timeString: string): void;

/**
 * Asserts that storage state matches expected structure
 * @param {object} state - Storage state object
 * @returns {void}
 */
function assertValidStorageState(state: object): void;
```

#### Contract Requirements

- **Descriptive Errors**: Assertion failures must include specific details about mismatch
- **Composable**: Assertions can call other assertions
- **Framework Agnostic**: Use standard Error throwing (framework will catch)

---

## Test Lifecycle Hooks

### Standard Hook Pattern

All test files should follow this lifecycle pattern:

```javascript
describe('Module Name', () => {
  // Runs once before all tests in this describe block
  beforeAll(async () => {
    // Setup expensive resources (e.g., load large fixtures)
  });

  // Runs before each test
  beforeEach(() => {
    // Reset mocks and state
    global.localStorage = new StorageMock();
    setupDOM();
  });

  // Runs after each test
  afterEach(() => {
    // Cleanup
    cleanupDOM();
    vi.clearAllMocks();
  });

  // Runs once after all tests
  afterAll(() => {
    // Teardown expensive resources
  });

  test('should...', () => {
    // Test implementation
  });
});
```

---

## Mocking Contracts

### Module Mocking

When mocking entire modules, use Vitest's `vi.mock()`:

```javascript
import { vi } from 'vitest';

// Mock external module
vi.mock('../src/services/ExcelImporter.js', () => ({
  importFile: vi.fn().mockResolvedValue({ tasks: [], summary: {} })
}));
```

### Spy Pattern

For spying on existing implementations:

```javascript
import { vi } from 'vitest';
import { StorageService } from '../src/services/StorageService.js';

test('should call saveTasks', async () => {
  const saveSpy = vi.spyOn(StorageService.prototype, 'saveTasks');

  const service = new StorageService();
  await service.saveTasks([task1]);

  expect(saveSpy).toHaveBeenCalledWith([task1]);
  saveSpy.mockRestore();
});
```

---

## Error Handling Contracts

### Test Error Handling

All helper functions must:
1. Throw descriptive errors for invalid inputs
2. Include context in error messages (e.g., "Expected file name to end with .xlsx, got: test.txt")
3. Use standard Error types (or custom TestError extending Error)

### Expected Error Testing Pattern

```javascript
test('should reject invalid duration', async () => {
  await expect(async () => {
    await ExcelImporter.importFile(invalidFile);
  }).rejects.toThrow('Duration must be a positive number');
});
```

---

## Performance Contracts

### Timeout Requirements

- **Unit Tests**: Max 1 second per test
- **Integration Tests**: Max 3 seconds per test
- **Fixture Loading**: Max 500ms per fixture file
- **Mock Creation**: Max 100ms per mock object

Tests exceeding these limits must be optimized or documented with justification.

---

## Versioning and Compatibility

All test helpers must:
- Be compatible with Vitest 1.x API
- Work in JSDOM environment
- Support ES modules (ESM) syntax
- Be documented with JSDoc comments

---

## Next Steps

These contracts will be implemented during the `/speckit.tasks` phase. Each contract maps to specific task items for implementation.

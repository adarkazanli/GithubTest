# Data Model: Test Suite

**Feature**: Comprehensive Test Suite
**Phase**: 1 - Design
**Date**: 2025-11-01

## Overview

This document defines the data structures, test fixtures, and mock objects used throughout the test suite. These structures enable consistent, reproducible testing of the Task Scheduler application.

## Test Data Entities

### 1. Test Task Object

Represents a task instance used in unit and integration tests.

**Structure**:
```javascript
{
  id: string,                    // Unique identifier (UUID format)
  orderId: string,               // Display order ID (e.g., "001", "002")
  taskName: string,              // Human-readable task name
  estimatedDuration: number,     // Duration in minutes
  startTime: string | null,      // Start time in "HH:MM" format or null
  endTime: string | null,        // End time in "HH:MM" format or null
  notes: string                  // User notes (may be empty string)
}
```

**Validation Rules**:
- `id`: Must be non-empty string
- `orderId`: Must be non-empty string
- `taskName`: Must be non-empty string
- `estimatedDuration`: Must be positive number
- `startTime`/`endTime`: Must match "HH:MM" format or be null
- `notes`: Any string (including empty)

**Sample Instances**:
```javascript
// Minimal valid task
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  orderId: "001",
  taskName: "Test Task",
  estimatedDuration: 30,
  startTime: null,
  endTime: null,
  notes: ""
}

// Fully populated task
{
  id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  orderId: "042",
  taskName: "Complete Feature X",
  estimatedDuration: 120,
  startTime: "09:00",
  endTime: "11:00",
  notes: "Review with team before deployment"
}
```

### 2. Mock Storage State

Represents the state of localStorage at various points in the application lifecycle.

**Structure**:
```javascript
{
  tasks: Task[],                 // Array of task objects
  estimatedStartTime: string,    // Default start time ("HH:MM" format)
  importHistory: ImportHistory | null,  // Last import metadata
  version: string                // Storage schema version (e.g., "1.0")
}
```

**Sample States**:
```javascript
// Empty state (fresh install)
{
  tasks: [],
  estimatedStartTime: "09:00",
  importHistory: null,
  version: "1.0"
}

// State with tasks
{
  tasks: [
    { id: "abc123", orderId: "001", taskName: "Task 1", estimatedDuration: 30, startTime: "09:00", endTime: "09:30", notes: "" },
    { id: "def456", orderId: "002", taskName: "Task 2", estimatedDuration: 45, startTime: "09:30", endTime: "10:15", notes: "Important" }
  ],
  estimatedStartTime: "09:00",
  importHistory: {
    validRows: 2,
    invalidRows: 0,
    fileName: "tasks.xlsx",
    importDate: "2025-11-01T10:30:00.000Z"
  },
  version: "1.0"
}
```

### 3. Import History

Metadata about the most recent Excel import operation.

**Structure**:
```javascript
{
  validRows: number,      // Count of successfully imported rows
  invalidRows: number,    // Count of skipped/invalid rows
  fileName: string,       // Original Excel file name
  importDate: string      // ISO 8601 timestamp
}
```

**Validation Rules**:
- `validRows`: Non-negative integer
- `invalidRows`: Non-negative integer
- `fileName`: Non-empty string ending in `.xlsx`
- `importDate`: Valid ISO 8601 date string

### 4. Excel Test Data

Represents Excel file content for import testing.

**Structure** (as 2D array before conversion to .xlsx):
```javascript
[
  ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],  // Header row
  ['001', 'Task One', '30'],                                   // Data row
  ['002', 'Task Two', '45'],                                   // Data row
  // ... more rows
]
```

**Validation Rules**:
- First row must be header with expected column names
- Subsequent rows must have 3 columns
- Order ID: Non-empty string
- Task Name: Non-empty string
- Duration: Positive number (as string in Excel)

**Sample Data Sets**:

**Valid Import**:
```javascript
[
  ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
  ['001', 'Write Tests', '60'],
  ['002', 'Review Code', '30'],
  ['003', 'Deploy', '15']
]
```

**Invalid Import** (mixed valid/invalid):
```javascript
[
  ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
  ['001', 'Valid Task', '30'],
  ['', 'Missing Order ID', '45'],           // Invalid: empty Order ID
  ['003', '', '20'],                         // Invalid: empty Task Name
  ['004', 'Negative Duration', '-10'],      // Invalid: negative duration
  ['005', 'Valid Task 2', '60']
]
```

### 5. Mock File Object

Simulates browser File API for testing file imports.

**Structure**:
```javascript
{
  name: string,           // File name
  size: number,           // File size in bytes
  type: string,           // MIME type
  lastModified: number,   // Timestamp
  arrayBuffer: () => Promise<ArrayBuffer>  // File contents
}
```

**Factory Function**:
```javascript
function createMockFile(arrayBuffer, fileName, mimeType) {
  return {
    name: fileName,
    size: arrayBuffer.byteLength,
    type: mimeType,
    lastModified: Date.now(),
    arrayBuffer: () => Promise.resolve(arrayBuffer)
  };
}
```

### 6. Test Report Structure

Output structure for test execution results (used in assertions).

**Structure**:
```javascript
{
  totalTests: number,        // Total number of tests
  passed: number,            // Number of passed tests
  failed: number,            // Number of failed tests
  skipped: number,           // Number of skipped tests
  duration: number,          // Total execution time in milliseconds
  coverage: {
    lines: number,           // Line coverage percentage
    functions: number,       // Function coverage percentage
    branches: number,        // Branch coverage percentage
    statements: number       // Statement coverage percentage
  }
}
```

## Test Fixtures

### Fixture Files Location
All fixture files are stored in `tests/fixtures/` directory.

### 1. Sample Excel Files

**File**: `tests/fixtures/sample-tasks.xlsx`
- **Content**: 10 valid task rows
- **Purpose**: Standard import workflow testing
- **Format**: Valid Excel 2007+ (.xlsx)

**File**: `tests/fixtures/large-import.xlsx`
- **Content**: 100 valid task rows
- **Purpose**: Performance testing, bulk import validation
- **Format**: Valid Excel 2007+ (.xlsx)

**File**: `tests/fixtures/invalid-tasks.xlsx`
- **Content**: 10 rows (5 valid, 5 invalid)
- **Purpose**: Error handling and validation testing
- **Format**: Valid Excel file with intentionally invalid data

**File**: `tests/fixtures/empty-sheet.xlsx`
- **Content**: Header row only, no data rows
- **Purpose**: Edge case testing
- **Format**: Valid Excel file

### 2. Task Data Fixtures

**File**: `tests/fixtures/task-data.js`

```javascript
export const sampleTasks = [
  {
    id: "task-001",
    orderId: "001",
    taskName: "Initialize Project",
    estimatedDuration: 30,
    startTime: "09:00",
    endTime: "09:30",
    notes: ""
  },
  {
    id: "task-002",
    orderId: "002",
    taskName: "Setup Environment",
    estimatedDuration: 45,
    startTime: "09:30",
    endTime: "10:15",
    notes: "Requires admin access"
  },
  {
    id: "task-003",
    orderId: "003",
    taskName: "Write Documentation",
    estimatedDuration: 60,
    startTime: "10:15",
    endTime: "11:15",
    notes: ""
  }
];

export const emptyTaskList = [];

export const singleTask = [sampleTasks[0]];

export const tasksWithoutTimes = sampleTasks.map(task => ({
  ...task,
  startTime: null,
  endTime: null
}));
```

### 3. Storage State Fixtures

**File**: `tests/fixtures/storage-states.js`

```javascript
export const emptyStorage = {
  tasks: [],
  estimatedStartTime: "09:00",
  importHistory: null,
  version: "1.0"
};

export const populatedStorage = {
  tasks: [/* sample tasks */],
  estimatedStartTime: "09:00",
  importHistory: {
    validRows: 3,
    invalidRows: 0,
    fileName: "sample-tasks.xlsx",
    importDate: "2025-11-01T10:00:00.000Z"
  },
  version: "1.0"
};

export const storageWithCustomStartTime = {
  tasks: [/* sample tasks */],
  estimatedStartTime: "14:30",
  importHistory: null,
  version: "1.0"
};
```

## Mock Objects

### 1. localStorage Mock

**File**: `tests/helpers/storage-mock.js`

**Interface**:
```javascript
class StorageMock {
  constructor();
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  get length(): number;
  key(index: number): string | null;
}
```

**Usage**:
```javascript
import { StorageMock } from '../helpers/storage-mock.js';

beforeEach(() => {
  global.localStorage = new StorageMock();
});
```

### 2. File API Mock

**File**: `tests/helpers/file-mock.js`

**Interface**:
```javascript
function createMockFile(
  content: ArrayBuffer,
  fileName: string,
  mimeType: string
): File;

function createMockFileFromString(
  content: string,
  fileName: string,
  mimeType: string
): File;
```

**Usage**:
```javascript
import { createMockFile } from '../helpers/file-mock.js';
import * as XLSX from 'xlsx';

const workbook = XLSX.utils.book_new();
// ... populate workbook
const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
const file = createMockFile(buffer, 'test.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
```

### 3. DOM Setup Mock

**File**: `tests/helpers/dom-setup.js`

**Interface**:
```javascript
function setupDOM(): void;                // Sets up basic DOM structure
function cleanupDOM(): void;              // Removes all DOM elements
function createMockElement(              // Creates mock DOM element
  tagName: string,
  attributes: object,
  innerHTML: string
): HTMLElement;
```

**Usage**:
```javascript
import { setupDOM, cleanupDOM } from '../helpers/dom-setup.js';

beforeEach(() => {
  setupDOM();
});

afterEach(() => {
  cleanupDOM();
});
```

## Data Relationships

```text
StorageState
  └── tasks: Task[]
  └── importHistory: ImportHistory | null

ImportHistory
  └── fileName: string (references Excel file)

ExcelFile
  └── rows: Array<[orderId, taskName, duration]>
  └── converts to → Task[]

Task
  └── used by → StorageService
  └── used by → TaskCalculator
  └── rendered by → UI components
```

## Validation Rules Summary

| Entity | Required Fields | Optional Fields | Constraints |
|--------|----------------|-----------------|-------------|
| Task | id, orderId, taskName, estimatedDuration, notes | startTime, endTime | duration > 0, times in HH:MM format |
| StorageState | tasks, estimatedStartTime, version | importHistory | tasks is array, startTime is HH:MM |
| ImportHistory | validRows, invalidRows, fileName, importDate | - | counts ≥ 0, fileName ends .xlsx |
| ExcelRow | Order ID, Task Name, Duration | - | All non-empty, duration > 0 |

## Test Data Generation Utilities

**File**: `tests/helpers/data-generators.js`

```javascript
// Generate random task
export function generateTask(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    orderId: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    taskName: `Task ${Math.random().toString(36).substring(7)}`,
    estimatedDuration: Math.floor(Math.random() * 120) + 15,
    startTime: null,
    endTime: null,
    notes: "",
    ...overrides
  };
}

// Generate array of tasks
export function generateTasks(count, overrides = {}) {
  return Array.from({ length: count }, (_, i) => generateTask({
    orderId: (i + 1).toString().padStart(3, '0'),
    ...overrides
  }));
}

// Generate Excel data array
export function generateExcelData(taskCount) {
  const header = ['Order ID', 'Task Name', 'Estimated Duration (minutes)'];
  const rows = Array.from({ length: taskCount }, (_, i) => [
    (i + 1).toString().padStart(3, '0'),
    `Task ${i + 1}`,
    String(Math.floor(Math.random() * 120) + 15)
  ]);
  return [header, ...rows];
}
```

## State Transitions

Tests must validate state transitions throughout the application lifecycle:

```text
1. Initial State (Empty)
   └── Import Excel → State with Tasks
       └── Reorder Tasks → State with Reordered Tasks
           └── Update Start Time → State with Recalculated Times
               └── Reset → Initial State (Empty)

2. Persistence Flow
   └── Change State → Save to Storage → Retrieve from Storage → Verify State Match
```

## Coverage Requirements

Each data entity must have:
- Valid instance creation tests
- Validation rule enforcement tests
- Serialization/deserialization tests (if applicable)
- Edge case tests (empty values, boundary values, invalid formats)

## Next Steps

This data model serves as the foundation for:
1. Writing unit test assertions
2. Creating integration test scenarios
3. Generating test fixtures programmatically
4. Validating test coverage completeness

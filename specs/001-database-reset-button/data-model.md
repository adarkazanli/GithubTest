# Data Model: Database Reset Button

**Feature**: Database Reset Button
**Date**: 2025-10-26
**Phase**: 1 - Design & Contracts

## Overview

This document defines the data structures and state management for the database reset button feature. The feature primarily interacts with existing data stores (IndexedDB and localStorage) and introduces minimal new state for UI management.

---

## State Models

### ResetButtonState

Tracks the UI state of the reset button component.

```javascript
{
  // Indicates if a reset operation is currently in progress
  isResetting: boolean,

  // Indicates if the confirmation dialog is currently visible
  confirmationVisible: boolean,

  // Indicates if the button should be enabled
  // (false during reset or when import is in progress)
  enabled: boolean,

  // Stores error messages from failed reset operations
  errors: Array<string>,

  // Indicates if a success message is currently displayed
  successVisible: boolean
}
```

**Initial State**:
```javascript
{
  isResetting: false,
  confirmationVisible: false,
  enabled: true,
  errors: [],
  successVisible: false
}
```

**State Transitions**:

```
[Enabled] → (Click) → [ConfirmationVisible]
[ConfirmationVisible] → (Cancel) → [Enabled]
[ConfirmationVisible] → (Confirm) → [Resetting + Disabled]
[Resetting] → (Success) → [SuccessVisible + Enabled]
[Resetting] → (Error) → [ErrorsVisible + Enabled]
[SuccessVisible] → (5s timeout) → [Enabled]
[ErrorsVisible] → (5s timeout or dismiss) → [Enabled]
```

---

## Storage Models

### StorageAreas

Defines the browser storage areas that will be cleared during reset.

```javascript
{
  indexedDB: {
    // Database name
    database: "taskSchedulerDB",

    // Object stores to clear
    objectStores: ["tasks"],

    // Database version (reference only, not modified)
    version: 1
  },

  localStorage: {
    // Keys to remove from localStorage
    keys: [
      "taskOrder",           // Array of task IDs defining display order
      "estimatedStartTime",  // Schedule start time (HH:MM format)
      "importHistory"        // Last import metadata
    ]
  }
}
```

**Storage Structure Before Reset**:

```javascript
// IndexedDB: taskSchedulerDB.tasks
[
  {
    id: "1698765432-abc123",
    orderId: 1,
    taskName: "Task 1",
    estimatedDuration: "1:30",
    notes: "Some notes",
    calculatedStartTime: "2025-10-26T09:00:00.000Z",
    calculatedEndTime: "2025-10-26T10:30:00.000Z"
  },
  // ... more tasks
]

// localStorage
{
  "taskOrder": ["1698765432-abc123", "1698765432-def456", ...],
  "estimatedStartTime": "09:00",
  "importHistory": {
    "fileName": "tasks.xlsx",
    "timestamp": "2025-10-26T14:30:00.000Z",
    "validCount": 10,
    "invalidCount": 0
  }
}
```

**Storage Structure After Reset**:

```javascript
// IndexedDB: taskSchedulerDB.tasks
// (empty object store, schema preserved)
[]

// localStorage
{
  // All reset-related keys removed
  // Database structure remains intact
}
```

---

## Reset Operation Result

The result object returned by `StorageService.resetAll()`.

```javascript
{
  // Overall success status
  // true: All storage areas cleared successfully
  // false: One or more storage areas failed to clear
  success: boolean,

  // Array of error messages (empty if success = true)
  // Each error describes which storage area failed and why
  errors: Array<string>,

  // Detailed status of each storage area
  cleared: {
    // true if IndexedDB tasks were successfully cleared
    indexedDB: boolean,

    // true if localStorage keys were successfully removed
    localStorage: boolean
  }
}
```

**Success Example**:
```javascript
{
  success: true,
  errors: [],
  cleared: {
    indexedDB: true,
    localStorage: true
  }
}
```

**Partial Failure Example**:
```javascript
{
  success: false,
  errors: [
    "IndexedDB: Transaction failed - database was closed"
  ],
  cleared: {
    indexedDB: false,
    localStorage: true
  }
}
```

**Complete Failure Example**:
```javascript
{
  success: false,
  errors: [
    "IndexedDB: Database not initialized",
    "localStorage: QuotaExceededError"
  ],
  cleared: {
    indexedDB: false,
    localStorage: false
  }
}
```

---

## Event Flow

### User Interaction Flow

```
1. User clicks reset button
   ↓
2. Button disabled immediately (isResetting = true, enabled = false)
   ↓
3. Confirmation dialog shown (confirmationVisible = true)
   ↓
4a. User clicks Cancel
    → Dialog hidden (confirmationVisible = false)
    → Button re-enabled (isResetting = false, enabled = true)
    → END

4b. User clicks Confirm
    ↓
5. Dialog hidden (confirmationVisible = false)
   ↓
6. Reset operation starts
   - StorageService.resetAll() called
   - IndexedDB tasks cleared (or error collected)
   - localStorage keys removed (or error collected)
   ↓
7a. Operation succeeds (success = true)
    → Success message shown (successVisible = true)
    → UI updates to empty state
    → Button re-enabled after 1s (isResetting = false, enabled = true)
    → Success message auto-dismisses after 5s
    → END

7b. Operation fails (success = false)
    → Error message shown with details (errors = [...])
    → Button re-enabled (isResetting = false, enabled = true)
    → Error message auto-dismisses after 5s or manual dismiss
    → END
```

### Storage Operation Flow

```
StorageService.resetAll() {
  1. Initialize result object:
     { success: true, errors: [], cleared: { indexedDB: false, localStorage: false } }

  2. Clear IndexedDB:
     try {
       - Get transaction on 'tasks' store (readwrite)
       - Call clear() on object store
       - Wait for transaction to complete
       - Set cleared.indexedDB = true
     } catch (error) {
       - Add error message to errors array
       - Set cleared.indexedDB = false
     }

  3. Clear localStorage:
     try {
       - removeItem('taskOrder')
       - removeItem('estimatedStartTime')
       - removeItem('importHistory')
       - Set cleared.localStorage = true
     } catch (error) {
       - Add error message to errors array
       - Set cleared.localStorage = false
     }

  4. Set success = (errors.length === 0)

  5. Return result object
}
```

---

## Data Validation

### Pre-Reset Checks

Before initiating reset, verify:

1. **Database Initialized**: `this.db !== null`
   - If false: Show error "Database not initialized"

2. **No Concurrent Operations**: Check if import is in progress
   - If true: Keep button disabled, show tooltip

3. **User Confirmation**: Must explicitly confirm
   - No default action on dialog show

### Post-Reset Validation

After reset, verify:

1. **IndexedDB Empty**: Query tasks object store should return empty array
2. **localStorage Keys Gone**: getItem() for reset keys should return null
3. **UI State Reset**: Task list shows empty state message
4. **Button Re-enabled**: Button becomes clickable again

---

## Error Handling

### Error Categories

**Category 1: Database Errors**
- `InvalidStateError`: Database not open or transaction invalid
- `NotFoundError`: Object store doesn't exist
- `TransactionInactiveError`: Transaction already completed

**Category 2: Storage Errors**
- `QuotaExceededError`: Storage quota exceeded (rare during deletion)
- `SecurityError`: Access denied (private browsing mode)

**Category 3: Application Errors**
- `TypeError`: null/undefined database reference
- Generic errors: Unexpected failures

### Error Messages

User-friendly error messages for common scenarios:

```javascript
const ERROR_MESSAGES = {
  'InvalidStateError': 'Could not access database. Please refresh the page and try again.',
  'SecurityError': 'Storage access blocked. Check your browser settings or disable private browsing.',
  'QuotaExceededError': 'Storage quota exceeded. Please free up space and try again.',
  'NotFoundError': 'Data structure not found. Database may need reinitialization.',
  'default': 'An unexpected error occurred. Please refresh and try again.'
};
```

---

## Integration Points

### StorageService Extension

**Existing Methods** (no changes):
- `init()`: Initialize database
- `saveTasks(tasks)`: Save task array
- `getTasks()`: Retrieve all tasks
- `updateTask(task)`: Update single task
- `clearTasks()`: Clear only tasks (used by reset)
- `getEstimatedStartTime()`: Get start time
- `setEstimatedStartTime(time)`: Set start time
- `getImportHistory()`: Get import history
- `setImportHistory(history)`: Set import history
- `getTaskOrder()`: Get task order
- `setTaskOrder(order)`: Set task order

**New Method**:
- `resetAll()`: Clear all application data
  - Calls `clearTasks()` internally
  - Removes localStorage keys
  - Returns detailed result object

### ResetButton Component

**Dependencies**:
- `StorageService` instance: For executing reset
- Application state: For checking if import is in progress
- DOM elements: Button, dialog, message containers

**Provides**:
- Button UI with event handlers
- Confirmation dialog management
- Success/error message display
- State coordination with main app

---

## Testing Data

### Test Scenario 1: Normal Reset with Data

**Initial State**:
- 5 tasks in IndexedDB
- taskOrder in localStorage
- estimatedStartTime = "09:00"
- importHistory present

**Expected Result**:
- All tasks cleared
- All localStorage keys removed
- Success message displayed
- Empty state shown

### Test Scenario 2: Reset with Empty Storage

**Initial State**:
- 0 tasks in IndexedDB
- No localStorage keys

**Expected Result**:
- Operation succeeds (no errors)
- Same success message
- Empty state remains

### Test Scenario 3: Partial Failure

**Simulated Condition**:
- IndexedDB clears successfully
- localStorage.removeItem() throws error

**Expected Result**:
- success = false
- errors = ["localStorage: <error message>"]
- cleared.indexedDB = true
- cleared.localStorage = false
- Error message displays specific failure

---

## Summary

The data model for the reset button feature is lightweight and focuses on:

1. **UI State**: Tracking button, dialog, and message visibility
2. **Storage Operations**: Defining what gets cleared and in what order
3. **Result Reporting**: Providing detailed feedback for success and failure cases
4. **Error Handling**: Categorizing errors and providing user-friendly messages

All data interactions use existing storage mechanisms. No new persistent data structures are introduced.

# API Contract: Reset Button Component

**Feature**: Database Reset Button
**Date**: 2025-10-26
**Phase**: 1 - Design & Contracts
**Version**: 1.0

## Overview

This document defines the API contracts for the Reset Button feature, including the StorageService extension and the ResetButton component interface.

---

## StorageService API Extension

### Method: `resetAll()`

Clears all application data from IndexedDB and localStorage.

**Signature**:
```javascript
async resetAll(): Promise<ResetResult>
```

**Parameters**: None

**Returns**: `Promise<ResetResult>`

```javascript
type ResetResult = {
  success: boolean;         // true if all storage cleared successfully
  errors: string[];         // Array of error messages (empty if success)
  cleared: {
    indexedDB: boolean;     // true if IndexedDB cleared
    localStorage: boolean;  // true if localStorage cleared
  }
}
```

**Behavior**:
1. Attempts to clear IndexedDB tasks object store
2. Attempts to remove all localStorage keys (taskOrder, estimatedStartTime, importHistory)
3. Collects errors from each operation independently
4. Returns detailed result even if partial failure occurs
5. Does not throw exceptions - all errors captured in result

**Examples**:

```javascript
// Success case
const result = await storageService.resetAll();
// Returns:
// {
//   success: true,
//   errors: [],
//   cleared: { indexedDB: true, localStorage: true }
// }

// Partial failure case
const result = await storageService.resetAll();
// Returns:
// {
//   success: false,
//   errors: ["IndexedDB: Transaction failed"],
//   cleared: { indexedDB: false, localStorage: true }
// }
```

**Error Conditions**:
- Database not initialized: Captured in errors array
- Transaction failure: Captured in errors array
- localStorage quota exceeded: Captured in errors array
- Security restrictions: Captured in errors array

**Side Effects**:
- Clears all tasks from IndexedDB
- Removes taskOrder from localStorage
- Removes estimatedStartTime from localStorage
- Removes importHistory from localStorage
- Does NOT close or delete the database
- Does NOT modify database schema

**Performance**:
- Expected completion: < 100ms for typical dataset (10-20 tasks)
- Scales linearly with task count
- localStorage operations are synchronous but fast
- IndexedDB operations are asynchronous

**Thread Safety**:
- Not thread-safe: Do not call concurrently
- Caller responsible for preventing concurrent calls
- Use button disabling to enforce single operation

---

## ResetButton Component API

### Constructor

Creates a new ResetButton component instance.

**Signature**:
```javascript
constructor(storageService: StorageService, options: ResetButtonOptions)
```

**Parameters**:
- `storageService`: Instance of StorageService with resetAll() method
- `options`: Configuration object

```javascript
type ResetButtonOptions = {
  // Element ID for the reset button
  buttonId: string;

  // Element ID for the confirmation dialog
  dialogId: string;

  // Element ID for message container
  messageContainerId: string;

  // Callback fired after successful reset
  onResetComplete?: () => void;

  // Callback fired when reset fails
  onResetError?: (errors: string[]) => void;

  // Function to check if import is in progress
  isImportInProgress?: () => boolean;
}
```

**Example**:
```javascript
const resetButton = new ResetButton(storageService, {
  buttonId: 'reset-button',
  dialogId: 'reset-dialog',
  messageContainerId: 'reset-messages',
  onResetComplete: () => {
    console.log('Reset complete - refresh UI');
    location.reload();
  },
  isImportInProgress: () => appState.importing
});
```

---

### Method: `init()`

Initializes the component and sets up event listeners.

**Signature**:
```javascript
init(): void
```

**Parameters**: None

**Returns**: void

**Behavior**:
- Attaches click handler to reset button
- Attaches handlers to dialog buttons (confirm/cancel)
- Sets up keyboard event listeners (Escape key)
- Initializes component state

**Must be called**: After DOM is ready

**Example**:
```javascript
document.addEventListener('DOMContentLoaded', () => {
  resetButton.init();
});
```

---

### Method: `setEnabled()`

Enables or disables the reset button.

**Signature**:
```javascript
setEnabled(enabled: boolean): void
```

**Parameters**:
- `enabled`: true to enable button, false to disable

**Returns**: void

**Behavior**:
- Updates button `disabled` attribute
- Updates `aria-disabled` attribute
- Updates CSS classes for visual feedback
- If disabled during import, shows tooltip

**Example**:
```javascript
// Disable during import
resetButton.setEnabled(false);

// Re-enable after import
resetButton.setEnabled(true);
```

---

### Method: `showConfirmation()`

Displays the confirmation dialog and waits for user decision.

**Signature**:
```javascript
showConfirmation(): Promise<boolean>
```

**Parameters**: None

**Returns**: `Promise<boolean>`
- Resolves to `true` if user confirms
- Resolves to `false` if user cancels

**Behavior**:
- Shows modal dialog
- Disables background interaction
- Focuses on Cancel button by default (safe default)
- Listens for Escape key (cancels)
- Listens for Enter key (confirms if focused on confirm button)

**Example**:
```javascript
const confirmed = await resetButton.showConfirmation();
if (confirmed) {
  // User clicked "Confirm"
} else {
  // User clicked "Cancel" or pressed Escape
}
```

---

### Method: `hideConfirmation()`

Hides the confirmation dialog.

**Signature**:
```javascript
hideConfirmation(): void
```

**Parameters**: None

**Returns**: void

**Behavior**:
- Hides dialog
- Restores focus to reset button
- Re-enables background interaction

**Example**:
```javascript
resetButton.hideConfirmation();
```

---

### Method: `executeReset()`

Executes the reset operation by calling StorageService.resetAll().

**Signature**:
```javascript
async executeReset(): Promise<ResetResult>
```

**Parameters**: None

**Returns**: `Promise<ResetResult>` (same as StorageService.resetAll())

**Behavior**:
1. Calls `storageService.resetAll()`
2. Waits for completion
3. Returns result
4. Fires callbacks based on result

**Example**:
```javascript
const result = await resetButton.executeReset();
if (result.success) {
  console.log('All data cleared');
} else {
  console.error('Errors:', result.errors);
}
```

---

### Method: `showSuccess()`

Displays a success message after successful reset.

**Signature**:
```javascript
showSuccess(): void
```

**Parameters**: None

**Returns**: void

**Behavior**:
- Shows success message in message container
- Message: "✓ All data cleared successfully"
- Auto-dismisses after 5 seconds
- Green styling (success state)
- Sets `role="alert"` and `aria-live="polite"`

**Example**:
```javascript
if (result.success) {
  resetButton.showSuccess();
}
```

---

### Method: `showError()`

Displays error message(s) after failed reset.

**Signature**:
```javascript
showError(errors: string[]): void
```

**Parameters**:
- `errors`: Array of error messages to display

**Returns**: void

**Behavior**:
- Shows error message in message container
- Formats as bulleted list if multiple errors
- Message: "⚠️ Reset partially failed: [errors]"
- Auto-dismisses after 5 seconds
- Manual dismiss button included
- Red styling (error state)
- Sets `role="alert"` and `aria-live="polite"`

**Example**:
```javascript
if (!result.success) {
  resetButton.showError(result.errors);
}
```

---

## Component Lifecycle

### Initialization Flow

```
1. Create ResetButton instance
   ↓
2. Call init()
   ↓
3. Component ready (button clickable)
```

### Reset Operation Flow

```
1. User clicks button
   ↓
2. Button disabled (setEnabled(false))
   ↓
3. showConfirmation() called
   ↓
4. User decides (confirm or cancel)
   ↓
5a. Cancel: Button re-enabled, END
   ↓
5b. Confirm: executeReset() called
   ↓
6. Result returned
   ↓
7a. Success: showSuccess(), onResetComplete() called, END
   ↓
7b. Failure: showError(), onResetError() called, END
```

---

## HTML Structure Contract

### Required DOM Elements

**Reset Button**:
```html
<button
  id="reset-button"
  type="button"
  class="reset-btn"
  aria-label="Clear all application data">
  Reset All Data
</button>
```

**Confirmation Dialog**:
```html
<div
  id="reset-dialog"
  class="dialog"
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  hidden>
  <div class="dialog-backdrop"></div>
  <div class="dialog-content">
    <h2 id="dialog-title">Confirm Reset</h2>
    <p class="dialog-message">
      This will permanently delete all your data and cannot be undone.
      Are you sure you want to continue?
    </p>
    <div class="dialog-actions">
      <button
        type="button"
        class="btn-cancel"
        id="dialog-cancel">
        Cancel
      </button>
      <button
        type="button"
        class="btn-confirm"
        id="dialog-confirm">
        Delete All Data
      </button>
    </div>
  </div>
</div>
```

**Message Container**:
```html
<div id="reset-messages" class="message-container" aria-live="polite"></div>
```

---

## CSS Class Contract

### Button States

- `.reset-btn`: Base button styling
- `.reset-btn:hover`: Hover state
- `.reset-btn:disabled`: Disabled state
- `.reset-btn:focus`: Focus state

### Dialog States

- `.dialog[hidden]`: Dialog is hidden
- `.dialog:not([hidden])`: Dialog is visible
- `.dialog-backdrop`: Semi-transparent overlay
- `.dialog-content`: Modal content container

### Message States

- `.message-container`: Container styling
- `.message-success`: Success message styling
- `.message-error`: Error message styling
- `.message-dismiss`: Dismiss button styling

---

## Event Contract

### Events Emitted

None (uses callbacks instead of custom events)

### Events Consumed

**Button Click**:
```javascript
button.addEventListener('click', async () => {
  // Handled by component
});
```

**Dialog Confirm**:
```javascript
confirmButton.addEventListener('click', () => {
  // Handled by component
});
```

**Dialog Cancel**:
```javascript
cancelButton.addEventListener('click', () => {
  // Handled by component
});
```

**Keyboard Events**:
```javascript
// Escape key cancels dialog
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dialog.visible) {
    // Cancel dialog
  }
});
```

---

## Accessibility Contract

### ARIA Attributes

**Button**:
- `aria-label`: "Clear all application data"
- `aria-disabled`: Reflects disabled state

**Dialog**:
- `role="dialog"`: Identifies as dialog
- `aria-modal="true"`: Indicates modal behavior
- `aria-labelledby`: References dialog title

**Messages**:
- `role="alert"`: Screen reader announcement
- `aria-live="polite"`: Non-intrusive updates

### Keyboard Navigation

- **Tab**: Navigate between interactive elements
- **Enter**: Activate focused button
- **Escape**: Close dialog (cancel action)
- **Space**: Activate focused button

### Focus Management

1. When dialog opens: Focus moves to Cancel button
2. Focus trapped within dialog while open
3. When dialog closes: Focus returns to reset button
4. Focus visible on all interactive elements

---

## Browser Compatibility

**Supported Browsers**:
- Chrome 90+ (desktop and mobile)
- Firefox 88+ (desktop and mobile)
- Safari 14+ (desktop and iOS)
- Edge 90+ (desktop)

**API Dependencies**:
- IndexedDB API (clear method)
- localStorage API (removeItem method)
- Promise API
- async/await syntax
- classList API

**Graceful Degradation**:
- Feature detection for `<dialog>` element
- Fallback to `<div role="dialog">` if needed
- Polyfill not required (target browsers support all features)

---

## Testing Contract

### Unit Test Requirements

**StorageService.resetAll()**:
- [ ] Returns success=true when all operations succeed
- [ ] Returns success=false when any operation fails
- [ ] Captures errors in errors array
- [ ] Sets cleared.indexedDB correctly
- [ ] Sets cleared.localStorage correctly
- [ ] Handles database not initialized
- [ ] Handles transaction failures
- [ ] Handles localStorage errors

**ResetButton Component**:
- [ ] Initializes without errors
- [ ] Shows dialog on button click
- [ ] Hides dialog on cancel
- [ ] Executes reset on confirm
- [ ] Disables button during operation
- [ ] Shows success message on success
- [ ] Shows error message on failure
- [ ] Re-enables button after completion
- [ ] Handles keyboard events
- [ ] Manages focus correctly

### Integration Test Requirements

- [ ] Button integrated with main app
- [ ] Callbacks fire correctly
- [ ] Import state check works
- [ ] UI updates after reset
- [ ] Error states display correctly
- [ ] Mobile touch works
- [ ] Keyboard navigation works
- [ ] Screen reader announces messages

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-26 | Initial API contract |

---

## Summary

This API contract defines:
1. **StorageService Extension**: Single `resetAll()` method with detailed result object
2. **ResetButton Component**: Full lifecycle methods for UI management
3. **HTML/CSS Contract**: Required DOM structure and class names
4. **Accessibility Contract**: ARIA attributes and keyboard navigation
5. **Testing Contract**: Required test coverage

All APIs follow existing project conventions and maintain backward compatibility with existing StorageService methods.

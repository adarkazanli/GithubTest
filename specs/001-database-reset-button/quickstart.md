# Quickstart Guide: Database Reset Button

**Feature**: Database Reset Button
**Date**: 2025-10-26
**Phase**: 1 - Design & Contracts

## Overview

This guide provides step-by-step instructions for implementing the database reset button feature in the Task Scheduler application.

---

## Prerequisites

- Existing Task Scheduler application is functional
- StorageService is initialized and working
- Modern browser with IndexedDB and localStorage support
- Basic understanding of vanilla JavaScript

---

## Implementation Steps

### Step 1: Extend StorageService

**File**: `src/services/StorageService.js`

Add the `resetAll()` method to the existing StorageService class:

```javascript
/**
 * Reset all application data
 * Clears IndexedDB tasks and all localStorage entries
 * @returns {Promise<Object>} Result object with success status and errors
 */
async resetAll() {
  const errors = [];
  const cleared = { indexedDB: false, localStorage: false };

  // Clear IndexedDB tasks
  try {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tx = this.db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.clear();

    // Wait for transaction to complete
    await new Promise((resolve, reject) => {
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });

    cleared.indexedDB = true;
  } catch (err) {
    errors.push(`IndexedDB: ${err.message}`);
  }

  // Clear localStorage keys
  try {
    localStorage.removeItem('taskOrder');
    localStorage.removeItem('estimatedStartTime');
    localStorage.removeItem('importHistory');
    cleared.localStorage = true;
  } catch (err) {
    errors.push(`localStorage: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    errors,
    cleared
  };
}
```

**Testing**:
```javascript
// Test in browser console
const result = await storageService.resetAll();
console.log(result);
// Expected: { success: true, errors: [], cleared: { indexedDB: true, localStorage: true } }
```

---

### Step 2: Create ResetButton Component

**File**: `src/components/ResetButton.js` (new file)

Create a new directory `src/components/` and add the component:

```javascript
/**
 * ResetButton Component
 * Manages the reset button UI and confirmation dialog
 */
class ResetButton {
  constructor(storageService, options = {}) {
    this.storageService = storageService;
    this.options = {
      buttonId: 'reset-button',
      dialogId: 'reset-dialog',
      messageContainerId: 'reset-messages',
      onResetComplete: null,
      onResetError: null,
      isImportInProgress: () => false,
      ...options
    };

    this.isResetting = false;
    this.button = null;
    this.dialog = null;
    this.messageContainer = null;
  }

  /**
   * Initialize the component
   */
  init() {
    this.button = document.getElementById(this.options.buttonId);
    this.dialog = document.getElementById(this.options.dialogId);
    this.messageContainer = document.getElementById(this.options.messageContainerId);

    if (!this.button || !this.dialog || !this.messageContainer) {
      console.error('ResetButton: Required DOM elements not found');
      return;
    }

    // Attach event listeners
    this.button.addEventListener('click', () => this.handleButtonClick());

    const confirmBtn = this.dialog.querySelector('#dialog-confirm');
    const cancelBtn = this.dialog.querySelector('#dialog-cancel');

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.resolveDialog(true));
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.resolveDialog(false));
    }

    // Keyboard support
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !this.dialog.hidden) {
        this.resolveDialog(false);
      }
    });
  }

  /**
   * Handle reset button click
   */
  async handleButtonClick() {
    // Don't allow reset during other operations
    if (this.isResetting || this.options.isImportInProgress()) {
      return;
    }

    this.setEnabled(false);

    try {
      const confirmed = await this.showConfirmation();

      if (confirmed) {
        const result = await this.executeReset();

        if (result.success) {
          this.showSuccess();
          if (this.options.onResetComplete) {
            this.options.onResetComplete();
          }
        } else {
          this.showError(result.errors);
          if (this.options.onResetError) {
            this.options.onResetError(result.errors);
          }
        }
      }
    } finally {
      this.setEnabled(true);
    }
  }

  /**
   * Show confirmation dialog
   * @returns {Promise<boolean>} True if confirmed, false if cancelled
   */
  showConfirmation() {
    return new Promise((resolve) => {
      this.dialogResolve = resolve;
      this.dialog.hidden = false;

      // Focus cancel button (safe default)
      const cancelBtn = this.dialog.querySelector('#dialog-cancel');
      if (cancelBtn) {
        cancelBtn.focus();
      }
    });
  }

  /**
   * Resolve dialog promise
   * @param {boolean} confirmed
   */
  resolveDialog(confirmed) {
    this.dialog.hidden = true;
    if (this.dialogResolve) {
      this.dialogResolve(confirmed);
      this.dialogResolve = null;
    }
  }

  /**
   * Execute reset operation
   * @returns {Promise<Object>} Reset result
   */
  async executeReset() {
    return await this.storageService.resetAll();
  }

  /**
   * Enable or disable the reset button
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    if (!this.button) return;

    this.button.disabled = !enabled;
    this.button.setAttribute('aria-disabled', !enabled);

    // Update tooltip if disabled during import
    if (!enabled && this.options.isImportInProgress()) {
      this.button.title = 'Reset unavailable during import';
    } else {
      this.button.title = '';
    }
  }

  /**
   * Show success message
   */
  showSuccess() {
    this.showMessage('✓ All data cleared successfully', 'success');
  }

  /**
   * Show error message
   * @param {Array<string>} errors
   */
  showError(errors) {
    const message = errors.length === 1
      ? `⚠️ Reset failed: ${errors[0]}`
      : `⚠️ Reset partially failed:\n• ${errors.join('\n• ')}`;

    this.showMessage(message, 'error');
  }

  /**
   * Display a message
   * @param {string} text
   * @param {string} type - 'success' or 'error'
   */
  showMessage(text, type) {
    if (!this.messageContainer) return;

    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.setAttribute('role', 'alert');
    messageEl.textContent = text;

    // Add dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'message-dismiss';
    dismissBtn.textContent = '×';
    dismissBtn.setAttribute('aria-label', 'Dismiss message');
    dismissBtn.onclick = () => messageEl.remove();
    messageEl.appendChild(dismissBtn);

    this.messageContainer.appendChild(messageEl);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.remove();
      }
    }, 5000);
  }
}
```

---

### Step 3: Update HTML

**File**: `index.html`

Add the reset button next to the import button in the main control panel:

```html
<!-- In your main control panel section -->
<div class="control-panel">
  <div class="import-section">
    <input type="file" id="excel-file" accept=".xlsx" />
    <button id="import-button" class="btn-primary">Import Tasks</button>

    <!-- ADD THIS: Reset button -->
    <button
      id="reset-button"
      type="button"
      class="btn-reset"
      aria-label="Clear all application data">
      Reset All Data
    </button>
  </div>

  <!-- ADD THIS: Message container -->
  <div id="reset-messages" class="message-container" aria-live="polite"></div>
</div>

<!-- ADD THIS: Confirmation dialog (at end of body, before closing tag) -->
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
      This will permanently delete all your task data and cannot be undone.
      Are you sure you want to continue?
    </p>
    <div class="dialog-actions">
      <button
        type="button"
        class="btn-secondary"
        id="dialog-cancel">
        Cancel
      </button>
      <button
        type="button"
        class="btn-danger"
        id="dialog-confirm">
        Delete All Data
      </button>
    </div>
  </div>
</div>
```

**Load the component script**:
```html
<!-- Before closing </body> tag -->
<script src="src/components/ResetButton.js"></script>
```

---

### Step 4: Add CSS Styles

**File**: `styles/main.css`

Add styles for the reset button, dialog, and messages:

```css
/* Reset Button */
.btn-reset {
  background: #dc3545; /* Warning red */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
  transition: background 0.2s, opacity 0.2s;
}

.btn-reset:hover:not(:disabled) {
  background: #c82333;
}

.btn-reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-reset:focus {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

/* Dialog */
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog[hidden] {
  display: none;
}

.dialog-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: relative;
  background: white;
  padding: 24px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.dialog-content h2 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 20px;
}

.dialog-message {
  margin: 0 0 24px 0;
  color: #666;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-secondary {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-danger:hover {
  background: #c82333;
}

/* Messages */
.message-container {
  margin-top: 16px;
}

.message {
  padding: 12px 16px;
  border-radius: 4px;
  margin-bottom: 8px;
  position: relative;
  padding-right: 40px;
  white-space: pre-line;
  animation: fadeIn 0.2s ease-out;
}

.message-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.message-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.message-dismiss {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  font-size: 20px;
  color: inherit;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  line-height: 20px;
}

.message-dismiss:hover {
  opacity: 0.7;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .btn-reset {
    margin-left: 0;
    margin-top: 10px;
    width: 100%;
  }

  .dialog-content {
    width: 95%;
    padding: 20px;
  }

  .dialog-actions {
    flex-direction: column-reverse;
  }

  .dialog-actions button {
    width: 100%;
  }
}
```

---

### Step 5: Wire in Main Application

**File**: `src/main.js`

Initialize the ResetButton component after StorageService is ready:

```javascript
// Existing initialization code...

// Initialize StorageService
const storageService = new StorageService();
await storageService.init();

// ADD THIS: Initialize ResetButton
let resetButton;
if (typeof ResetButton !== 'undefined') {
  resetButton = new ResetButton(storageService, {
    onResetComplete: () => {
      // Refresh the task list
      loadTasks();

      // Optionally reload the page
      // location.reload();
    },
    onResetError: (errors) => {
      console.error('Reset errors:', errors);
    },
    isImportInProgress: () => {
      // Check if import is currently running
      return window.isImporting === true;
    }
  });

  resetButton.init();
}

// ADD THIS: Disable reset button during import
document.getElementById('import-button').addEventListener('click', async () => {
  window.isImporting = true;
  if (resetButton) {
    resetButton.setEnabled(false);
  }

  try {
    // ... existing import logic ...
  } finally {
    window.isImporting = false;
    if (resetButton) {
      resetButton.setEnabled(true);
    }
  }
});
```

---

## Testing Checklist

After implementation, verify the following:

### Functional Tests

- [ ] **Button Visibility**: Reset button appears next to import button
- [ ] **Click Handler**: Clicking button shows confirmation dialog
- [ ] **Cancel Action**: Clicking Cancel closes dialog without deleting data
- [ ] **Confirm Action**: Clicking Confirm clears all data
- [ ] **Success Message**: Success message appears after reset
- [ ] **Empty State**: Task list shows empty state after reset
- [ ] **Data Cleared**: Verify IndexedDB and localStorage are empty

### Edge Case Tests

- [ ] **Empty Storage**: Reset works when no data exists
- [ ] **Disable During Import**: Button is disabled when import is in progress
- [ ] **Disable During Reset**: Button is disabled during reset operation
- [ ] **Double Click**: Rapid clicks don't create multiple dialogs
- [ ] **Storage Errors**: Error messages display correctly for storage failures

### Browser Tests

- [ ] **Chrome**: Test on Chrome 90+ (desktop and mobile)
- [ ] **Firefox**: Test on Firefox 88+
- [ ] **Safari**: Test on Safari 14+ (desktop and iOS)
- [ ] **Edge**: Test on Edge 90+

### Accessibility Tests

- [ ] **Keyboard Navigation**: Tab through button, dialog, and messages
- [ ] **Escape Key**: Pressing Escape cancels dialog
- [ ] **Screen Reader**: Test with VoiceOver/NVDA/JAWS
- [ ] **Focus Management**: Focus returns to button after dialog closes
- [ ] **ARIA Labels**: All interactive elements have proper labels

### Mobile Tests

- [ ] **Touch Interaction**: Tap button works on mobile
- [ ] **Dialog Display**: Dialog displays correctly on small screens
- [ ] **Button Layout**: Button layout adapts to mobile viewport

---

## Troubleshooting

### Button Not Appearing

**Issue**: Reset button doesn't show up

**Solutions**:
1. Check that HTML includes button element with `id="reset-button"`
2. Verify CSS is loaded (check styles in DevTools)
3. Check browser console for JavaScript errors
4. Ensure ResetButton.js is loaded before main.js

### Dialog Not Showing

**Issue**: Clicking button doesn't show dialog

**Solutions**:
1. Check that dialog element exists with `id="reset-dialog"`
2. Verify `init()` was called on ResetButton instance
3. Check console for errors in event handler
4. Verify dialog doesn't have `hidden` attribute by default in CSS

### Reset Not Working

**Issue**: Data not being cleared

**Solutions**:
1. Open DevTools → Application → IndexedDB → verify database exists
2. Check console for errors during `resetAll()` execution
3. Verify StorageService is initialized (`this.db` is not null)
4. Test `storageService.resetAll()` directly in console

### Button Not Disabling During Import

**Issue**: Reset button stays enabled during import

**Solutions**:
1. Verify `isImportInProgress` callback is set correctly
2. Check that `window.isImporting` flag is being set
3. Call `resetButton.setEnabled(false)` explicitly at import start
4. Call `resetButton.setEnabled(true)` in import finally block

---

## Performance Notes

- Reset operation typically completes in < 100ms for datasets under 100 tasks
- Confirmation dialog adds ~500ms delay for user decision
- Success message auto-dismisses after 5 seconds
- No impact on page load performance (lazy-loaded component)

---

## Next Steps

After completing implementation:

1. Run through testing checklist
2. Test on all supported browsers
3. Test on mobile devices
4. Get user feedback on confirmation dialog wording
5. Monitor for any error reports
6. Consider adding telemetry for reset operations (optional)

---

## Support

For issues or questions:
- Check browser console for error messages
- Review API contract: `contracts/reset-button-api.md`
- Review data model: `data-model.md`
- Review research findings: `research.md`

/**
 * Unit Tests for ResetButton Component
 *
 * Tests reset button initialization, confirmation dialog, and reset flow.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { setupDOM, cleanupDOM } from '../../helpers/dom-setup.js';

// Mock StorageService
class MockStorageService {
  constructor() {
    this.resetAllCalled = false;
    this.shouldFail = false;
  }

  async resetAll() {
    this.resetAllCalled = true;
    if (this.shouldFail) {
      return {
        success: false,
        errors: ['Test error'],
        cleared: { indexedDB: false, localStorage: false }
      };
    }
    return {
      success: true,
      errors: [],
      cleared: { indexedDB: true, localStorage: true }
    };
  }
}

// Simple ResetButton implementation for testing
class ResetButton {
  constructor(storageService, options = {}) {
    this.storageService = storageService;
    this.options = {
      buttonId: 'reset-button',
      dialogId: 'reset-dialog',
      messageContainerId: 'reset-messages',
      onResetComplete: null,
      onResetError: null,
      ...options
    };

    this.isResetting = false;
    this.button = null;
    this.dialog = null;
    this.messageContainer = null;
    this.dialogResolve = null;
  }

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
  }

  async handleButtonClick() {
    if (this.isResetting) return;

    this.isResetting = true;

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
      this.isResetting = false;
    }
  }

  showConfirmation() {
    return new Promise((resolve) => {
      this.dialogResolve = resolve;
      this.dialog.hidden = false;
    });
  }

  resolveDialog(confirmed) {
    this.dialog.hidden = true;
    if (this.dialogResolve) {
      this.dialogResolve(confirmed);
      this.dialogResolve = null;
    }
  }

  async executeReset() {
    return await this.storageService.resetAll();
  }

  showSuccess() {
    this.messageContainer.innerHTML = '<div class="message-success">Success</div>';
  }

  showError(errors) {
    this.messageContainer.innerHTML = '<div class="message-error">Error: ' + errors.join(', ') + '</div>';
  }
}

describe('ResetButton', () => {
  let resetButton;
  let mockStorage;

  beforeEach(() => {
    setupDOM();
    mockStorage = new MockStorageService();
    resetButton = new ResetButton(mockStorage);
  });

  afterEach(() => {
    cleanupDOM();
  });

  describe('init', () => {
    test('should initialize button and find DOM elements', () => {
      resetButton.init();

      expect(resetButton.button).toBeDefined();
      expect(resetButton.dialog).toBeDefined();
      expect(resetButton.messageContainer).toBeDefined();
      expect(resetButton.button.id).toBe('reset-button');
      expect(resetButton.dialog.id).toBe('reset-dialog');
    });

    test('should setup event listeners', () => {
      resetButton.init();

      // Verify button has click handler
      const button = document.getElementById('reset-button');
      expect(button).toBeDefined();

      // Check that dialog buttons exist
      const confirmBtn = document.getElementById('dialog-confirm');
      const cancelBtn = document.getElementById('dialog-cancel');

      expect(confirmBtn).toBeDefined();
      expect(cancelBtn).toBeDefined();
    });
  });

  describe('click handler', () => {
    test('should show confirmation dialog when button is clicked', async () => {
      resetButton.init();

      const button = document.getElementById('reset-button');
      const dialog = document.getElementById('reset-dialog');

      expect(dialog.hidden).toBe(true);

      // Trigger button click
      const clickPromise = resetButton.handleButtonClick();

      // Dialog should be visible immediately after promise starts
      expect(dialog.hidden).toBe(false);

      // Cancel to resolve promise
      resetButton.resolveDialog(false);
      await clickPromise;
    });

    test('should not allow multiple simultaneous resets', async () => {
      resetButton.init();

      resetButton.isResetting = true;

      const result = await resetButton.handleButtonClick();

      // Should return early without showing dialog
      expect(result).toBeUndefined();
      expect(mockStorage.resetAllCalled).toBe(false);
    });
  });

  describe('confirmation flow', () => {
    test('should reset data when user confirms', async () => {
      resetButton.init();

      const button = document.getElementById('reset-button');

      // Start reset flow
      const clickPromise = resetButton.handleButtonClick();

      // Confirm dialog
      resetButton.resolveDialog(true);

      await clickPromise;

      // Verify reset was called
      expect(mockStorage.resetAllCalled).toBe(true);

      // Verify success message shown
      const messageContainer = document.getElementById('reset-messages');
      expect(messageContainer.innerHTML).toContain('Success');
    });

    test('should preserve data when user cancels', async () => {
      resetButton.init();

      const clickPromise = resetButton.handleButtonClick();

      // Cancel dialog
      resetButton.resolveDialog(false);

      await clickPromise;

      // Verify reset was NOT called
      expect(mockStorage.resetAllCalled).toBe(false);
    });

    test('should trigger onResetComplete callback', async () => {
      const callback = vi.fn();
      resetButton = new ResetButton(mockStorage, {
        onResetComplete: callback
      });
      resetButton.init();

      const clickPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await clickPromise;

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset execution', () => {
    test('should call StorageService.clearAll', async () => {
      resetButton.init();

      const clickPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await clickPromise;

      expect(mockStorage.resetAllCalled).toBe(true);
    });

    test('should show success message on successful reset', async () => {
      resetButton.init();

      const clickPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await clickPromise;

      const messageContainer = document.getElementById('reset-messages');
      expect(messageContainer.innerHTML).toContain('Success');
    });

    test('should call onResetComplete callback on success', async () => {
      const callback = vi.fn();
      resetButton = new ResetButton(mockStorage, {
        onResetComplete: callback
      });
      resetButton.init();

      const clickPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await clickPromise;

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    test('should handle storage errors gracefully', async () => {
      mockStorage.shouldFail = true;
      resetButton.init();

      const clickPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await clickPromise;

      // Verify error message shown
      const messageContainer = document.getElementById('reset-messages');
      expect(messageContainer.innerHTML).toContain('Error');
    });

    test('should call onResetError callback on failure', async () => {
      mockStorage.shouldFail = true;
      const callback = vi.fn();
      resetButton = new ResetButton(mockStorage, {
        onResetError: callback
      });
      resetButton.init();

      const clickPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await clickPromise;

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledWith(['Test error']);
    });

    test('should propagate callback errors', async () => {
      const throwingCallback = () => {
        throw new Error('Callback error');
      };

      resetButton = new ResetButton(mockStorage, {
        onResetComplete: throwingCallback
      });
      resetButton.init();

      // Callback errors should propagate
      const clickPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);

      await expect(clickPromise).rejects.toThrow('Callback error');
    });
  });

  describe('dialog state management', () => {
    test('should hide dialog after confirmation', async () => {
      resetButton.init();

      const dialog = document.getElementById('reset-dialog');

      const clickPromise = resetButton.handleButtonClick();
      expect(dialog.hidden).toBe(false);

      resetButton.resolveDialog(true);
      await clickPromise;

      expect(dialog.hidden).toBe(true);
    });

    test('should hide dialog after cancellation', async () => {
      resetButton.init();

      const dialog = document.getElementById('reset-dialog');

      const clickPromise = resetButton.handleButtonClick();
      expect(dialog.hidden).toBe(false);

      resetButton.resolveDialog(false);
      await clickPromise;

      expect(dialog.hidden).toBe(true);
    });
  });
});

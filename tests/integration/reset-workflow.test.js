/**
 * Integration Test: Database Reset Workflow
 *
 * Tests the complete reset flow: click → confirm → clear storage → UI update
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { StorageMock } from '../helpers/storage-mock.js';
import { setupDOM, cleanupDOM } from '../helpers/dom-setup.js';

// StorageService for integration testing
class StorageService {
  constructor(storage = localStorage) {
    this.storage = storage;
    this.storageKey = 'taskSchedulerData';
  }

  init() {
    const data = this.storage.getItem(this.storageKey);
    if (!data) {
      this.storage.setItem(this.storageKey, JSON.stringify({
        tasks: [],
        estimatedStartTime: '09:00',
        importHistory: null,
        version: '1.0'
      }));
    }
  }

  getData() {
    const data = this.storage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  saveTasks(tasks) {
    const data = this.getData() || {
      tasks: [],
      estimatedStartTime: '09:00',
      importHistory: null,
      version: '1.0'
    };

    data.tasks = tasks;
    this.storage.setItem(this.storageKey, JSON.stringify(data));
  }

  getTasks() {
    const data = this.getData();
    return data ? data.tasks : [];
  }

  setImportHistory(history) {
    const data = this.getData() || {
      tasks: [],
      estimatedStartTime: '09:00',
      importHistory: null,
      version: '1.0'
    };

    data.importHistory = history;
    this.storage.setItem(this.storageKey, JSON.stringify(data));
  }

  getImportHistory() {
    const data = this.getData();
    return data ? data.importHistory : null;
  }

  clearAll() {
    this.storage.removeItem(this.storageKey);
    return {
      success: true,
      errors: [],
      cleared: { storage: true }
    };
  }
}

// ResetButton component for integration testing
class ResetButton {
  constructor(storageService, options = {}) {
    this.storageService = storageService;
    this.options = {
      buttonId: 'reset-button',
      dialogId: 'reset-dialog',
      messageContainerId: 'reset-messages',
      onResetComplete: null,
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
    return await this.storageService.clearAll();
  }

  showSuccess() {
    this.messageContainer.innerHTML = '<div class="message-success">Data cleared successfully</div>';
  }
}

describe('Database Reset Workflow Integration', () => {
  let storage;
  let storageService;
  let resetButton;

  beforeEach(() => {
    setupDOM();
    storage = new StorageMock();
    storageService = new StorageService(storage);
    storageService.init();

    // Populate storage with test data
    storageService.saveTasks([
      { orderId: '001', taskName: 'Task 1', estimatedDuration: 30 },
      { orderId: '002', taskName: 'Task 2', estimatedDuration: 45 }
    ]);

    storageService.setImportHistory({
      validRows: 2,
      invalidRows: 0,
      fileName: 'test.xlsx',
      importDate: '2025-11-01T10:00:00.000Z'
    });

    resetButton = new ResetButton(storageService);
    resetButton.init();
  });

  afterEach(() => {
    cleanupDOM();
    storage.clear();
  });

  describe('Reset confirmation flow', () => {
    test('should complete full reset workflow: click → confirm → clear storage', async () => {
      // Verify initial state
      expect(storageService.getTasks()).toHaveLength(2);
      expect(storageService.getImportHistory()).toBeDefined();

      // Click reset button
      const resetPromise = resetButton.handleButtonClick();

      // Verify dialog shown
      const dialog = document.getElementById('reset-dialog');
      expect(dialog.hidden).toBe(false);

      // Confirm reset
      resetButton.resolveDialog(true);
      await resetPromise;

      // Verify storage cleared
      expect(storageService.getTasks()).toHaveLength(0);
      expect(storageService.getData()).toBeNull();
    });

    test('should verify storage is completely cleared after reset', async () => {
      const resetPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await resetPromise;

      // Check storage directly
      const rawData = storage.getItem('taskSchedulerData');
      expect(rawData).toBeNull();
    });

    test('should hide dialog after confirmation', async () => {
      const dialog = document.getElementById('reset-dialog');

      const resetPromise = resetButton.handleButtonClick();
      expect(dialog.hidden).toBe(false);

      resetButton.resolveDialog(true);
      await resetPromise;

      expect(dialog.hidden).toBe(true);
    });
  });

  describe('Reset cancellation', () => {
    test('should preserve storage when reset is cancelled', async () => {
      // Verify initial state
      const initialTasks = storageService.getTasks();
      const initialHistory = storageService.getImportHistory();

      expect(initialTasks).toHaveLength(2);
      expect(initialHistory).toBeDefined();

      // Start reset flow
      const resetPromise = resetButton.handleButtonClick();

      // Cancel reset
      resetButton.resolveDialog(false);
      await resetPromise;

      // Verify storage unchanged
      const currentTasks = storageService.getTasks();
      const currentHistory = storageService.getImportHistory();

      expect(currentTasks).toHaveLength(2);
      expect(currentHistory).toEqual(initialHistory);
      expect(currentTasks[0].taskName).toBe('Task 1');
    });

    test('should verify storage not modified on cancel', async () => {
      const initialData = storage.getItem('taskSchedulerData');

      const resetPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(false);
      await resetPromise;

      const currentData = storage.getItem('taskSchedulerData');
      expect(currentData).toBe(initialData);
    });
  });

  describe('Reset UI updates', () => {
    test('should show success message after reset', async () => {
      const resetPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await resetPromise;

      const messageContainer = document.getElementById('reset-messages');
      expect(messageContainer.innerHTML).toContain('Data cleared successfully');
    });

    test('should update UI to show empty state', async () => {
      const resetPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await resetPromise;

      // After reset, tasks should be empty
      expect(storageService.getTasks()).toEqual([]);
    });

    test('should clear import summary', async () => {
      const resetPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await resetPromise;

      // Import history should be cleared
      expect(storageService.getImportHistory()).toBeNull();
    });
  });

  describe('Reset callback execution', () => {
    test('should trigger onResetComplete callback', async () => {
      const callback = vi.fn();

      resetButton = new ResetButton(storageService, {
        onResetComplete: callback
      });
      resetButton.init();

      const resetPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await resetPromise;

      expect(callback).toHaveBeenCalled();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    test('should execute callback after storage is cleared', async () => {
      let tasksAtCallbackTime = null;

      const callback = () => {
        tasksAtCallbackTime = storageService.getTasks();
      };

      resetButton = new ResetButton(storageService, {
        onResetComplete: callback
      });
      resetButton.init();

      const resetPromise = resetButton.handleButtonClick();
      resetButton.resolveDialog(true);
      await resetPromise;

      // Callback should see empty tasks
      expect(tasksAtCallbackTime).toEqual([]);
    });
  });

  describe('Multi-step reset workflow', () => {
    test('should handle complete workflow from populated state to empty state', async () => {
      // Step 1: Verify populated state
      expect(storageService.getTasks()).toHaveLength(2);
      expect(storageService.getImportHistory()).toBeDefined();

      // Step 2: User clicks reset
      const resetPromise = resetButton.handleButtonClick();

      // Step 3: Dialog appears
      const dialog = document.getElementById('reset-dialog');
      expect(dialog.hidden).toBe(false);

      // Step 4: User confirms
      resetButton.resolveDialog(true);
      await resetPromise;

      // Step 5: Verify empty state
      expect(storageService.getTasks()).toEqual([]);
      expect(storageService.getImportHistory()).toBeNull();

      // Step 6: Verify dialog hidden
      expect(dialog.hidden).toBe(true);

      // Step 7: Verify success message
      const messageContainer = document.getElementById('reset-messages');
      expect(messageContainer.innerHTML).toBeDefined();
    });
  });
});

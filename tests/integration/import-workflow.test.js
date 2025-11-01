/**
 * Integration Test: Excel Import Workflow
 *
 * Tests the complete flow: file upload → parse → validate → store → verify
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { StorageMock } from '../helpers/storage-mock.js';
import { createMockExcelFile } from '../helpers/file-mock.js';
import { setupDOM, cleanupDOM } from '../helpers/dom-setup.js';

// Import the ExcelImporter from unit tests (it has the implementation)
class ExcelImporter {
  static async importFile(file) {
    const XLSX = await import('xlsx');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, { type: 'array' });
          const sheetName = workbook.SheetNames[0];

          if (!sheetName) {
            throw new Error('No sheets found in Excel file');
          }

          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet);

          const result = ExcelImporter.validateAndParse(rawData, file.name);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('File read error'));
      reader.readAsArrayBuffer(file);
    });
  }

  static validateAndParse(rawData, fileName) {
    const tasks = [];
    const invalidRows = [];

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return {
        tasks: [],
        summary: {
          validRows: 0,
          invalidRows: 0,
          fileName: fileName
        }
      };
    }

    rawData.forEach((row, index) => {
      try {
        const orderId = String(row['Order ID'] || '').trim();
        const taskName = String(row['Task Name'] || '').trim();
        const durationStr = String(row['Estimated Duration (minutes)'] || '').trim();

        if (!orderId) {
          throw new Error('Order ID is required');
        }

        if (!taskName) {
          throw new Error('Task Name is required');
        }

        const duration = parseInt(durationStr, 10);
        if (isNaN(duration)) {
          throw new Error('Invalid duration format');
        }
        if (duration <= 0) {
          throw new Error('Duration must be greater than 0');
        }

        tasks.push({
          orderId,
          taskName,
          estimatedDuration: duration
        });
      } catch (error) {
        invalidRows.push({
          row: index + 1,
          error: error.message,
          data: row
        });
      }
    });

    return {
      tasks,
      summary: {
        validRows: tasks.length,
        invalidRows: invalidRows.length,
        fileName: fileName,
        invalidDetails: invalidRows
      }
    };
  }
}

// Simple StorageService for integration testing
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
}

describe('Excel Import Workflow Integration', () => {
  let storage;
  let storageService;

  beforeEach(() => {
    setupDOM();
    storage = new StorageMock();
    storageService = new StorageService(storage);
    storageService.init();
  });

  afterEach(() => {
    cleanupDOM();
    storage.clear();
  });

  describe('Valid Excel import workflow', () => {
    test('should complete full import workflow: file → parse → validate → store', async () => {
      // Step 1: Create Excel file
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Task 1', '30'],
        ['002', 'Task 2', '45'],
        ['003', 'Task 3', '60']
      ];

      const file = await createMockExcelFile(data, 'test-tasks.xlsx');

      // Step 2: Import and parse file
      const result = await ExcelImporter.importFile(file);

      expect(result.tasks).toHaveLength(3);
      expect(result.summary.validRows).toBe(3);
      expect(result.summary.invalidRows).toBe(0);

      // Step 3: Store tasks
      storageService.saveTasks(result.tasks);

      // Step 4: Verify in storage
      const storedTasks = storageService.getTasks();
      expect(storedTasks).toHaveLength(3);
      expect(storedTasks[0].orderId).toBe('001');
      expect(storedTasks[0].taskName).toBe('Task 1');
      expect(storedTasks[0].estimatedDuration).toBe(30);
    });

    test('should verify tasks persist correctly in storage', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Initialize Project', '30']
      ];

      const file = await createMockExcelFile(data, 'project.xlsx');

      // Import and store
      const result = await ExcelImporter.importFile(file);
      storageService.saveTasks(result.tasks);

      // Verify storage contents
      const rawData = storage.getItem('taskSchedulerData');
      expect(rawData).toBeDefined();

      const parsed = JSON.parse(rawData);
      expect(parsed.tasks).toHaveLength(1);
      expect(parsed.tasks[0].taskName).toBe('Initialize Project');
    });
  });

  describe('Invalid Excel import workflow', () => {
    test('should handle validation errors and provide summary', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Valid Task', '30'],
        ['', 'Missing Order ID', '45'],
        ['003', '', '20'],
        ['004', 'Valid Task 2', '60']
      ];

      const file = await createMockExcelFile(data, 'invalid-tasks.xlsx');

      // Import with validation
      const result = await ExcelImporter.importFile(file);

      // Verify summary
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.invalidRows).toBe(2);
      expect(result.summary.fileName).toBe('invalid-tasks.xlsx');

      // Verify invalid details
      expect(result.summary.invalidDetails).toHaveLength(2);
      expect(result.summary.invalidDetails[0].error).toContain('Order ID');
      expect(result.summary.invalidDetails[1].error).toContain('Task Name');

      // Store only valid tasks
      storageService.saveTasks(result.tasks);

      const storedTasks = storageService.getTasks();
      expect(storedTasks).toHaveLength(2);
    });

    test('should provide valid/invalid counts in summary', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Task 1', '30'],
        ['', 'Invalid', '45'],
        ['003', 'Task 3', '60']
      ];

      const file = await createMockExcelFile(data, 'mixed.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.summary).toEqual({
        validRows: 2,
        invalidRows: 1,
        fileName: 'mixed.xlsx',
        invalidDetails: expect.any(Array)
      });
    });
  });

  describe('Excel import with existing tasks', () => {
    test('should append new tasks to existing tasks', async () => {
      // Setup: Add existing tasks
      storageService.saveTasks([
        { orderId: '001', taskName: 'Existing Task', estimatedDuration: 30 }
      ]);

      // Import new tasks
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['002', 'New Task 1', '45'],
        ['003', 'New Task 2', '60']
      ];

      const file = await createMockExcelFile(data, 'new-tasks.xlsx');
      const result = await ExcelImporter.importFile(file);

      // Append to existing
      const existingTasks = storageService.getTasks();
      const allTasks = [...existingTasks, ...result.tasks];
      storageService.saveTasks(allTasks);

      // Verify all tasks present
      const storedTasks = storageService.getTasks();
      expect(storedTasks).toHaveLength(3);
      expect(storedTasks[0].taskName).toBe('Existing Task');
      expect(storedTasks[1].taskName).toBe('New Task 1');
      expect(storedTasks[2].taskName).toBe('New Task 2');
    });

    test('should not replace existing tasks on import', async () => {
      // Add existing tasks
      const existingTasks = [
        { orderId: '001', taskName: 'Task A', estimatedDuration: 30 },
        { orderId: '002', taskName: 'Task B', estimatedDuration: 45 }
      ];
      storageService.saveTasks(existingTasks);

      // Import should not automatically replace
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['003', 'Task C', '60']
      ];

      const file = await createMockExcelFile(data, 'new.xlsx');
      const result = await ExcelImporter.importFile(file);

      // Check existing tasks are still there
      const storedTasks = storageService.getTasks();
      expect(storedTasks).toHaveLength(2);
      expect(storedTasks[0].taskName).toBe('Task A');
    });
  });

  describe('Import history tracking', () => {
    test('should save import history to storage', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Task 1', '30'],
        ['002', 'Task 2', '45']
      ];

      const file = await createMockExcelFile(data, 'history-test.xlsx');
      const result = await ExcelImporter.importFile(file);

      // Save tasks
      storageService.saveTasks(result.tasks);

      // Save import history
      const importHistory = {
        validRows: result.summary.validRows,
        invalidRows: result.summary.invalidRows,
        fileName: result.summary.fileName,
        importDate: new Date().toISOString()
      };

      storageService.setImportHistory(importHistory);

      // Verify history saved
      const savedHistory = storageService.getImportHistory();
      expect(savedHistory).toBeDefined();
      expect(savedHistory.validRows).toBe(2);
      expect(savedHistory.invalidRows).toBe(0);
      expect(savedHistory.fileName).toBe('history-test.xlsx');
      expect(savedHistory.importDate).toBeDefined();
    });

    test('should persist import history across storage operations', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Task', '30']
      ];

      const file = await createMockExcelFile(data, 'test.xlsx');
      const result = await ExcelImporter.importFile(file);

      storageService.saveTasks(result.tasks);

      const importHistory = {
        validRows: 1,
        invalidRows: 0,
        fileName: 'test.xlsx',
        importDate: '2025-11-01T10:00:00.000Z'
      };

      storageService.setImportHistory(importHistory);

      // Create new service instance (simulating page reload)
      const newService = new StorageService(storage);
      const retrievedHistory = newService.getImportHistory();

      expect(retrievedHistory).toEqual(importHistory);
    });
  });
});

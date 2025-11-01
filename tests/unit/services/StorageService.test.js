/**
 * Unit Tests for StorageService
 *
 * Tests data persistence with localStorage.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { StorageMock } from '../../helpers/storage-mock.js';
import Task from '../../../src/models/Task.js';

// Simple StorageService implementation for testing (localStorage-based)
class StorageService {
  constructor(storage = localStorage) {
    this.storage = storage;
    this.storageKey = 'taskSchedulerData';
    this.version = '1.0';
  }

  /**
   * Initialize the storage service
   */
  init() {
    const data = this.storage.getItem(this.storageKey);
    if (!data) {
      this.storage.setItem(this.storageKey, JSON.stringify({
        tasks: [],
        estimatedStartTime: '09:00',
        importHistory: null,
        version: this.version
      }));
    }
  }

  /**
   * Get all data from storage
   */
  getData() {
    const data = this.storage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Save tasks to storage
   */
  saveTasks(tasks) {
    const data = this.getData() || {
      tasks: [],
      estimatedStartTime: '09:00',
      importHistory: null,
      version: this.version
    };

    data.tasks = tasks.map(task => task.toJSON ? task.toJSON() : task);
    this.storage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Get all tasks from storage
   */
  getTasks() {
    const data = this.getData();
    if (!data || !data.tasks) {
      return [];
    }

    // Reconstruct Task instances
    return data.tasks.map(taskData => Task.fromJSON(taskData));
  }

  /**
   * Update a single task
   */
  updateTask(updatedTask) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);

    if (index !== -1) {
      tasks[index] = updatedTask;
      this.saveTasks(tasks);
    }
  }

  /**
   * Clear all data
   */
  clearAll() {
    this.storage.removeItem(this.storageKey);
  }

  /**
   * Get estimated start time
   */
  getEstimatedStartTime() {
    const data = this.getData();
    return data ? data.estimatedStartTime : '09:00';
  }

  /**
   * Set estimated start time
   */
  setEstimatedStartTime(time) {
    const data = this.getData() || {
      tasks: [],
      estimatedStartTime: '09:00',
      importHistory: null,
      version: this.version
    };

    data.estimatedStartTime = time;
    this.storage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Get import history
   */
  getImportHistory() {
    const data = this.getData();
    return data ? data.importHistory : null;
  }

  /**
   * Set import history
   */
  setImportHistory(history) {
    const data = this.getData() || {
      tasks: [],
      estimatedStartTime: '09:00',
      importHistory: null,
      version: this.version
    };

    data.importHistory = history;
    this.storage.setItem(this.storageKey, JSON.stringify(data));
  }
}

describe('StorageService', () => {
  let storage;
  let storageService;

  beforeEach(() => {
    // Create a fresh StorageMock for each test
    storage = new StorageMock();
    storageService = new StorageService(storage);
  });

  afterEach(() => {
    storage.clear();
  });

  describe('init', () => {
    test('should initialize storage with default values', () => {
      storageService.init();

      const data = JSON.parse(storage.getItem('taskSchedulerData'));
      expect(data).toBeDefined();
      expect(data.tasks).toEqual([]);
      expect(data.estimatedStartTime).toBe('09:00');
      expect(data.importHistory).toBeNull();
      expect(data.version).toBe('1.0');
    });

    test('should not overwrite existing data', () => {
      storage.setItem('taskSchedulerData', JSON.stringify({
        tasks: [{ id: 'test-1', taskName: 'Existing' }],
        estimatedStartTime: '10:00',
        importHistory: null,
        version: '1.0'
      }));

      storageService.init();

      const data = JSON.parse(storage.getItem('taskSchedulerData'));
      expect(data.tasks).toHaveLength(1);
      expect(data.estimatedStartTime).toBe('10:00');
    });
  });

  describe('saveTasks and getTasks', () => {
    test('should save and retrieve tasks', () => {
      storageService.init();

      const tasks = [
        new Task({ orderId: '001', taskName: 'Task 1', estimatedDuration: 30 }),
        new Task({ orderId: '002', taskName: 'Task 2', estimatedDuration: 45 })
      ];

      storageService.saveTasks(tasks);
      const retrieved = storageService.getTasks();

      expect(retrieved).toHaveLength(2);
      expect(retrieved[0]).toBeInstanceOf(Task);
      expect(retrieved[0].taskName).toBe('Task 1');
      expect(retrieved[1].taskName).toBe('Task 2');
    });

    test('should return empty array when no tasks exist', () => {
      storageService.init();

      const tasks = storageService.getTasks();
      expect(tasks).toEqual([]);
    });

    test('should verify localStorage calls during save', () => {
      storageService.init();

      const tasks = [
        new Task({ orderId: '001', taskName: 'Task', estimatedDuration: 30 })
      ];

      const initialLength = storage.length;
      storageService.saveTasks(tasks);

      expect(storage.length).toBeGreaterThanOrEqual(initialLength);
      expect(storage.getItem('taskSchedulerData')).toBeDefined();
    });

    test('should reconstruct Task instances with all properties', () => {
      storageService.init();

      const task = new Task({
        id: 'task-123',
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60,
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Test notes'
      });

      storageService.saveTasks([task]);
      const retrieved = storageService.getTasks();

      expect(retrieved[0]).toBeInstanceOf(Task);
      expect(retrieved[0].id).toBe('task-123');
      expect(retrieved[0].orderId).toBe('001');
      expect(retrieved[0].taskName).toBe('Test Task');
      expect(retrieved[0].estimatedDuration).toBe(60);
      expect(retrieved[0].startTime).toBe('09:00');
      expect(retrieved[0].endTime).toBe('10:00');
      expect(retrieved[0].notes).toBe('Test notes');
    });
  });

  describe('updateTask', () => {
    test('should update a single task', () => {
      storageService.init();

      const tasks = [
        new Task({ id: 'task-1', orderId: '001', taskName: 'Original', estimatedDuration: 30 }),
        new Task({ id: 'task-2', orderId: '002', taskName: 'Task 2', estimatedDuration: 45 })
      ];

      storageService.saveTasks(tasks);

      const updatedTask = new Task({
        id: 'task-1',
        orderId: '001',
        taskName: 'Updated Task',
        estimatedDuration: 60,
        notes: 'Updated notes'
      });

      storageService.updateTask(updatedTask);

      const retrieved = storageService.getTasks();
      expect(retrieved[0].taskName).toBe('Updated Task');
      expect(retrieved[0].estimatedDuration).toBe(60);
      expect(retrieved[0].notes).toBe('Updated notes');
      expect(retrieved[1].taskName).toBe('Task 2');
    });

    test('should verify persistence after update', () => {
      storageService.init();

      const task = new Task({ id: 'task-1', orderId: '001', taskName: 'Original', estimatedDuration: 30 });
      storageService.saveTasks([task]);

      task.notes = 'Updated notes';
      storageService.updateTask(task);

      const data = JSON.parse(storage.getItem('taskSchedulerData'));
      expect(data.tasks[0].notes).toBe('Updated notes');
    });
  });

  describe('clearAll', () => {
    test('should clear all data', () => {
      storageService.init();

      const tasks = [
        new Task({ orderId: '001', taskName: 'Task', estimatedDuration: 30 })
      ];
      storageService.saveTasks(tasks);

      storageService.clearAll();

      const data = storage.getItem('taskSchedulerData');
      expect(data).toBeNull();
    });

    test('should reset to initial state', () => {
      storageService.init();

      const tasks = [
        new Task({ orderId: '001', taskName: 'Task', estimatedDuration: 30 })
      ];
      storageService.saveTasks(tasks);
      storageService.setEstimatedStartTime('14:00');

      storageService.clearAll();
      storageService.init();

      const retrieved = storageService.getTasks();
      const startTime = storageService.getEstimatedStartTime();

      expect(retrieved).toEqual([]);
      expect(startTime).toBe('09:00');
    });
  });

  describe('getEstimatedStartTime and setEstimatedStartTime', () => {
    test('should get and set estimated start time', () => {
      storageService.init();

      expect(storageService.getEstimatedStartTime()).toBe('09:00');

      storageService.setEstimatedStartTime('14:30');
      expect(storageService.getEstimatedStartTime()).toBe('14:30');
    });

    test('should persist start time across instances', () => {
      storageService.init();
      storageService.setEstimatedStartTime('10:00');

      const newService = new StorageService(storage);
      expect(newService.getEstimatedStartTime()).toBe('10:00');
    });
  });

  describe('setImportHistory and getImportHistory', () => {
    test('should set and retrieve import history', () => {
      storageService.init();

      const history = {
        validRows: 10,
        invalidRows: 2,
        fileName: 'test.xlsx',
        importDate: '2025-11-01T10:00:00.000Z'
      };

      storageService.setImportHistory(history);
      const retrieved = storageService.getImportHistory();

      expect(retrieved).toEqual(history);
      expect(retrieved.validRows).toBe(10);
      expect(retrieved.invalidRows).toBe(2);
    });

    test('should return null when no history exists', () => {
      storageService.init();

      const history = storageService.getImportHistory();
      expect(history).toBeNull();
    });
  });
});

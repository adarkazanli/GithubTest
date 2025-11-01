/**
 * Integration Test: Time Update Workflow
 *
 * Tests the complete flow: change start time → recalculate all tasks → persist
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { StorageMock } from '../helpers/storage-mock.js';
import { setupDOM, cleanupDOM } from '../helpers/dom-setup.js';
import Task from '../../src/models/Task.js';
import TaskCalculator from '../../src/services/TaskCalculator.js';

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

    data.tasks = tasks.map(t => t.toJSON ? t.toJSON() : t);
    this.storage.setItem(this.storageKey, JSON.stringify(data));
  }

  getTasks() {
    const data = this.getData();
    if (!data || !data.tasks) return [];
    return data.tasks.map(t => Task.fromJSON(t));
  }

  getEstimatedStartTime() {
    const data = this.getData();
    return data ? data.estimatedStartTime : '09:00';
  }

  setEstimatedStartTime(time) {
    const data = this.getData() || {
      tasks: [],
      estimatedStartTime: '09:00',
      importHistory: null,
      version: '1.0'
    };

    data.estimatedStartTime = time;
    this.storage.setItem(this.storageKey, JSON.stringify(data));
  }
}

// TimeUpdateController for managing time updates
class TimeUpdateController {
  constructor(storageService) {
    this.storageService = storageService;
  }

  /**
   * Update estimated start time and recalculate all tasks
   */
  updateStartTime(newStartTime) {
    // Validate time format first
    if (!this.isValidTimeFormat(newStartTime)) {
      throw new Error('Invalid time format');
    }

    // Get current tasks
    const tasks = this.storageService.getTasks();

    // Recalculate times
    TaskCalculator.calculateTimes(tasks, newStartTime);

    // Save updated tasks and start time
    this.storageService.saveTasks(tasks);
    this.storageService.setEstimatedStartTime(newStartTime);

    return tasks;
  }

  isValidTimeFormat(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return false;
    const match = timeStr.match(/^(\d{2}):(\d{2})$/);
    if (!match) return false;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
  }
}

describe('Time Update Workflow Integration', () => {
  let storage;
  let storageService;
  let timeController;

  beforeEach(() => {
    setupDOM();
    storage = new StorageMock();
    storageService = new StorageService(storage);
    storageService.init();

    // Populate storage with test tasks
    const tasks = [
      new Task({ orderId: '001', taskName: 'Task 1', estimatedDuration: 30 }),
      new Task({ orderId: '002', taskName: 'Task 2', estimatedDuration: 45 }),
      new Task({ orderId: '003', taskName: 'Task 3', estimatedDuration: 60 })
    ];

    // Calculate initial times with 09:00 start
    TaskCalculator.calculateTimes(tasks, '09:00');
    storageService.saveTasks(tasks);
    storageService.setEstimatedStartTime('09:00');

    timeController = new TimeUpdateController(storageService);
  });

  afterEach(() => {
    cleanupDOM();
    storage.clear();
  });

  describe('Estimated start time change', () => {
    test('should update start time and recalculate all tasks', () => {
      // Verify initial state
      let tasks = storageService.getTasks();
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[0].endTime).toBe('09:30');
      expect(tasks[1].startTime).toBe('09:30');
      expect(tasks[1].endTime).toBe('10:15');
      expect(tasks[2].startTime).toBe('10:15');
      expect(tasks[2].endTime).toBe('11:15');

      // Update start time to 14:00
      timeController.updateStartTime('14:00');

      // Verify all tasks recalculated
      tasks = storageService.getTasks();
      expect(tasks[0].startTime).toBe('14:00');
      expect(tasks[0].endTime).toBe('14:30');
      expect(tasks[1].startTime).toBe('14:30');
      expect(tasks[1].endTime).toBe('15:15');
      expect(tasks[2].startTime).toBe('15:15');
      expect(tasks[2].endTime).toBe('16:15');
    });

    test('should verify all tasks recalculated in sequence', () => {
      timeController.updateStartTime('08:00');

      const tasks = storageService.getTasks();

      // Task 1: 08:00 + 30min = 08:30
      expect(tasks[0].startTime).toBe('08:00');
      expect(tasks[0].endTime).toBe('08:30');

      // Task 2: 08:30 + 45min = 09:15
      expect(tasks[1].startTime).toBe('08:30');
      expect(tasks[1].endTime).toBe('09:15');

      // Task 3: 09:15 + 60min = 10:15
      expect(tasks[2].startTime).toBe('09:15');
      expect(tasks[2].endTime).toBe('10:15');
    });

    test('should update estimated start time in storage', () => {
      timeController.updateStartTime('13:30');

      const storedStartTime = storageService.getEstimatedStartTime();
      expect(storedStartTime).toBe('13:30');
    });
  });

  describe('Time update persistence', () => {
    test('should persist recalculated times to storage', () => {
      timeController.updateStartTime('10:00');

      // Create new service instance (simulating page reload)
      const newService = new StorageService(storage);
      const tasks = newService.getTasks();

      expect(tasks[0].startTime).toBe('10:00');
      expect(tasks[0].endTime).toBe('10:30');
      expect(tasks[1].startTime).toBe('10:30');
      expect(tasks[2].startTime).toBe('11:15');
    });

    test('should verify recalculated times saved to storage', () => {
      timeController.updateStartTime('15:00');

      // Check raw storage data
      const rawData = storage.getItem('taskSchedulerData');
      const data = JSON.parse(rawData);

      expect(data.estimatedStartTime).toBe('15:00');
      expect(data.tasks[0].startTime).toBe('15:00');
      expect(data.tasks[0].endTime).toBe('15:30');
      expect(data.tasks[1].startTime).toBe('15:30');
      expect(data.tasks[2].startTime).toBe('16:15');
    });

    test('should persist across multiple updates', () => {
      // First update
      timeController.updateStartTime('10:00');
      let tasks = storageService.getTasks();
      expect(tasks[0].startTime).toBe('10:00');

      // Second update
      timeController.updateStartTime('14:00');
      tasks = storageService.getTasks();
      expect(tasks[0].startTime).toBe('14:00');

      // Third update
      timeController.updateStartTime('08:30');
      tasks = storageService.getTasks();
      expect(tasks[0].startTime).toBe('08:30');
      expect(tasks[0].endTime).toBe('09:00');
    });
  });

  describe('Invalid time format handling', () => {
    test('should throw error for invalid time format', () => {
      expect(() => {
        timeController.updateStartTime('25:00');
      }).toThrow('Invalid time format');
    });

    test('should not change state when validation fails', () => {
      const tasksBefore = storageService.getTasks();
      const startTimeBefore = storageService.getEstimatedStartTime();

      try {
        timeController.updateStartTime('invalid');
      } catch (e) {
        // Expected
      }

      const tasksAfter = storageService.getTasks();
      const startTimeAfter = storageService.getEstimatedStartTime();

      // State should be unchanged
      expect(startTimeAfter).toBe(startTimeBefore);
      expect(tasksAfter[0].startTime).toBe(tasksBefore[0].startTime);
      expect(tasksAfter[0].endTime).toBe(tasksBefore[0].endTime);
    });

    test('should reject invalid formats: single digit hours', () => {
      expect(() => {
        timeController.updateStartTime('9:00');
      }).toThrow();
    });

    test('should reject invalid formats: out of range', () => {
      expect(() => {
        timeController.updateStartTime('24:00');
      }).toThrow();

      expect(() => {
        timeController.updateStartTime('12:60');
      }).toThrow();
    });

    test('should reject empty or null time', () => {
      expect(() => {
        timeController.updateStartTime('');
      }).toThrow();

      expect(() => {
        timeController.updateStartTime(null);
      }).toThrow();
    });
  });

  describe('Complete time update workflow', () => {
    test('should handle full workflow: read → validate → update → recalculate → save', () => {
      // Step 1: Read current state
      const initialTasks = storageService.getTasks();
      const initialStartTime = storageService.getEstimatedStartTime();
      expect(initialStartTime).toBe('09:00');
      expect(initialTasks[0].startTime).toBe('09:00');

      // Step 2: Validate new time (done internally by updateStartTime)
      const newTime = '13:00';

      // Step 3-5: Update, recalculate, and save
      timeController.updateStartTime(newTime);

      // Step 6: Verify new state
      const updatedTasks = storageService.getTasks();
      const updatedStartTime = storageService.getEstimatedStartTime();

      expect(updatedStartTime).toBe('13:00');
      expect(updatedTasks[0].startTime).toBe('13:00');
      expect(updatedTasks[0].endTime).toBe('13:30');
      expect(updatedTasks[1].startTime).toBe('13:30');
      expect(updatedTasks[1].endTime).toBe('14:15');
      expect(updatedTasks[2].startTime).toBe('14:15');
      expect(updatedTasks[2].endTime).toBe('15:15');
    });

    test('should handle midnight crossover correctly', () => {
      // Start at 23:30 with first task being 30 minutes
      timeController.updateStartTime('23:30');

      const tasks = storageService.getTasks();

      // Task 1: 23:30 + 30min = 00:00
      expect(tasks[0].startTime).toBe('23:30');
      expect(tasks[0].endTime).toBe('00:00');

      // Task 2: 00:00 + 45min = 00:45
      expect(tasks[1].startTime).toBe('00:00');
      expect(tasks[1].endTime).toBe('00:45');
    });

    test('should handle early morning times', () => {
      timeController.updateStartTime('00:00');

      const tasks = storageService.getTasks();

      expect(tasks[0].startTime).toBe('00:00');
      expect(tasks[0].endTime).toBe('00:30');
      expect(tasks[1].startTime).toBe('00:30');
      expect(tasks[1].endTime).toBe('01:15');
      expect(tasks[2].startTime).toBe('01:15');
      expect(tasks[2].endTime).toBe('02:15');
    });
  });

  describe('Edge cases', () => {
    test('should handle time update with single task', () => {
      // Clear and add single task
      const singleTask = [
        new Task({ orderId: '001', taskName: 'Single Task', estimatedDuration: 120 })
      ];
      TaskCalculator.calculateTimes(singleTask, '09:00');
      storageService.saveTasks(singleTask);

      timeController.updateStartTime('14:00');

      const tasks = storageService.getTasks();
      expect(tasks).toHaveLength(1);
      expect(tasks[0].startTime).toBe('14:00');
      expect(tasks[0].endTime).toBe('16:00'); // 14:00 + 120min
    });

    test('should handle time update with no tasks', () => {
      // Clear all tasks
      storageService.saveTasks([]);

      // Should not throw error
      expect(() => {
        timeController.updateStartTime('14:00');
      }).not.toThrow();

      expect(storageService.getEstimatedStartTime()).toBe('14:00');
    });

    test('should handle very late start times', () => {
      timeController.updateStartTime('23:00');

      const tasks = storageService.getTasks();

      expect(tasks[0].startTime).toBe('23:00');
      expect(tasks[0].endTime).toBe('23:30');
      expect(tasks[1].startTime).toBe('23:30');
      expect(tasks[1].endTime).toBe('00:15'); // Crosses midnight
    });
  });
});

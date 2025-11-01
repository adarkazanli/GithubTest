/**
 * Integration Test: Task Reordering Workflow
 *
 * Tests the complete flow: drag task → drop → reorder → recalculate times → persist
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
}

// ReorderController for managing task reordering
class ReorderController {
  constructor(storageService) {
    this.storageService = storageService;
  }

  /**
   * Reorder tasks and recalculate times
   */
  reorderTasks(fromIndex, toIndex) {
    const tasks = this.storageService.getTasks();

    if (fromIndex < 0 || fromIndex >= tasks.length ||
        toIndex < 0 || toIndex >= tasks.length) {
      throw new Error('Invalid index');
    }

    // Reorder array
    const [movedTask] = tasks.splice(fromIndex, 1);
    tasks.splice(toIndex, 0, movedTask);

    // Recalculate times
    const startTime = this.storageService.getEstimatedStartTime();
    TaskCalculator.calculateTimes(tasks, startTime);

    // Save
    this.storageService.saveTasks(tasks);

    return tasks;
  }

  /**
   * Simulate drag-and-drop reorder
   */
  simulateDragDrop(taskId, newPosition) {
    const tasks = this.storageService.getTasks();
    const currentIndex = tasks.findIndex(t => t.id === taskId);

    if (currentIndex === -1) {
      throw new Error('Task not found');
    }

    return this.reorderTasks(currentIndex, newPosition);
  }
}

describe('Task Reordering Workflow Integration', () => {
  let storage;
  let storageService;
  let reorderController;
  let task1, task2, task3;

  beforeEach(() => {
    setupDOM();
    storage = new StorageMock();
    storageService = new StorageService(storage);
    storageService.init();

    // Create test tasks with specific IDs
    task1 = new Task({
      id: 'task-001',
      orderId: '001',
      taskName: 'Task 1',
      estimatedDuration: 30
    });

    task2 = new Task({
      id: 'task-002',
      orderId: '002',
      taskName: 'Task 2',
      estimatedDuration: 45
    });

    task3 = new Task({
      id: 'task-003',
      orderId: '003',
      taskName: 'Task 3',
      estimatedDuration: 60
    });

    // Calculate initial times
    const tasks = [task1, task2, task3];
    TaskCalculator.calculateTimes(tasks, '09:00');
    storageService.saveTasks(tasks);

    reorderController = new ReorderController(storageService);
  });

  afterEach(() => {
    cleanupDOM();
    storage.clear();
  });

  describe('Drag-and-drop reorder', () => {
    test('should simulate drag and drop to reorder tasks', () => {
      // Initial order: Task1, Task2, Task3
      let tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-001');
      expect(tasks[1].id).toBe('task-002');
      expect(tasks[2].id).toBe('task-003');

      // Drag Task 3 to position 0 (move to top)
      reorderController.simulateDragDrop('task-003', 0);

      // New order: Task3, Task1, Task2
      tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-003');
      expect(tasks[1].id).toBe('task-001');
      expect(tasks[2].id).toBe('task-002');
    });

    test('should verify task order changed in storage', () => {
      // Move Task 2 to position 0
      reorderController.simulateDragDrop('task-002', 0);

      // Verify in storage
      const rawData = storage.getItem('taskSchedulerData');
      const data = JSON.parse(rawData);

      expect(data.tasks[0].id).toBe('task-002');
      expect(data.tasks[1].id).toBe('task-001');
      expect(data.tasks[2].id).toBe('task-003');
    });

    test('should handle moving task down in the list', () => {
      // Move Task 1 to position 2 (last position)
      reorderController.reorderTasks(0, 2);

      const tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-002');
      expect(tasks[1].id).toBe('task-003');
      expect(tasks[2].id).toBe('task-001');
    });

    test('should handle moving task up in the list', () => {
      // Move Task 3 to position 0 (first position)
      reorderController.reorderTasks(2, 0);

      const tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-003');
      expect(tasks[1].id).toBe('task-001');
      expect(tasks[2].id).toBe('task-002');
    });
  });

  describe('Reorder with time recalculation', () => {
    test('should recalculate times after reorder', () => {
      // Initial times:
      // Task1: 09:00-09:30 (30min)
      // Task2: 09:30-10:15 (45min)
      // Task3: 10:15-11:15 (60min)

      let tasks = storageService.getTasks();
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[1].startTime).toBe('09:30');
      expect(tasks[2].startTime).toBe('10:15');

      // Move Task3 to first position
      reorderController.reorderTasks(2, 0);

      // New times:
      // Task3: 09:00-10:00 (60min)
      // Task1: 10:00-10:30 (30min)
      // Task2: 10:30-11:15 (45min)

      tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-003');
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[0].endTime).toBe('10:00');

      expect(tasks[1].id).toBe('task-001');
      expect(tasks[1].startTime).toBe('10:00');
      expect(tasks[1].endTime).toBe('10:30');

      expect(tasks[2].id).toBe('task-002');
      expect(tasks[2].startTime).toBe('10:30');
      expect(tasks[2].endTime).toBe('11:15');
    });

    test('should verify startTime and endTime updated correctly', () => {
      // Move Task 2 (45min) to first position
      reorderController.reorderTasks(1, 0);

      const tasks = storageService.getTasks();

      // Task2: 09:00-09:45 (45min)
      expect(tasks[0].taskName).toBe('Task 2');
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[0].endTime).toBe('09:45');

      // Task1: 09:45-10:15 (30min)
      expect(tasks[1].taskName).toBe('Task 1');
      expect(tasks[1].startTime).toBe('09:45');
      expect(tasks[1].endTime).toBe('10:15');

      // Task3: 10:15-11:15 (60min)
      expect(tasks[2].taskName).toBe('Task 3');
      expect(tasks[2].startTime).toBe('10:15');
      expect(tasks[2].endTime).toBe('11:15');
    });

    test('should recalculate all subsequent tasks', () => {
      // Move last task to middle
      reorderController.reorderTasks(2, 1);

      const tasks = storageService.getTasks();

      // Task1: 09:00-09:30
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[0].endTime).toBe('09:30');

      // Task3: 09:30-10:30 (moved here)
      expect(tasks[1].id).toBe('task-003');
      expect(tasks[1].startTime).toBe('09:30');
      expect(tasks[1].endTime).toBe('10:30');

      // Task2: 10:30-11:15
      expect(tasks[2].startTime).toBe('10:30');
      expect(tasks[2].endTime).toBe('11:15');
    });
  });

  describe('Reorder persistence', () => {
    test('should persist new order across page reload', () => {
      // Reorder tasks
      reorderController.reorderTasks(0, 2);

      // Create new service instance (simulating page reload)
      const newService = new StorageService(storage);
      const tasks = newService.getTasks();

      // Verify order persisted
      expect(tasks[0].id).toBe('task-002');
      expect(tasks[1].id).toBe('task-003');
      expect(tasks[2].id).toBe('task-001');
    });

    test('should persist recalculated times across storage retrieval', () => {
      // Reorder and recalculate
      reorderController.reorderTasks(2, 0);

      // Retrieve from storage
      const newService = new StorageService(storage);
      const tasks = newService.getTasks();

      // Verify times persisted
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[0].endTime).toBe('10:00');
      expect(tasks[1].startTime).toBe('10:00');
      expect(tasks[1].endTime).toBe('10:30');
    });

    test('should handle multiple reorders and persist correctly', () => {
      // First reorder
      reorderController.reorderTasks(0, 2);
      let tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-002');

      // Second reorder
      reorderController.reorderTasks(1, 0);
      tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-003');

      // Verify persistence
      const newService = new StorageService(storage);
      const persistedTasks = newService.getTasks();
      expect(persistedTasks[0].id).toBe('task-003');
      expect(persistedTasks[1].id).toBe('task-002');
      expect(persistedTasks[2].id).toBe('task-001');
    });
  });

  describe('Complete reorder workflow', () => {
    test('should handle full workflow: drag → drop → reorder → recalculate → save → verify', () => {
      // Step 1: Initial state
      let tasks = storageService.getTasks();
      expect(tasks[0].taskName).toBe('Task 1');
      expect(tasks[0].startTime).toBe('09:00');

      // Step 2: Simulate drag Task 3 to position 0
      const taskIdToDrag = 'task-003';
      const newPosition = 0;

      // Step 3: Execute reorder
      reorderController.simulateDragDrop(taskIdToDrag, newPosition);

      // Step 4: Verify reorder happened
      tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-003');

      // Step 5: Verify times recalculated
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[0].endTime).toBe('10:00'); // Task3 is 60min

      // Step 6: Verify saved to storage
      const rawData = storage.getItem('taskSchedulerData');
      const data = JSON.parse(rawData);
      expect(data.tasks[0].id).toBe('task-003');
      expect(data.tasks[0].startTime).toBe('09:00');
    });

    test('should maintain data integrity through reorder', () => {
      const originalTask3Name = task3.taskName;
      const originalTask3Duration = task3.estimatedDuration;

      // Reorder
      reorderController.reorderTasks(2, 0);

      // Verify task properties unchanged (only position/times changed)
      const tasks = storageService.getTasks();
      const movedTask = tasks[0];

      expect(movedTask.taskName).toBe(originalTask3Name);
      expect(movedTask.estimatedDuration).toBe(originalTask3Duration);
      expect(movedTask.orderId).toBe('003');
    });
  });

  describe('Edge cases', () => {
    test('should handle reorder with two tasks', () => {
      // Clear and add two tasks
      const twoTasks = [
        new Task({ id: 'a', orderId: '001', taskName: 'A', estimatedDuration: 30 }),
        new Task({ id: 'b', orderId: '002', taskName: 'B', estimatedDuration: 45 })
      ];
      TaskCalculator.calculateTimes(twoTasks, '09:00');
      storageService.saveTasks(twoTasks);

      // Swap them
      reorderController.reorderTasks(0, 1);

      const tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('b');
      expect(tasks[1].id).toBe('a');
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[1].startTime).toBe('09:45');
    });

    test('should handle reorder to same position (no-op)', () => {
      const tasksBefore = storageService.getTasks();

      // Move task 1 to position 0 (where it already is)
      reorderController.reorderTasks(0, 0);

      const tasksAfter = storageService.getTasks();

      expect(tasksAfter[0].id).toBe(tasksBefore[0].id);
      expect(tasksAfter[0].startTime).toBe(tasksBefore[0].startTime);
    });

    test('should reject invalid indices', () => {
      expect(() => {
        reorderController.reorderTasks(-1, 0);
      }).toThrow('Invalid index');

      expect(() => {
        reorderController.reorderTasks(0, 10);
      }).toThrow('Invalid index');
    });

    test('should reject reorder of non-existent task', () => {
      expect(() => {
        reorderController.simulateDragDrop('non-existent-id', 0);
      }).toThrow('Task not found');
    });
  });

  describe('Complex reorder scenarios', () => {
    test('should handle reordering with many tasks', () => {
      // Create 5 tasks
      const manyTasks = Array.from({ length: 5 }, (_, i) =>
        new Task({
          id: `task-${i}`,
          orderId: String(i).padStart(3, '0'),
          taskName: `Task ${i}`,
          estimatedDuration: 30
        })
      );

      TaskCalculator.calculateTimes(manyTasks, '09:00');
      storageService.saveTasks(manyTasks);

      // Move last to first
      reorderController.reorderTasks(4, 0);

      const tasks = storageService.getTasks();
      expect(tasks[0].id).toBe('task-4');
      expect(tasks[4].id).toBe('task-3');
    });

    test('should handle cascade of time changes', () => {
      // Create tasks with different durations
      const variedTasks = [
        new Task({ id: '1', orderId: '001', taskName: 'Short', estimatedDuration: 15 }),
        new Task({ id: '2', orderId: '002', taskName: 'Medium', estimatedDuration: 45 }),
        new Task({ id: '3', orderId: '003', taskName: 'Long', estimatedDuration: 120 })
      ];

      TaskCalculator.calculateTimes(variedTasks, '09:00');
      storageService.saveTasks(variedTasks);

      // Move long task to beginning
      reorderController.reorderTasks(2, 0);

      const tasks = storageService.getTasks();

      // Long task: 09:00-11:00
      expect(tasks[0].startTime).toBe('09:00');
      expect(tasks[0].endTime).toBe('11:00');

      // Short task: 11:00-11:15
      expect(tasks[1].startTime).toBe('11:00');
      expect(tasks[1].endTime).toBe('11:15');

      // Medium task: 11:15-12:00
      expect(tasks[2].startTime).toBe('11:15');
      expect(tasks[2].endTime).toBe('12:00');
    });
  });
});

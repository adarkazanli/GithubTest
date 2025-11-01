/**
 * Unit Tests for Task Model
 *
 * Tests the Task class constructor, validation, and methods.
 */

import { describe, test, expect } from 'vitest';
import Task from '../../../src/models/Task.js';

describe('Task Model', () => {
  describe('Constructor', () => {
    test('should create a Task with all properties', () => {
      const task = new Task({
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60,
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Test notes'
      });

      expect(task.id).toBeDefined();
      expect(task.orderId).toBe('001');
      expect(task.taskName).toBe('Test Task');
      expect(task.estimatedDuration).toBe(60);
      expect(task.startTime).toBe('09:00');
      expect(task.endTime).toBe('10:00');
      expect(task.notes).toBe('Test notes');
    });

    test('should generate a unique ID if not provided', () => {
      const task1 = new Task({
        orderId: '001',
        taskName: 'Task 1',
        estimatedDuration: 30
      });

      const task2 = new Task({
        orderId: '002',
        taskName: 'Task 2',
        estimatedDuration: 30
      });

      expect(task1.id).toBeDefined();
      expect(task2.id).toBeDefined();
      expect(task1.id).not.toBe(task2.id);
    });

    test('should use provided ID if given', () => {
      const task = new Task({
        id: 'custom-id-123',
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60
      });

      expect(task.id).toBe('custom-id-123');
    });

    test('should set default values for optional properties', () => {
      const task = new Task({
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60
      });

      expect(task.startTime).toBeNull();
      expect(task.endTime).toBeNull();
      expect(task.notes).toBe('');
    });
  });

  describe('validate', () => {
    test('should return true for valid task data', () => {
      const task = new Task({
        orderId: '001',
        taskName: 'Valid Task',
        estimatedDuration: 60
      });

      expect(task.validate()).toBe(true);
    });

    test('should throw error for missing orderId', () => {
      expect(() => {
        new Task({
          orderId: '',
          taskName: 'Test Task',
          estimatedDuration: 60
        }).validate();
      }).toThrow('Order ID is required');
    });

    test('should throw error for missing taskName', () => {
      expect(() => {
        new Task({
          orderId: '001',
          taskName: '',
          estimatedDuration: 60
        }).validate();
      }).toThrow('Task Name is required');
    });

    test('should throw error for invalid estimatedDuration', () => {
      expect(() => {
        new Task({
          orderId: '001',
          taskName: 'Test Task',
          estimatedDuration: 0
        }).validate();
      }).toThrow('Estimated Duration must be greater than 0');

      expect(() => {
        new Task({
          orderId: '001',
          taskName: 'Test Task',
          estimatedDuration: -10
        }).validate();
      }).toThrow('Estimated Duration must be greater than 0');
    });

    test('should throw error for non-numeric estimatedDuration', () => {
      expect(() => {
        new Task({
          orderId: '001',
          taskName: 'Test Task',
          estimatedDuration: 'invalid'
        }).validate();
      }).toThrow('Estimated Duration must be a number');
    });
  });

  describe('toJSON', () => {
    test('should serialize task to plain object', () => {
      const task = new Task({
        id: 'task-001',
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60,
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Test notes'
      });

      const json = task.toJSON();

      expect(json).toEqual({
        id: 'task-001',
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60,
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Test notes'
      });
    });

    test('should handle null values correctly', () => {
      const task = new Task({
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60
      });

      const json = task.toJSON();

      expect(json.startTime).toBeNull();
      expect(json.endTime).toBeNull();
      expect(json.notes).toBe('');
    });
  });

  describe('fromJSON', () => {
    test('should create Task from plain object', () => {
      const data = {
        id: 'task-001',
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60,
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Test notes'
      };

      const task = Task.fromJSON(data);

      expect(task).toBeInstanceOf(Task);
      expect(task.id).toBe('task-001');
      expect(task.orderId).toBe('001');
      expect(task.taskName).toBe('Test Task');
      expect(task.estimatedDuration).toBe(60);
      expect(task.startTime).toBe('09:00');
      expect(task.endTime).toBe('10:00');
      expect(task.notes).toBe('Test notes');
    });

    test('should handle missing optional properties', () => {
      const data = {
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60
      };

      const task = Task.fromJSON(data);

      expect(task).toBeInstanceOf(Task);
      expect(task.startTime).toBeNull();
      expect(task.endTime).toBeNull();
      expect(task.notes).toBe('');
    });
  });

  describe('clone', () => {
    test('should create a deep copy of the task', () => {
      const original = new Task({
        id: 'task-001',
        orderId: '001',
        taskName: 'Test Task',
        estimatedDuration: 60,
        startTime: '09:00',
        endTime: '10:00',
        notes: 'Test notes'
      });

      const clone = original.clone();

      expect(clone).not.toBe(original);
      expect(clone).toBeInstanceOf(Task);
      expect(clone.id).toBe(original.id);
      expect(clone.orderId).toBe(original.orderId);
      expect(clone.taskName).toBe(original.taskName);
      expect(clone.estimatedDuration).toBe(original.estimatedDuration);
      expect(clone.startTime).toBe(original.startTime);
      expect(clone.endTime).toBe(original.endTime);
      expect(clone.notes).toBe(original.notes);
    });

    test('should create independent copy', () => {
      const original = new Task({
        orderId: '001',
        taskName: 'Original Task',
        estimatedDuration: 60,
        notes: 'Original notes'
      });

      const clone = original.clone();
      clone.taskName = 'Modified Task';
      clone.notes = 'Modified notes';

      expect(original.taskName).toBe('Original Task');
      expect(original.notes).toBe('Original notes');
      expect(clone.taskName).toBe('Modified Task');
      expect(clone.notes).toBe('Modified notes');
    });
  });
});

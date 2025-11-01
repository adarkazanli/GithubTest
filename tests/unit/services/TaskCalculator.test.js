/**
 * Unit Tests for TaskCalculator
 *
 * Tests time calculation logic for task scheduling.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import TaskCalculator from '../../../src/services/TaskCalculator.js';
import Task from '../../../src/models/Task.js';

describe('TaskCalculator', () => {
  describe('calculateTimes with single task', () => {
    test('should calculate start and end times for a single task', () => {
      const tasks = [
        new Task({
          orderId: '001',
          taskName: 'Test Task',
          estimatedDuration: 60
        })
      ];

      const result = TaskCalculator.calculateTimes(tasks, '09:00');

      expect(result).toHaveLength(1);
      expect(result[0].startTime).toBe('09:00');
      expect(result[0].endTime).toBe('10:00');
    });

    test('should handle tasks with different durations', () => {
      const tasks = [
        new Task({
          orderId: '001',
          taskName: 'Short Task',
          estimatedDuration: 30
        })
      ];

      const result = TaskCalculator.calculateTimes(tasks, '14:00');

      expect(result[0].startTime).toBe('14:00');
      expect(result[0].endTime).toBe('14:30');
    });

    test('should handle tasks with fractional hour durations', () => {
      const tasks = [
        new Task({
          orderId: '001',
          taskName: 'Task',
          estimatedDuration: 45
        })
      ];

      const result = TaskCalculator.calculateTimes(tasks, '10:15');

      expect(result[0].startTime).toBe('10:15');
      expect(result[0].endTime).toBe('11:00');
    });
  });

  describe('calculateTimes with multiple tasks', () => {
    test('should calculate cumulative times for multiple tasks', () => {
      const tasks = [
        new Task({ orderId: '001', taskName: 'Task 1', estimatedDuration: 30 }),
        new Task({ orderId: '002', taskName: 'Task 2', estimatedDuration: 45 }),
        new Task({ orderId: '003', taskName: 'Task 3', estimatedDuration: 60 })
      ];

      const result = TaskCalculator.calculateTimes(tasks, '09:00');

      expect(result[0].startTime).toBe('09:00');
      expect(result[0].endTime).toBe('09:30');

      expect(result[1].startTime).toBe('09:30');
      expect(result[1].endTime).toBe('10:15');

      expect(result[2].startTime).toBe('10:15');
      expect(result[2].endTime).toBe('11:15');
    });

    test('should handle tasks spanning multiple hours', () => {
      const tasks = [
        new Task({ orderId: '001', taskName: 'Task 1', estimatedDuration: 120 }),
        new Task({ orderId: '002', taskName: 'Task 2', estimatedDuration: 90 })
      ];

      const result = TaskCalculator.calculateTimes(tasks, '08:00');

      expect(result[0].startTime).toBe('08:00');
      expect(result[0].endTime).toBe('10:00');

      expect(result[1].startTime).toBe('10:00');
      expect(result[1].endTime).toBe('11:30');
    });
  });

  describe('calculateTimes with empty task array', () => {
    test('should return empty array when given empty array', () => {
      const result = TaskCalculator.calculateTimes([], '09:00');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('should handle null or undefined gracefully', () => {
      expect(() => {
        TaskCalculator.calculateTimes(null, '09:00');
      }).not.toThrow();

      expect(() => {
        TaskCalculator.calculateTimes(undefined, '09:00');
      }).not.toThrow();
    });
  });

  describe('calculateTimes with invalid start time', () => {
    test('should throw error for invalid time format', () => {
      const tasks = [
        new Task({ orderId: '001', taskName: 'Task', estimatedDuration: 30 })
      ];

      expect(() => {
        TaskCalculator.calculateTimes(tasks, '25:00');
      }).toThrow();

      expect(() => {
        TaskCalculator.calculateTimes(tasks, 'invalid');
      }).toThrow();
    });

    test('should throw error for empty start time', () => {
      const tasks = [
        new Task({ orderId: '001', taskName: 'Task', estimatedDuration: 30 })
      ];

      expect(() => {
        TaskCalculator.calculateTimes(tasks, '');
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    test('should handle midnight crossover correctly', () => {
      const tasks = [
        new Task({ orderId: '001', taskName: 'Late Task', estimatedDuration: 90 })
      ];

      const result = TaskCalculator.calculateTimes(tasks, '23:00');

      expect(result[0].startTime).toBe('23:00');
      expect(result[0].endTime).toBe('00:30');
    });

    test('should handle very long duration tasks', () => {
      const tasks = [
        new Task({ orderId: '001', taskName: 'Long Task', estimatedDuration: 480 }) // 8 hours
      ];

      const result = TaskCalculator.calculateTimes(tasks, '09:00');

      expect(result[0].startTime).toBe('09:00');
      expect(result[0].endTime).toBe('17:00');
    });

    test('should handle task starting at midnight', () => {
      const tasks = [
        new Task({ orderId: '001', taskName: 'Midnight Task', estimatedDuration: 60 })
      ];

      const result = TaskCalculator.calculateTimes(tasks, '00:00');

      expect(result[0].startTime).toBe('00:00');
      expect(result[0].endTime).toBe('01:00');
    });

    test('should handle multiple tasks crossing midnight', () => {
      const tasks = [
        new Task({ orderId: '001', taskName: 'Task 1', estimatedDuration: 60 }),
        new Task({ orderId: '002', taskName: 'Task 2', estimatedDuration: 90 })
      ];

      const result = TaskCalculator.calculateTimes(tasks, '23:00');

      expect(result[0].startTime).toBe('23:00');
      expect(result[0].endTime).toBe('00:00');

      expect(result[1].startTime).toBe('00:00');
      expect(result[1].endTime).toBe('01:30');
    });
  });

  describe('recalculateTimes', () => {
    test('should recalculate times after task reordering', () => {
      const tasks = [
        new Task({ orderId: '002', taskName: 'Task 2', estimatedDuration: 45 }),
        new Task({ orderId: '001', taskName: 'Task 1', estimatedDuration: 30 })
      ];

      // Initial calculation
      TaskCalculator.calculateTimes(tasks, '09:00');

      // Reorder and recalculate
      const reordered = [tasks[1], tasks[0]];
      const result = TaskCalculator.recalculateTimes(reordered, '09:00');

      expect(result[0].orderId).toBe('001');
      expect(result[0].startTime).toBe('09:00');
      expect(result[0].endTime).toBe('09:30');

      expect(result[1].orderId).toBe('002');
      expect(result[1].startTime).toBe('09:30');
      expect(result[1].endTime).toBe('10:15');
    });
  });
});

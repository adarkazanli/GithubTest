/**
 * Unit Tests: TimeUtils
 *
 * Tests for time utility functions used throughout the application.
 */

import { describe, test, expect } from 'vitest';

// Import the TimeUtils module from source
import * as TimeUtils from '../../../src/utils/TimeUtils.js';

describe('TimeUtils', () => {
  describe('isValidTimeFormat', () => {
    test('should return true for valid HH:MM format', () => {
      expect(TimeUtils.isValidTimeFormat('09:00')).toBe(true);
      expect(TimeUtils.isValidTimeFormat('23:59')).toBe(true);
      expect(TimeUtils.isValidTimeFormat('00:00')).toBe(true);
      expect(TimeUtils.isValidTimeFormat('12:30')).toBe(true);
    });

    test('should return false for invalid formats', () => {
      expect(TimeUtils.isValidTimeFormat('9:00')).toBe(false);   // Single digit hour
      expect(TimeUtils.isValidTimeFormat('09:0')).toBe(false);   // Single digit minute
      expect(TimeUtils.isValidTimeFormat('25:00')).toBe(false);  // Invalid hour
      expect(TimeUtils.isValidTimeFormat('09:60')).toBe(false);  // Invalid minute
      expect(TimeUtils.isValidTimeFormat('abc')).toBe(false);    // Non-numeric
      expect(TimeUtils.isValidTimeFormat('')).toBe(false);       // Empty string
      expect(TimeUtils.isValidTimeFormat(null)).toBe(false);     // Null
    });

    test('should handle edge cases', () => {
      expect(TimeUtils.isValidTimeFormat('24:00')).toBe(false);  // Hour out of range
      expect(TimeUtils.isValidTimeFormat('09-00')).toBe(false);  // Wrong separator
      expect(TimeUtils.isValidTimeFormat('09:00:00')).toBe(false); // Too many segments
    });
  });

  describe('parseTime', () => {
    test('should parse valid HH:MM format into time object', () => {
      const time = TimeUtils.parseTime('09:30');
      expect(time.hours).toBe(9);
      expect(time.minutes).toBe(30);
    });

    test('should handle edge times correctly', () => {
      const midnight = TimeUtils.parseTime('00:00');
      expect(midnight.hours).toBe(0);
      expect(midnight.minutes).toBe(0);

      const beforeMidnight = TimeUtils.parseTime('23:59');
      expect(beforeMidnight.hours).toBe(23);
      expect(beforeMidnight.minutes).toBe(59);
    });

    test('should throw error for invalid input', () => {
      expect(() => TimeUtils.parseTime('invalid')).toThrow();
      expect(() => TimeUtils.parseTime('')).toThrow();
      expect(() => TimeUtils.parseTime('25:00')).toThrow();
    });
  });

  describe('formatTime', () => {
    test('should format time object to HH:MM string', () => {
      expect(TimeUtils.formatTime({ hours: 9, minutes: 30 })).toBe('09:30');
      expect(TimeUtils.formatTime({ hours: 23, minutes: 59 })).toBe('23:59');
      expect(TimeUtils.formatTime({ hours: 0, minutes: 0 })).toBe('00:00');
    });

    test('should pad single digits with zeros', () => {
      expect(TimeUtils.formatTime({ hours: 1, minutes: 5 })).toBe('01:05');
      expect(TimeUtils.formatTime({ hours: 12, minutes: 9 })).toBe('12:09');
    });
  });

  describe('addMinutes', () => {
    test('should add minutes to time correctly', () => {
      const result = TimeUtils.addMinutes('09:00', 30);
      expect(result).toBe('09:30');
    });

    test('should handle hour overflow', () => {
      const result = TimeUtils.addMinutes('09:45', 30);
      expect(result).toBe('10:15');
    });

    test('should handle midnight crossover', () => {
      const result = TimeUtils.addMinutes('23:30', 45);
      expect(result).toBe('00:15');
    });

    test('should handle large durations', () => {
      const result = TimeUtils.addMinutes('09:00', 480); // 8 hours
      expect(result).toBe('17:00');
    });

    test('should handle multiple day crossovers', () => {
      const result = TimeUtils.addMinutes('22:00', 180); // 3 hours
      expect(result).toBe('01:00');
    });
  });
});

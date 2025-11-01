/**
 * Unit tests for TimeUtils
 * Tests time parsing, formatting, and validation functions
 */
import { describe, it, expect } from 'vitest';
import TimeUtils from './TimeUtils.js';

describe('TimeUtils', () => {
  describe('parseToMinutes', () => {
    it('should parse valid HH:MM format to minutes', () => {
      expect(TimeUtils.parseToMinutes('2:30')).toBe(150);
      expect(TimeUtils.parseToMinutes('0:45')).toBe(45);
      expect(TimeUtils.parseToMinutes('10:00')).toBe(600);
      expect(TimeUtils.parseToMinutes('23:59')).toBe(1439);
    });

    it('should handle single-digit hours', () => {
      expect(TimeUtils.parseToMinutes('1:30')).toBe(90);
      expect(TimeUtils.parseToMinutes('9:15')).toBe(555);
    });

    it('should throw error for invalid format', () => {
      expect(() => TimeUtils.parseToMinutes('invalid')).toThrow('Invalid time format');
      expect(() => TimeUtils.parseToMinutes('25:00')).toThrow();
      expect(() => TimeUtils.parseToMinutes('10:60')).toThrow('Invalid time range');
      expect(() => TimeUtils.parseToMinutes('10:5')).toThrow('Invalid time format');
    });

    it('should throw error for null or undefined', () => {
      expect(() => TimeUtils.parseToMinutes(null)).toThrow('Invalid time format');
      expect(() => TimeUtils.parseToMinutes(undefined)).toThrow('Invalid time format');
      expect(() => TimeUtils.parseToMinutes('')).toThrow('Invalid time format');
    });

    it('should throw error for non-string input', () => {
      expect(() => TimeUtils.parseToMinutes(123)).toThrow('Invalid time format');
      expect(() => TimeUtils.parseToMinutes({})).toThrow('Invalid time format');
    });
  });

  describe('formatMinutesToTime', () => {
    it('should format minutes to HH:MM format', () => {
      expect(TimeUtils.formatMinutesToTime(150)).toBe('2:30');
      expect(TimeUtils.formatMinutesToTime(45)).toBe('0:45');
      expect(TimeUtils.formatMinutesToTime(600)).toBe('10:00');
      expect(TimeUtils.formatMinutesToTime(1439)).toBe('23:59');
    });

    it('should handle zero minutes', () => {
      expect(TimeUtils.formatMinutesToTime(0)).toBe('0:00');
    });

    it('should pad minutes with leading zero', () => {
      expect(TimeUtils.formatMinutesToTime(65)).toBe('1:05');
      expect(TimeUtils.formatMinutesToTime(5)).toBe('0:05');
    });

    it('should handle invalid input', () => {
      expect(TimeUtils.formatMinutesToTime(NaN)).toBe('0:00');
      expect(TimeUtils.formatMinutesToTime('invalid')).toBe('0:00');
      expect(TimeUtils.formatMinutesToTime(null)).toBe('0:00');
      expect(TimeUtils.formatMinutesToTime(undefined)).toBe('0:00');
    });
  });

  describe('formatDateToTime', () => {
    it('should format Date object to HH:MM format', () => {
      const date1 = new Date('2025-01-01T09:30:00');
      expect(TimeUtils.formatDateToTime(date1)).toBe('09:30');

      const date2 = new Date('2025-01-01T14:05:00');
      expect(TimeUtils.formatDateToTime(date2)).toBe('14:05');

      const date3 = new Date('2025-01-01T00:00:00');
      expect(TimeUtils.formatDateToTime(date3)).toBe('00:00');
    });

    it('should handle invalid Date objects', () => {
      expect(TimeUtils.formatDateToTime(null)).toBe('00:00');
      expect(TimeUtils.formatDateToTime(undefined)).toBe('00:00');
      expect(TimeUtils.formatDateToTime(new Date('invalid'))).toBe('00:00');
      expect(TimeUtils.formatDateToTime('not a date')).toBe('00:00');
    });
  });

  describe('isValidTimeFormat', () => {
    it('should return true for valid HH:MM format', () => {
      expect(TimeUtils.isValidTimeFormat('2:30')).toBe(true);
      expect(TimeUtils.isValidTimeFormat('0:00')).toBe(true);
      expect(TimeUtils.isValidTimeFormat('23:59')).toBe(true);
      expect(TimeUtils.isValidTimeFormat('10:45')).toBe(true);
    });

    it('should return false for invalid format', () => {
      expect(TimeUtils.isValidTimeFormat('invalid')).toBe(false);
      expect(TimeUtils.isValidTimeFormat('25:00')).toBe(false);
      expect(TimeUtils.isValidTimeFormat('10:60')).toBe(false);
      expect(TimeUtils.isValidTimeFormat('10:5')).toBe(false);
      expect(TimeUtils.isValidTimeFormat('10')).toBe(false);
    });

    it('should return false for null, undefined, or empty string', () => {
      expect(TimeUtils.isValidTimeFormat(null)).toBe(false);
      expect(TimeUtils.isValidTimeFormat(undefined)).toBe(false);
      expect(TimeUtils.isValidTimeFormat('')).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(TimeUtils.isValidTimeFormat(123)).toBe(false);
      expect(TimeUtils.isValidTimeFormat({})).toBe(false);
      expect(TimeUtils.isValidTimeFormat([])).toBe(false);
    });
  });

  describe('round-trip conversion', () => {
    it('should maintain consistency between parse and format', () => {
      const testCases = ['2:30', '0:45', '10:00', '23:59', '1:05'];

      testCases.forEach(timeStr => {
        const minutes = TimeUtils.parseToMinutes(timeStr);
        const formatted = TimeUtils.formatMinutesToTime(minutes);
        expect(formatted).toBe(timeStr);
      });
    });
  });
});

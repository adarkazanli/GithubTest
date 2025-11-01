/**
 * Unit tests for ExcelImporter time format handling
 * Tests conversion between Excel decimal time format and HH:MM text format
 */
import { describe, it, expect } from 'vitest';
import ExcelImporter from '../../../src/services/ExcelImporter.js';

describe('ExcelImporter - Time Format Conversion', () => {
  describe('validateEstimatedTime - Excel decimal format', () => {
    it('should convert Excel decimal 0.0625 to 1:30', () => {
      const result = ExcelImporter.validateEstimatedTime(0.0625);
      expect(result).toBe('1:30');
    });

    it('should convert Excel decimal 0.08333333 to 2:00', () => {
      const result = ExcelImporter.validateEstimatedTime(0.08333333);
      expect(result).toBe('2:00');
    });

    it('should convert Excel decimal 0.03125 to 0:45', () => {
      const result = ExcelImporter.validateEstimatedTime(0.03125);
      expect(result).toBe('0:45');
    });

    it('should convert Excel decimal 0.5 to 12:00 (noon)', () => {
      const result = ExcelImporter.validateEstimatedTime(0.5);
      expect(result).toBe('12:00');
    });

    it('should handle 15 minutes (0.010416666)', () => {
      const result = ExcelImporter.validateEstimatedTime(0.010416666);
      expect(result).toBe('0:15');
    });

    it('should handle 30 minutes (0.020833333)', () => {
      const result = ExcelImporter.validateEstimatedTime(0.020833333);
      expect(result).toBe('0:30');
    });

    it('should handle 3 hours (0.125)', () => {
      const result = ExcelImporter.validateEstimatedTime(0.125);
      expect(result).toBe('3:00');
    });

    it('should handle 10 hours (0.416666666)', () => {
      const result = ExcelImporter.validateEstimatedTime(0.416666666);
      expect(result).toBe('10:00');
    });

    it('should handle 23:45 (0.989583333)', () => {
      const result = ExcelImporter.validateEstimatedTime(0.989583333);
      expect(result).toBe('23:45');
    });
  });

  describe('validateEstimatedTime - Text HH:MM format', () => {
    it('should accept valid HH:MM text format', () => {
      expect(ExcelImporter.validateEstimatedTime('1:30')).toBe('1:30');
      expect(ExcelImporter.validateEstimatedTime('2:00')).toBe('2:00');
      expect(ExcelImporter.validateEstimatedTime('0:45')).toBe('0:45');
      expect(ExcelImporter.validateEstimatedTime('23:59')).toBe('23:59');
    });

    it('should trim whitespace from text input', () => {
      expect(ExcelImporter.validateEstimatedTime('  1:30  ')).toBe('1:30');
      expect(ExcelImporter.validateEstimatedTime(' 2:00 ')).toBe('2:00');
    });

    it('should accept single-digit hours', () => {
      expect(ExcelImporter.validateEstimatedTime('9:15')).toBe('9:15');
      expect(ExcelImporter.validateEstimatedTime('5:00')).toBe('5:00');
      expect(ExcelImporter.validateEstimatedTime('1:05')).toBe('1:05');
    });

    it('should accept double-digit hours', () => {
      expect(ExcelImporter.validateEstimatedTime('10:30')).toBe('10:30');
      expect(ExcelImporter.validateEstimatedTime('23:00')).toBe('23:00');
    });
  });

  describe('validateEstimatedTime - Error handling', () => {
    it('should throw error for null or undefined', () => {
      expect(() => ExcelImporter.validateEstimatedTime(null))
        .toThrow('Missing estimatedTime');
      expect(() => ExcelImporter.validateEstimatedTime(undefined))
        .toThrow('Missing estimatedTime');
    });

    it('should throw error for invalid text format', () => {
      expect(() => ExcelImporter.validateEstimatedTime('invalid'))
        .toThrow('Invalid time format');
      expect(() => ExcelImporter.validateEstimatedTime('25:00'))
        .toThrow('Invalid time format');
      expect(() => ExcelImporter.validateEstimatedTime('10:60'))
        .toThrow('Invalid time format');
      expect(() => ExcelImporter.validateEstimatedTime('10:5'))
        .toThrow('Invalid time format');
    });

    it('should throw error for empty string', () => {
      expect(() => ExcelImporter.validateEstimatedTime(''))
        .toThrow('Invalid time format');
      expect(() => ExcelImporter.validateEstimatedTime('   '))
        .toThrow('Invalid time format');
    });

    it('should throw error for invalid types', () => {
      expect(() => ExcelImporter.validateEstimatedTime({}))
        .toThrow('Invalid estimatedTime type');
      expect(() => ExcelImporter.validateEstimatedTime([]))
        .toThrow('Invalid estimatedTime type');
      expect(() => ExcelImporter.validateEstimatedTime(true))
        .toThrow('Invalid estimatedTime type');
    });
  });

  describe('validateEstimatedTime - Real-world Excel values', () => {
    // These are actual decimal values Excel generates for common times
    it('should handle real Excel time values', () => {
      expect(ExcelImporter.validateEstimatedTime(0.041666666666667)).toBe('1:00'); // 1 hour
      expect(ExcelImporter.validateEstimatedTime(0.083333333333333)).toBe('2:00'); // 2 hours
      expect(ExcelImporter.validateEstimatedTime(0.104166666666667)).toBe('2:30'); // 2.5 hours
      expect(ExcelImporter.validateEstimatedTime(0.166666666666667)).toBe('4:00'); // 4 hours
      expect(ExcelImporter.validateEstimatedTime(0.333333333333333)).toBe('8:00'); // 8 hours (work day)
    });
  });
});

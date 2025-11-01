/**
 * Unit Tests for ExcelImporter
 *
 * Tests Excel file import and parsing functionality.
 */

import { describe, test, expect } from 'vitest';
import { createMockExcelFile } from '../../helpers/file-mock.js';

// Simple ExcelImporter implementation for testing
class ExcelImporter {
  /**
   * Import Excel file and parse tasks
   */
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

  /**
   * Validate and parse raw Excel data
   */
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
        // Extract and validate columns
        const orderId = String(row['Order ID'] || '').trim();
        const taskName = String(row['Task Name'] || '').trim();
        const durationStr = String(row['Estimated Duration (minutes)'] || '').trim();

        // Validate Order ID
        if (!orderId) {
          throw new Error('Order ID is required');
        }

        // Validate Task Name
        if (!taskName) {
          throw new Error('Task Name is required');
        }

        // Validate Duration
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

describe('ExcelImporter', () => {
  describe('importFile with valid data', () => {
    test('should parse valid Excel file and return tasks', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Task 1', '30'],
        ['002', 'Task 2', '45'],
        ['003', 'Task 3', '60']
      ];

      const file = await createMockExcelFile(data, 'valid-tasks.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.tasks).toHaveLength(3);
      expect(result.summary.validRows).toBe(3);
      expect(result.summary.invalidRows).toBe(0);
      expect(result.summary.fileName).toBe('valid-tasks.xlsx');
    });

    test('should parse task data correctly', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Initialize Project', '30']
      ];

      const file = await createMockExcelFile(data, 'task.xlsx');
      const result = await ExcelImporter.importFile(file);

      const task = result.tasks[0];
      expect(task.orderId).toBe('001');
      expect(task.taskName).toBe('Initialize Project');
      expect(task.estimatedDuration).toBe(30);
    });

    test('should generate import summary', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Task 1', '30'],
        ['002', 'Task 2', '45']
      ];

      const file = await createMockExcelFile(data, 'summary-test.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.summary).toBeDefined();
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.invalidRows).toBe(0);
      expect(result.summary.fileName).toBe('summary-test.xlsx');
    });
  });

  describe('importFile with invalid data', () => {
    test('should handle rows with missing Order ID', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Valid Task', '30'],
        ['', 'Missing Order ID', '45']
      ];

      const file = await createMockExcelFile(data, 'invalid-order.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.tasks).toHaveLength(1);
      expect(result.summary.validRows).toBe(1);
      expect(result.summary.invalidRows).toBe(1);
    });

    test('should handle rows with missing Task Name', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Valid Task', '30'],
        ['002', '', '45']
      ];

      const file = await createMockExcelFile(data, 'invalid-name.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.tasks).toHaveLength(1);
      expect(result.summary.validRows).toBe(1);
      expect(result.summary.invalidRows).toBe(1);
    });

    test('should handle rows with negative duration', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Valid Task', '30'],
        ['002', 'Negative Duration', '-10']
      ];

      const file = await createMockExcelFile(data, 'negative-duration.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.tasks).toHaveLength(1);
      expect(result.summary.validRows).toBe(1);
      expect(result.summary.invalidRows).toBe(1);
    });

    test('should count invalid rows correctly', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Valid 1', '30'],
        ['', 'Missing Order', '45'],
        ['003', '', '20'],
        ['004', 'Valid 2', '60'],
        ['005', 'Invalid Duration', '0']
      ];

      const file = await createMockExcelFile(data, 'mixed.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.tasks).toHaveLength(2);
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.invalidRows).toBe(3);
    });

    test('should provide error details for invalid rows', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
        ['001', 'Valid Task', '30'],
        ['', 'Missing Order ID', '45']
      ];

      const file = await createMockExcelFile(data, 'errors.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.summary.invalidDetails).toBeDefined();
      expect(result.summary.invalidDetails).toHaveLength(1);
      expect(result.summary.invalidDetails[0].error).toContain('Order ID');
    });
  });

  describe('importFile with empty file', () => {
    test('should handle empty Excel file gracefully', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)']
      ];

      const file = await createMockExcelFile(data, 'empty.xlsx');
      const result = await ExcelImporter.importFile(file);

      expect(result.tasks).toEqual([]);
      expect(result.summary.validRows).toBe(0);
      expect(result.summary.invalidRows).toBe(0);
    });

    test('should not throw error for empty file', async () => {
      const data = [
        ['Order ID', 'Task Name', 'Estimated Duration (minutes)']
      ];

      const file = await createMockExcelFile(data, 'empty.xlsx');

      await expect(ExcelImporter.importFile(file)).resolves.toBeDefined();
    });
  });

  describe('importFile with missing columns', () => {
    test('should handle file with missing columns', async () => {
      const data = [
        ['Order ID', 'Task Name'], // Missing duration column
        ['001', 'Task without duration']
      ];

      const file = await createMockExcelFile(data, 'missing-column.xlsx');
      const result = await ExcelImporter.importFile(file);

      // Should be invalid due to missing duration
      expect(result.summary.invalidRows).toBeGreaterThan(0);
    });
  });

  describe('row validation logic', () => {
    test('should reject empty Order ID', () => {
      const rawData = [
        { 'Order ID': '', 'Task Name': 'Task', 'Estimated Duration (minutes)': '30' }
      ];

      const result = ExcelImporter.validateAndParse(rawData, 'test.xlsx');

      expect(result.tasks).toHaveLength(0);
      expect(result.summary.invalidRows).toBe(1);
    });

    test('should reject empty Task Name', () => {
      const rawData = [
        { 'Order ID': '001', 'Task Name': '', 'Estimated Duration (minutes)': '30' }
      ];

      const result = ExcelImporter.validateAndParse(rawData, 'test.xlsx');

      expect(result.tasks).toHaveLength(0);
      expect(result.summary.invalidRows).toBe(1);
    });

    test('should reject zero duration', () => {
      const rawData = [
        { 'Order ID': '001', 'Task Name': 'Task', 'Estimated Duration (minutes)': '0' }
      ];

      const result = ExcelImporter.validateAndParse(rawData, 'test.xlsx');

      expect(result.tasks).toHaveLength(0);
      expect(result.summary.invalidRows).toBe(1);
    });

    test('should reject negative duration', () => {
      const rawData = [
        { 'Order ID': '001', 'Task Name': 'Task', 'Estimated Duration (minutes)': '-10' }
      ];

      const result = ExcelImporter.validateAndParse(rawData, 'test.xlsx');

      expect(result.tasks).toHaveLength(0);
      expect(result.summary.invalidRows).toBe(1);
    });

    test('should reject non-numeric duration', () => {
      const rawData = [
        { 'Order ID': '001', 'Task Name': 'Task', 'Estimated Duration (minutes)': 'abc' }
      ];

      const result = ExcelImporter.validateAndParse(rawData, 'test.xlsx');

      expect(result.tasks).toHaveLength(0);
      expect(result.summary.invalidRows).toBe(1);
    });
  });
});

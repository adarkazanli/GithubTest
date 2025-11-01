/**
 * Excel Fixture Generator
 *
 * Generates Excel test fixtures for testing import functionality.
 * Run this file with Node.js to create .xlsx files.
 */

import * as XLSX from 'xlsx';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Sample tasks (10 valid rows)
const sampleTasksData = [
  ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
  ['001', 'Initialize Project', '30'],
  ['002', 'Setup Environment', '45'],
  ['003', 'Write Documentation', '60'],
  ['004', 'Code Review', '90'],
  ['005', 'Testing', '120'],
  ['006', 'Deployment', '30'],
  ['007', 'Monitoring Setup', '45'],
  ['008', 'Performance Optimization', '75'],
  ['009', 'Security Audit', '90'],
  ['010', 'Final Review', '30']
];

// Invalid tasks (5 valid, 5 invalid)
const invalidTasksData = [
  ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
  ['001', 'Valid Task 1', '30'],
  ['', 'Missing Order ID', '45'],           // Invalid: empty Order ID
  ['003', '', '20'],                         // Invalid: empty Task Name
  ['004', 'Negative Duration', '-10'],      // Invalid: negative duration
  ['005', 'Valid Task 2', '60'],
  ['', '', '0'],                             // Invalid: empty Order ID and Task Name
  ['007', 'Valid Task 3', '45'],
  ['008', 'Invalid Zero Duration', '0'],    // Invalid: zero duration
  ['009', 'Valid Task 4', '75'],
  ['010', 'Valid Task 5', '90']
];

// Empty sheet (header only)
const emptySheetData = [
  ['Order ID', 'Task Name', 'Estimated Duration (minutes)']
];

// Large import (100 valid rows)
const largeImportData = [
  ['Order ID', 'Task Name', 'Estimated Duration (minutes)'],
  ...Array.from({ length: 100 }, (_, i) => [
    (i + 1).toString().padStart(3, '0'),
    `Task ${i + 1}`,
    String(Math.floor(Math.random() * 120) + 15)
  ])
];

function generateExcelFile(data, filename) {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const filepath = join(__dirname, filename);

  writeFileSync(filepath, buffer);
  console.log(`✓ Generated: ${filename}`);
}

// Generate all fixture files
console.log('Generating Excel fixtures...');
generateExcelFile(sampleTasksData, 'sample-tasks.xlsx');
generateExcelFile(invalidTasksData, 'invalid-tasks.xlsx');
generateExcelFile(emptySheetData, 'empty-sheet.xlsx');
generateExcelFile(largeImportData, 'large-import.xlsx');
console.log('All Excel fixtures generated successfully!');

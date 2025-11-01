/**
 * Storage State Fixtures
 *
 * Predefined storage states for testing.
 */

import { sampleTasks } from './task-data.js';

export const emptyStorage = {
  tasks: [],
  estimatedStartTime: "09:00",
  importHistory: null,
  version: "1.0"
};

export const populatedStorage = {
  tasks: sampleTasks,
  estimatedStartTime: "09:00",
  importHistory: {
    validRows: 3,
    invalidRows: 0,
    fileName: "sample-tasks.xlsx",
    importDate: "2025-11-01T10:00:00.000Z"
  },
  version: "1.0"
};

export const storageWithCustomStartTime = {
  tasks: sampleTasks,
  estimatedStartTime: "14:30",
  importHistory: null,
  version: "1.0"
};

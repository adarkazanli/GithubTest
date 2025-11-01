/**
 * Data Generators
 *
 * Generates random test data for property-based testing and bulk scenarios.
 */

/**
 * Generates a single task with random or overridden values
 * @param {object} overrides - Fields to override in generated task
 * @returns {object} - Task object matching Task data model
 */
export function generateTask(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    orderId: Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    taskName: `Task ${Math.random().toString(36).substring(7)}`,
    estimatedDuration: Math.floor(Math.random() * 120) + 15, // 15-135 minutes
    startTime: null,
    endTime: null,
    notes: "",
    ...overrides
  };
}

/**
 * Generates multiple tasks
 * @param {number} count - Number of tasks to generate
 * @param {object} overrides - Fields to override in all generated tasks
 * @returns {Array<object>} - Array of task objects
 */
export function generateTasks(count, overrides = {}) {
  return Array.from({ length: count }, (_, i) => generateTask({
    orderId: (i + 1).toString().padStart(3, '0'),
    taskName: `Task ${i + 1}`,
    ...overrides
  }));
}

/**
 * Generates Excel data as 2D array
 * @param {number} rowCount - Number of data rows (excluding header)
 * @returns {Array<Array<string>>} - Excel data with header row
 */
export function generateExcelData(rowCount) {
  const header = ['Order ID', 'Task Name', 'Estimated Duration (minutes)'];
  const rows = Array.from({ length: rowCount }, (_, i) => [
    (i + 1).toString().padStart(3, '0'),
    `Task ${i + 1}`,
    String(Math.floor(Math.random() * 120) + 15)
  ]);
  return [header, ...rows];
}

/**
 * Generates a mock storage state
 * @param {object} options - Configuration options
 * @param {number} options.taskCount - Number of tasks to include
 * @param {string} options.startTime - Estimated start time
 * @param {boolean} options.includeImportHistory - Whether to include import history
 * @returns {object} - Storage state object
 */
export function generateStorageState(options = {}) {
  const {
    taskCount = 0,
    startTime = "09:00",
    includeImportHistory = false
  } = options;

  const tasks = generateTasks(taskCount);

  return {
    tasks,
    estimatedStartTime: startTime,
    importHistory: includeImportHistory ? {
      validRows: taskCount,
      invalidRows: 0,
      fileName: "generated-tasks.xlsx",
      importDate: new Date().toISOString()
    } : null,
    version: "1.0"
  };
}

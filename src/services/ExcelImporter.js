import TimeUtils from '../utils/TimeUtils.js';
import Task from '../models/Task.js';

/**
 * ExcelImporter - Handles Excel file parsing and validation
 * Uses SheetJS for client-side Excel parsing
 */
class ExcelImporter {
  /**
   * Import and parse Excel file
   * @param {File} file - Excel file object
   * @returns {Promise<Object>} Object with tasks array and summary
   */
  static async importFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          // Check if XLSX is available
          if (typeof XLSX === 'undefined') {
            throw new Error('SheetJS library not loaded');
          }

          // Read Excel workbook
          const workbook = XLSX.read(e.target.result, { type: 'binary' });
          
          // Get first sheet
          const sheetName = workbook.SheetNames[0];
          if (!sheetName) {
            throw new Error('Excel file has no sheets');
          }

          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet);

          // Validate and parse data
          const result = this.validateAndParse(rawData, file.name);
          resolve(result);
        } catch (error) {
          console.error('Excel import error:', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsBinaryString(file);
    });
  }

  /**
   * Validate and parse raw data from Excel
   * @param {Array} rawData - Raw data array from Excel
   * @param {string} fileName - Name of the imported file
   * @returns {Object} Object with tasks array and summary
   */
  static validateAndParse(rawData, fileName = 'unknown.xlsx') {
    const tasks = [];
    const validRows = [];
    const invalidRows = [];

    if (!Array.isArray(rawData) || rawData.length === 0) {
      return {
        tasks: [],
        summary: {
          valid: 0,
          invalid: 0,
          fileName: fileName
        }
      };
    }

    rawData.forEach((row, index) => {
      try {
        // Validate required columns
        const orderId = this.validateOrderId(row.orderId || row['order id'] || row['Order ID']);
        const taskName = this.validateTaskName(row.taskName || row['task name'] || row['Task Name']);
        const estimatedTime = this.validateEstimatedTime(row.estimatedTime || row['estimated time'] || row['Estimated Time'] || row['estimated time of completion']);

        // Check for zero duration
        const durationMinutes = TimeUtils.parseToMinutes(estimatedTime);
        if (durationMinutes === 0) {
          throw new Error('Zero duration not allowed');
        }

        // Create task
        const task = new Task({
          orderId,
          taskName,
          estimatedDuration: TimeUtils.parseToMinutes(estimatedTime)
        });
        validRows.push(task);
      } catch (error) {
        invalidRows.push({
          row: index + 1,
          error: error.message,
          data: row
        });
      }
    });

    // Handle duplicate order IDs
    this.deduplicateOrderIds(validRows);

    return {
      tasks: validRows,
      summary: {
        valid: validRows.length,
        invalid: invalidRows.length,
        fileName: fileName,
        invalidDetails: invalidRows
      }
    };
  }

  /**
   * Validate order ID
   * @param {any} orderId - Order ID value
   * @returns {number} Valid order ID
   */
  static validateOrderId(orderId) {
    if (orderId === null || orderId === undefined) {
      throw new Error('Missing orderId');
    }

    const id = parseInt(orderId, 10);
    if (isNaN(id)) {
      throw new Error('Invalid orderId format');
    }

    return id;
  }

  /**
   * Validate task name
   * @param {any} taskName - Task name value
   * @returns {string} Valid task name
   */
  static validateTaskName(taskName) {
    if (!taskName || typeof taskName !== 'string' || taskName.trim().length === 0) {
      throw new Error('Missing taskName');
    }

    return taskName.trim();
  }

  /**
   * Validate estimated time - accepts both Excel time format (decimal) and HH:MM text
   * @param {any} estimatedTime - Time value as Excel decimal (0.0625) or HH:MM string ("1:30")
   * @returns {string} Valid time string in HH:MM format
   */
  static validateEstimatedTime(estimatedTime) {
    if (estimatedTime === null || estimatedTime === undefined) {
      throw new Error('Missing estimatedTime');
    }

    let timeString;

    // Handle Excel time format (decimal number between 0 and 1)
    if (typeof estimatedTime === 'number') {
      // Excel stores time as fraction of a day (e.g., 0.0625 = 1:30)
      // Convert to total minutes first to avoid rounding errors
      const totalMinutes = Math.round(estimatedTime * 24 * 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      // Format as HH:MM
      timeString = `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
    // Handle string format
    else if (typeof estimatedTime === 'string') {
      timeString = estimatedTime.trim();
    }
    // Invalid type
    else {
      throw new Error(`Invalid estimatedTime type: ${typeof estimatedTime}`);
    }

    // Validate the final HH:MM format
    if (!TimeUtils.isValidTimeFormat(timeString)) {
      throw new Error(`Invalid time format: ${timeString}. Expected HH:MM`);
    }

    return timeString;
  }

  /**
   * Handle duplicate order IDs by auto-incrementing
   * @param {Array<Task>} tasks - Array of tasks
   */
  static deduplicateOrderIds(tasks) {
    const seen = new Map();

    tasks.forEach(task => {
      let currentId = task.orderId;
      
      // Increment until we find a unique ID
      while (seen.has(currentId)) {
        currentId++;
      }
      
      task.orderId = currentId;
      seen.set(currentId, true);
    });
  }

  /**
   * Merge new tasks with existing tasks
   * @param {Array<Task>} existingTasks - Existing tasks
   * @param {Array<Task>} newTasks - New tasks to merge
   * @returns {Array<Task>} Merged task array
   */
  static mergeTasks(existingTasks, newTasks) {
    return [...(existingTasks || []), ...(newTasks || [])];
  }
}

export default ExcelImporter;

import { parseTime, formatTime, addMinutes } from '../utils/TimeUtils.js';

/**
 * TaskCalculator - Calculates start and end times for tasks
 * Handles time calculations based on estimated start time and task durations
 */
class TaskCalculator {
  /**
   * Calculate start and end times for all tasks
   * @param {Array<Task>} tasks - Array of tasks in display order
   * @param {string} estimatedStartTime - Start time in HH:MM format (e.g., "09:00")
   * @returns {Array<Task>} Tasks with calculated times
   */
  static calculateTimes(tasks, estimatedStartTime) {
    // Handle null/undefined
    if (!tasks) {
      return tasks;
    }

    // Return empty array as-is
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return tasks;
    }

    // Validate start time format
    parseTime(estimatedStartTime); // Will throw if invalid

    let currentTime = estimatedStartTime;

    // Calculate times for each task
    tasks.forEach(task => {
      const duration = task.estimatedDuration;

      // Set start time to current time
      task.startTime = currentTime;

      // Calculate end time by adding duration
      task.endTime = addMinutes(currentTime, duration);

      // Update current time for next task
      currentTime = task.endTime;
    });

    return tasks;
  }

  /**
   * Recalculate times for tasks after reordering
   * @param {Array<Task>} tasks - Array of tasks
   * @param {string} estimatedStartTime - Start time in HH:MM format
   * @returns {Array<Task>} Tasks with recalculated times
   */
  static recalculateTimes(tasks, estimatedStartTime) {
    return this.calculateTimes(tasks, estimatedStartTime);
  }
}

// Export for ES module compatibility
export default TaskCalculator;


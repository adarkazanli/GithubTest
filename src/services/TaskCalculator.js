/**
 * TaskCalculator - Calculates start and end times for tasks
 * Handles time calculations based on estimated start time and task durations
 */
class TaskCalculator {
  /**
   * Calculate start and end times for all tasks
   * @param {Array<Task>} tasks - Array of tasks in display order
   * @param {string} estimatedStartTime - Start time in HH:MM format
   * @returns {Array<Task>} Tasks with calculated times
   */
  static calculateTimes(tasks, estimatedStartTime) {
    if (!Array.isArray(tasks) || tasks.length === 0) {
      return tasks;
    }

    if (typeof TimeUtils === 'undefined') {
      throw new Error('TimeUtils not loaded');
    }

    // Parse estimated start time to minutes
    const startMinutes = TimeUtils.parseToMinutes(estimatedStartTime);
    
    // Create start date (use today with the specified time)
    const startDate = new Date();
    startDate.setHours(Math.floor(startMinutes / 60));
    startDate.setMinutes(startMinutes % 60);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    let currentTime = new Date(startDate);

    // Calculate times for each task
    tasks.forEach(task => {
      const duration = task.getDurationInMinutes();
      const taskStartTime = new Date(currentTime);
      
      // Calculate end time
      const taskEndTime = new Date(currentTime);
      taskEndTime.setMinutes(taskEndTime.getMinutes() + duration);
      
      // Set calculated times
      task.setCalculatedTimes(taskStartTime, taskEndTime);
      
      // Update current time for next task
      currentTime = new Date(taskEndTime);
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

  /**
   * Validate that all task times are valid
   * @param {Array<Task>} tasks - Array of tasks
   * @returns {boolean} True if all times are valid
   */
  static validateTimes(tasks) {
    if (!Array.isArray(tasks)) {
      return false;
    }

    return tasks.every(task => task.hasValidTimes());
  }
}


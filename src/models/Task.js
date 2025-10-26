/**
 * Task Model - Represents a single work item
 * @property {string} id - Unique identifier
 * @property {number} orderId - Original order from Excel
 * @property {string} taskName - Task name/description
 * @property {string} estimatedDuration - Duration in HH:MM format
 * @property {string} notes - User-entered notes
 * @property {Date} calculatedStartTime - Calculated start time
 * @property {Date} calculatedEndTime - Calculated end time
 */
class Task {
  /**
   * Create a new Task instance
   * @param {number} orderId - Original order ID from Excel
   * @param {string} taskName - Task name
   * @param {string} estimatedDuration - Duration in HH:MM format
   */
  constructor(orderId, taskName, estimatedDuration) {
    this.id = this.generateId();
    this.orderId = orderId;
    this.taskName = taskName || 'Unnamed Task';
    this.estimatedDuration = estimatedDuration || '0:00';
    this.notes = '';
    this.calculatedStartTime = null;
    this.calculatedEndTime = null;
  }

  /**
   * Generate unique ID for the task
   * @returns {string} Unique identifier
   */
  generateId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get duration in minutes
   * @returns {number} Duration in minutes
   * @throws {Error} If duration format is invalid
   */
  getDurationInMinutes() {
    if (typeof TimeUtils === 'undefined') {
      throw new Error('TimeUtils not loaded');
    }
    return TimeUtils.parseToMinutes(this.estimatedDuration);
  }

  /**
   * Set calculated start and end times
   * @param {Date} startTime - Start time
   * @param {Date} endTime - End time
   */
  setCalculatedTimes(startTime, endTime) {
    this.calculatedStartTime = startTime;
    this.calculatedEndTime = endTime;
  }

  /**
   * Set notes for the task
   * @param {string} notes - Notes text
   */
  setNotes(notes) {
    this.notes = notes || '';
  }

  /**
   * Check if the task has valid calculated times
   * @returns {boolean} True if both start and end times are set
   */
  hasValidTimes() {
    return this.calculatedStartTime instanceof Date && 
           this.calculatedEndTime instanceof Date &&
           !isNaN(this.calculatedStartTime.getTime()) &&
           !isNaN(this.calculatedEndTime.getTime());
  }

  /**
   * Get formatted start time
   * @returns {string} Start time in HH:MM format
   */
  getFormattedStartTime() {
    if (typeof TimeUtils === 'undefined' || !this.hasValidTimes()) {
      return '00:00';
    }
    return TimeUtils.formatDateToTime(this.calculatedStartTime);
  }

  /**
   * Get formatted end time
   * @returns {string} End time in HH:MM format
   */
  getFormattedEndTime() {
    if (typeof TimeUtils === 'undefined' || !this.hasValidTimes()) {
      return '00:00';
    }
    return TimeUtils.formatDateToTime(this.calculatedEndTime);
  }
}


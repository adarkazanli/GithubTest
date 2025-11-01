/**
 * Task Model - Represents a single work item
 * @property {string} id - Unique identifier
 * @property {string} orderId - Original order from Excel
 * @property {string} taskName - Task name/description
 * @property {number} estimatedDuration - Duration in minutes
 * @property {string|null} startTime - Start time in HH:MM format
 * @property {string|null} endTime - End time in HH:MM format
 * @property {string} notes - User-entered notes
 */
class Task {
  /**
   * Create a new Task instance
   * @param {Object} data - Task data
   * @param {string} [data.id] - Unique identifier (auto-generated if not provided)
   * @param {string} data.orderId - Original order ID from Excel
   * @param {string} data.taskName - Task name
   * @param {number} data.estimatedDuration - Duration in minutes
   * @param {string|null} [data.startTime=null] - Start time in HH:MM format
   * @param {string|null} [data.endTime=null] - End time in HH:MM format
   * @param {string} [data.notes=''] - User-entered notes
   */
  constructor(data) {
    this.id = data.id || this.generateId();
    this.orderId = data.orderId;
    this.taskName = data.taskName;
    this.estimatedDuration = data.estimatedDuration;
    this.startTime = data.startTime ?? null;
    this.endTime = data.endTime ?? null;
    this.notes = data.notes || '';
  }

  /**
   * Generate unique ID for the task
   * @returns {string} Unique identifier
   */
  generateId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `task-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Validate task data
   * @returns {boolean} True if valid
   * @throws {Error} If validation fails
   */
  validate() {
    if (!this.orderId || this.orderId.trim() === '') {
      throw new Error('Order ID is required');
    }
    if (!this.taskName || this.taskName.trim() === '') {
      throw new Error('Task Name is required');
    }
    if (typeof this.estimatedDuration !== 'number' || isNaN(this.estimatedDuration)) {
      throw new Error('Estimated Duration must be a number');
    }
    if (this.estimatedDuration <= 0) {
      throw new Error('Estimated Duration must be greater than 0');
    }
    return true;
  }

  /**
   * Serialize task to plain object
   * @returns {Object} Plain object representation
   */
  toJSON() {
    return {
      id: this.id,
      orderId: this.orderId,
      taskName: this.taskName,
      estimatedDuration: this.estimatedDuration,
      startTime: this.startTime,
      endTime: this.endTime,
      notes: this.notes
    };
  }

  /**
   * Create Task instance from plain object
   * @param {Object} data - Plain object data
   * @returns {Task} New Task instance
   */
  static fromJSON(data) {
    return new Task(data);
  }

  /**
   * Create a deep copy of the task
   * @returns {Task} Cloned task instance
   */
  clone() {
    return new Task({
      id: this.id,
      orderId: this.orderId,
      taskName: this.taskName,
      estimatedDuration: this.estimatedDuration,
      startTime: this.startTime,
      endTime: this.endTime,
      notes: this.notes
    });
  }

  /**
   * Set notes for the task
   * @param {string} notes - Notes text
   */
  setNotes(notes) {
    this.notes = notes || '';
  }

  /**
   * Get formatted start time
   * @returns {string} Formatted start time or '--:--' if not set
   */
  getFormattedStartTime() {
    return this.startTime || '--:--';
  }

  /**
   * Get formatted end time
   * @returns {string} Formatted end time or '--:--' if not set
   */
  getFormattedEndTime() {
    return this.endTime || '--:--';
  }
}

// Export for ES module compatibility
export default Task;


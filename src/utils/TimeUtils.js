/**
 * TimeUtils - Utility functions for time parsing and formatting
 * Handles HH:MM format parsing and manipulation
 */
class TimeUtils {
  /**
   * Parse HH:MM format string to total minutes
   * @param {string} timeStr - Time string in HH:MM format (e.g., "2:30")
   * @returns {number} Total minutes
   * @throws {Error} If format is invalid
   */
  static parseToMinutes(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
      throw new Error('Invalid time format');
    }
    
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      throw new Error(`Invalid time format: ${timeStr}. Expected HH:MM`);
    }
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    if (hours < 0 || minutes < 0 || minutes >= 60) {
      throw new Error(`Invalid time range: ${timeStr}`);
    }
    
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to HH:MM format string
   * @param {number} minutes - Total minutes
   * @returns {string} Time string in HH:MM format
   */
  static formatMinutesToTime(minutes) {
    if (typeof minutes !== 'number' || isNaN(minutes)) {
      return '0:00';
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Format Date object to HH:MM string
   * @param {Date} date - Date object
   * @returns {string} Time string in HH:MM format
   */
  static formatDateToTime(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return '00:00';
    }
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Validate HH:MM time format (strict - requires 2-digit format)
   * @param {string} timeStr - Time string to validate
   * @returns {boolean} True if valid format
   */
  static isValidTimeFormat(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
      return false;
    }

    // Strict validation: must be exactly HH:MM format (2 digits for both)
    const match = timeStr.match(/^(\d{2}):(\d{2})$/);
    if (!match) {
      return false;
    }

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    return hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60;
  }

  /**
   * Parse HH:MM format string to time object
   * @param {string} timeStr - Time string in HH:MM format
   * @returns {{hours: number, minutes: number}} Time object
   * @throws {Error} If format is invalid
   */
  static parseTime(timeStr) {
    if (!TimeUtils.isValidTimeFormat(timeStr)) {
      throw new Error(`Invalid time format: ${timeStr}`);
    }

    const [hours, minutes] = timeStr.split(':').map(s => parseInt(s, 10));
    return { hours, minutes };
  }

  /**
   * Format time object to HH:MM string
   * @param {{hours: number, minutes: number}} timeObj - Time object
   * @returns {string} Time string in HH:MM format
   */
  static formatTime(timeObj) {
    const hours = String(timeObj.hours).padStart(2, '0');
    const minutes = String(timeObj.minutes).padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * Add minutes to a time string
   * @param {string} timeStr - Time string in HH:MM format
   * @param {number} minutesToAdd - Minutes to add
   * @returns {string} New time string in HH:MM format
   */
  static addMinutes(timeStr, minutesToAdd) {
    const { hours, minutes } = TimeUtils.parseTime(timeStr);

    // Convert to total minutes
    let totalMinutes = hours * 60 + minutes + minutesToAdd;

    // Handle day wraparound (24-hour format)
    totalMinutes = totalMinutes % (24 * 60);
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60;
    }

    // Convert back to hours and minutes
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return TimeUtils.formatTime({ hours: newHours, minutes: newMinutes });
  }
}

// Export functions for ES module compatibility
export const isValidTimeFormat = TimeUtils.isValidTimeFormat.bind(TimeUtils);
export const parseTime = TimeUtils.parseTime.bind(TimeUtils);
export const formatTime = TimeUtils.formatTime.bind(TimeUtils);
export const addMinutes = TimeUtils.addMinutes.bind(TimeUtils);
export const parseToMinutes = TimeUtils.parseToMinutes.bind(TimeUtils);
export const formatMinutesToTime = TimeUtils.formatMinutesToTime.bind(TimeUtils);
export const formatDateToTime = TimeUtils.formatDateToTime.bind(TimeUtils);

// Also export the class for backward compatibility
export default TimeUtils;


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
   * Validate HH:MM time format
   * @param {string} timeStr - Time string to validate
   * @returns {boolean} True if valid format
   */
  static isValidTimeFormat(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') {
      return false;
    }
    
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) {
      return false;
    }
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    return hours >= 0 && minutes >= 0 && minutes < 60;
  }
}


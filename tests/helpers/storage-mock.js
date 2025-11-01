/**
 * StorageMock - localStorage-compatible mock for testing
 *
 * Provides a localStorage-compatible interface for testing storage-dependent code
 * in Node.js environment without requiring a real browser.
 */
export class StorageMock {
  constructor() {
    this.store = {};
  }

  /**
   * Retrieves a value from storage
   * @param {string} key - Storage key
   * @returns {string | null} - Stored value or null if not found
   */
  getItem(key) {
    return this.store[key] || null;
  }

  /**
   * Stores a value in storage
   * @param {string} key - Storage key
   * @param {string} value - Value to store (will be converted to string)
   */
  setItem(key, value) {
    this.store[key] = String(value);
  }

  /**
   * Removes a value from storage
   * @param {string} key - Storage key to remove
   */
  removeItem(key) {
    delete this.store[key];
  }

  /**
   * Clears all values from storage
   */
  clear() {
    this.store = {};
  }

  /**
   * Gets the number of items in storage
   * @returns {number} - Count of stored items
   */
  get length() {
    return Object.keys(this.store).length;
  }

  /**
   * Gets the key at the specified index
   * @param {number} index - Index position
   * @returns {string | null} - Key at index or null if out of bounds
   */
  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] !== undefined ? keys[index] : null;
  }
}

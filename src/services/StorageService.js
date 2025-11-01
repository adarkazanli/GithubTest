import Task from '../models/Task.js';

/**
 * StorageService - Manages IndexedDB and localStorage
 * Handles task persistence and schedule settings
 */
class StorageService {
  constructor() {
    this.db = null;
    this.dbName = 'taskSchedulerDB';
    this.version = 1;
  }

  /**
   * Initialize the database
   * @returns {Promise<void>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create tasks object store if it doesn't exist
        if (!db.objectStoreNames.contains('tasks')) {
          const objectStore = db.createObjectStore('tasks', { keyPath: 'id' });
          objectStore.createIndex('orderId', 'orderId', { unique: false });
        }
      };
    });
  }

  /**
   * Save tasks to IndexedDB
   * @param {Array<Task>} tasks - Array of task objects
   * @returns {Promise<void>}
   */
  async saveTasks(tasks) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tx = this.db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');

    // Clear existing tasks
    await store.clear();

    // Add new tasks
    const tasksPromises = tasks.map(task => store.add(task));
    await Promise.all(tasksPromises);

    // Update task order in localStorage
    localStorage.setItem('taskOrder', JSON.stringify(tasks.map(t => t.id)));
  }

  /**
   * Get all tasks from IndexedDB
   * @returns {Promise<Array<Task>>}
   */
  async getTasks() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const taskOrder = JSON.parse(localStorage.getItem('taskOrder') || '[]');
    const tx = this.db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');

    const tasks = [];
    for (const id of taskOrder) {
      const request = store.get(id);
      const taskData = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
      
      if (taskData) {
        // Reconstruct as Task instance
        const task = new Task({
          id: taskData.id,
          orderId: taskData.orderId,
          taskName: taskData.taskName,
          estimatedDuration: taskData.estimatedDuration,
          notes: taskData.notes || '',
          startTime: taskData.startTime,
          endTime: taskData.endTime
        });
        task.calculatedStartTime = taskData.calculatedStartTime ? new Date(taskData.calculatedStartTime) : null;
        task.calculatedEndTime = taskData.calculatedEndTime ? new Date(taskData.calculatedEndTime) : null;
        tasks.push(task);
      }
    }

    return tasks;
  }

  /**
   * Update a single task
   * @param {Task} task - Task to update
   * @returns {Promise<void>}
   */
  async updateTask(task) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tx = this.db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.put(task);
  }

  /**
   * Clear all tasks
   * @returns {Promise<void>}
   */
  async clearTasks() {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const tx = this.db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    await store.clear();
    localStorage.setItem('taskOrder', '[]');
  }

  /**
   * Get estimated start time from localStorage
   * @returns {string} Estimated start time in HH:MM format
   */
  getEstimatedStartTime() {
    return localStorage.getItem('estimatedStartTime') || '09:00';
  }

  /**
   * Set estimated start time in localStorage
   * @param {string} time - Time in HH:MM format
   */
  setEstimatedStartTime(time) {
    localStorage.setItem('estimatedStartTime', time);
  }

  /**
   * Get import history
   * @returns {Object|null} Import history object
   */
  getImportHistory() {
    const history = localStorage.getItem('importHistory');
    return history ? JSON.parse(history) : null;
  }

  /**
   * Set import history
   * @param {Object} history - Import history object
   */
  setImportHistory(history) {
    localStorage.setItem('importHistory', JSON.stringify(history));
  }

  /**
   * Get task order
   * @returns {Array<string>} Array of task IDs
   */
  getTaskOrder() {
    return JSON.parse(localStorage.getItem('taskOrder') || '[]');
  }

  /**
   * Set task order
   * @param {Array<string>} order - Array of task IDs
   */
  setTaskOrder(order) {
    localStorage.setItem('taskOrder', JSON.stringify(order));
  }

  /**
   * Reset all application data
   * Clears IndexedDB tasks and all localStorage entries
   * @returns {Promise<Object>} Result object with success status and errors
   * @example
   * const result = await storageService.resetAll();
   * if (result.success) {
   *   console.log('Reset complete');
   * } else {
   *   console.error('Errors:', result.errors);
   * }
   */
  async resetAll() {
    const errors = [];
    const cleared = { indexedDB: false, localStorage: false };

    // Clear IndexedDB tasks
    try {
      if (!this.db) {
        throw new Error('Database not initialized');
      }

      const tx = this.db.transaction('tasks', 'readwrite');
      const store = tx.objectStore('tasks');
      await store.clear();

      // Wait for transaction to complete
      await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
      });

      cleared.indexedDB = true;
    } catch (err) {
      errors.push(`IndexedDB: ${err.message}`);
    }

    // Clear localStorage keys
    try {
      localStorage.removeItem('taskOrder');
      localStorage.removeItem('estimatedStartTime');
      localStorage.removeItem('importHistory');
      cleared.localStorage = true;
    } catch (err) {
      errors.push(`localStorage: ${err.message}`);
    }

    return {
      success: errors.length === 0,
      errors,
      cleared
    };
  }
}

export default StorageService;


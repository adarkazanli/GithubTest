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
      const task = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(null);
      });
      if (task) tasks.push(task);
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
}


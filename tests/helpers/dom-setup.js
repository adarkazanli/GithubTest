/**
 * DOM Setup Helpers
 *
 * Manages DOM environment setup and teardown for integration tests.
 */

/**
 * Sets up basic DOM structure matching index.html
 * Creates necessary elements: import-panel, task-list, reset-button, etc.
 */
export function setupDOM() {
  // Clear existing DOM
  cleanupDOM();

  // Create main container structure
  document.body.innerHTML = `
    <!-- Import Panel -->
    <section id="import-panel">
      <h1>Task Scheduler</h1>
      <div class="import-controls">
        <input type="file" id="excel-file" accept=".xlsx" />
        <button id="import-btn">Import Excel</button>
        <button id="reset-button" type="button" class="btn-reset" aria-label="Clear all application data">Reset All Data</button>
      </div>
      <div id="import-summary"></div>
      <div id="reset-messages" class="message-container" aria-live="polite"></div>
    </section>

    <!-- Schedule Controls -->
    <section id="schedule-controls">
      <label for="estimated-start-time">Estimated Start Time:</label>
      <input type="text" id="estimated-start-time" value="09:00" pattern="\\d{2}:\\d{2}" placeholder="HH:MM" />
      <button id="update-time-btn">Update Times</button>
    </section>

    <!-- Task List -->
    <section id="task-list">
      <!-- Tasks will be rendered here dynamically -->
    </section>

    <!-- Confirmation Dialog -->
    <div id="reset-dialog" class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" hidden>
      <div class="dialog-backdrop"></div>
      <div class="dialog-content">
        <h2 id="dialog-title">Confirm Reset</h2>
        <p class="dialog-message">
          This will permanently delete all your task data and cannot be undone.
          Are you sure you want to continue?
        </p>
        <div class="dialog-actions">
          <button type="button" class="btn-secondary" id="dialog-cancel">Cancel</button>
          <button type="button" class="btn-danger" id="dialog-confirm">Delete All Data</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Removes all created DOM elements and resets document.body
 */
export function cleanupDOM() {
  document.body.innerHTML = '';
}

/**
 * Creates a mock DOM element with attributes and content
 * @param {string} tagName - HTML tag name (e.g., "div", "button")
 * @param {object} attributes - Key-value pairs of attributes (e.g., { id: "test", class: "btn" })
 * @param {string} innerHTML - Inner HTML content
 * @returns {HTMLElement} - Created element
 */
export function createMockElement(tagName, attributes = {}, innerHTML = '') {
  const element = document.createElement(tagName);

  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  // Set innerHTML
  if (innerHTML) {
    element.innerHTML = innerHTML;
  }

  return element;
}

/**
 * Simulates a click event on an element
 * @param {HTMLElement} element - Target element
 */
export function simulateClick(element) {
  const event = new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  });
  element.dispatchEvent(event);
}

/**
 * Simulates a file input change event
 * @param {HTMLInputElement} input - File input element
 * @param {File} file - Mock file to attach
 */
export function simulateFileInput(input, file) {
  // Create a DataTransfer to hold the file
  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  // Set the files property
  Object.defineProperty(input, 'files', {
    value: dataTransfer.files,
    writable: false
  });

  // Dispatch change event
  const event = new Event('change', {
    bubbles: true,
    cancelable: true
  });
  input.dispatchEvent(event);
}

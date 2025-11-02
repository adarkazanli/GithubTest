/**
 * Main Application - Task Scheduler
 * Orchestrates all components and handles user interactions
 */

import StorageService from './services/StorageService.js';
import ExcelImporter from './services/ExcelImporter.js';
import TaskCalculator from './services/TaskCalculator.js';
import ResetButton from './components/ResetButton.js';
import TimeUtils from './utils/TimeUtils.js';

let storageService;
let currentTasks = [];
let dragSource = null;
let resetButton;

// Initialize application on load
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM loaded, initializing app...');
  try {
    await init();
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    alert('App initialization failed: ' + error.message);
  }
});

/**
 * Initialize the application
 */
async function init() {
  try {
    // Initialize storage service
    storageService = new StorageService();
    await storageService.init();

    // Load existing tasks
    currentTasks = await storageService.getTasks();

    // Setup event listeners
    setupEventListeners();

    // Initialize ResetButton
    if (typeof ResetButton !== 'undefined') {
      resetButton = new ResetButton(storageService, {
        onResetComplete: () => {
          // Clear current tasks array
          currentTasks = [];

          // Show empty state
          showEmptyState();

          // Clear import summary
          const importSummary = document.getElementById('import-summary');
          if (importSummary) {
            importSummary.innerHTML = '';
          }

          console.log('Reset complete - all data cleared');
        },
        onResetError: (errors) => {
          console.error('Reset errors:', errors);
        },
        isImportInProgress: () => {
          return document.body.classList.contains('loading');
        }
      });

      resetButton.init();
    }

    // Initial render
    if (currentTasks.length > 0) {
      const estimatedStartTime = storageService.getEstimatedStartTime();
      TaskCalculator.calculateTimes(currentTasks, estimatedStartTime);
      renderTasks();
    } else {
      showEmptyState();
    }

    console.log('Task Scheduler initialized');
  } catch (error) {
    console.error('Initialization error:', error);
    alert('Failed to initialize application: ' + error.message);
  }
}

/**
 * Attach UI event handlers for file import and estimated-start-time controls.
 *
 * Binds handlers to the following elements (if present):
 * - "excel-file": listens for changes and invokes `handleFileImport`.
 * - "import-btn": clicks the file input to start an import.
 * - "estimated-start-time": listens for changes and invokes `handleStartTimeChange`.
 * - "update-time-btn": invokes `handleStartTimeChange` on click.
 * - "set-to-now-btn": invokes `handleSetToNowClick` on click.
 *
 * The function logs successful attachments and reports missing elements via console errors.
 */
function setupEventListeners() {
  console.log('Setting up event listeners...');

  // Excel file input
  const excelFileInput = document.getElementById('excel-file');
  if (excelFileInput) {
    excelFileInput.addEventListener('change', handleFileImport);
    console.log('✓ File input listener attached');
  } else {
    console.error('✗ File input element not found');
  }

  // Import button
  const importBtn = document.getElementById('import-btn');
  if (importBtn) {
    importBtn.addEventListener('click', () => {
      console.log('Import button clicked');
      excelFileInput.click();
    });
    console.log('✓ Import button listener attached');
  } else {
    console.error('✗ Import button element not found');
  }

  // Estimated start time input
  const startTimeInput = document.getElementById('estimated-start-time');
  if (startTimeInput) {
    startTimeInput.addEventListener('change', handleStartTimeChange);
  }

  // Update time button
  const updateTimeBtn = document.getElementById('update-time-btn');
  if (updateTimeBtn) {
    updateTimeBtn.addEventListener('click', handleStartTimeChange);
  }

  // Set to Now button
  const setToNowBtn = document.getElementById('set-to-now-btn');
  if (setToNowBtn) {
    setToNowBtn.addEventListener('click', handleSetToNowClick);
    console.log('✓ Set to Now button listener attached');
  } else {
    console.error('✗ Set to Now button element not found');
  }
}

/**
 * Handle Excel file import
 */
async function handleFileImport(event) {
  console.log('handleFileImport called');
  const file = event.target.files[0];
  if (!file) {
    console.log('No file selected');
    return;
  }

  console.log(`Processing file: ${file.name}`);

  try {
    showLoadingState(true);

    // Import Excel file
    console.log('Calling ExcelImporter.importFile...');
    const result = await ExcelImporter.importFile(file);
    console.log('Import result:', result);

    // Merge with existing tasks
    currentTasks = [...currentTasks, ...result.tasks];

    // Save to storage
    await storageService.saveTasks(currentTasks);

    // Save import history
    storageService.setImportHistory({
      validRows: result.summary.valid,
      invalidRows: result.summary.invalid,
      fileName: result.summary.fileName,
      importDate: new Date().toISOString()
    });

    // Show import summary
    showImportSummary(result.summary);

    // Recalculate and render
    recalculateAndRender();

    // Clear file input
    event.target.value = '';

    console.log(`Imported ${result.summary.valid} valid tasks`);
  } catch (error) {
    console.error('Import error:', error);
    alert('Import failed: ' + error.message);
  } finally {
    showLoadingState(false);
  }
}

/**
 * Apply the value from the estimated-start-time input as the new estimated start time.
 *
 * If the input is a valid `HH:MM` time, updates the stored estimated start time and triggers recalculation and re-rendering.
 * If the input is invalid, shows an alert and restores the input to the previously stored value.
 */
function handleStartTimeChange() {
  const newTime = document.getElementById('estimated-start-time').value;

  if (!TimeUtils.isValidTimeFormat(newTime)) {
    alert('Invalid time format. Use HH:MM (e.g., 09:00)');
    document.getElementById('estimated-start-time').value = storageService.getEstimatedStartTime();
    return;
  }

  storageService.setEstimatedStartTime(newTime);
  recalculateAndRender();
}

/**
 * Set the estimated start time input to the current system time and apply the change.
 *
 * If an import is in progress (document body has class "loading"), the function returns without modifying state.
 */
function handleSetToNowClick() {
  // Check if import operation is in progress
  if (document.body.classList.contains('loading')) {
    return; // Silently ignore if import in progress
  }

  // Get current time
  const now = new Date();
  const formattedTime = TimeUtils.formatDateToTime(now);

  // Update the input field
  const startTimeInput = document.getElementById('estimated-start-time');
  if (startTimeInput) {
    startTimeInput.value = formattedTime;
  }

  // Trigger the existing time change handler
  handleStartTimeChange();
}

/**
 * Recalculate times and render tasks
 */
function recalculateAndRender() {
  if (currentTasks.length === 0) {
    showEmptyState();
    return;
  }

  const estimatedStartTime = storageService.getEstimatedStartTime();
  TaskCalculator.calculateTimes(currentTasks, estimatedStartTime);
  
  // Update storage with new times
  storageService.saveTasks(currentTasks);
  
  renderTasks();
}

/**
 * Render tasks to the UI
 */
function renderTasks() {
  const container = document.getElementById('task-list');
  if (!container) return;

  if (currentTasks.length === 0) {
    showEmptyState();
    return;
  }

  container.innerHTML = currentTasks.map(task => {
    const start = task.getFormattedStartTime();
    const end = task.getFormattedEndTime();
    
    return `
      <div class="task-item" draggable="true" data-id="${task.id}">
        <div class="task-content">
          <div class="task-order-id">${task.orderId}</div>
          <div class="task-name">${task.taskName}</div>
          <div class="task-duration">${task.estimatedDuration}</div>
          <div class="task-time">${start} - ${end}</div>
          <div class="task-notes">
            <textarea 
              class="notes-input" 
              placeholder="Notes..."
              data-task-id="${task.id}"
            >${task.notes}</textarea>
          </div>
        </div>
      </div>
    `;
  }).join('');

  setupDragAndDrop();
  setupNotesHandlers();
}

/**
 * Setup drag and drop functionality
 */
function setupDragAndDrop() {
  const taskItems = document.querySelectorAll('.task-item');
  taskItems.forEach(item => {
    // Desktop drag events
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragleave', handleDragLeave);

    // Mobile touch events
    item.addEventListener('touchstart', handleTouchStart);
    item.addEventListener('touchmove', handleTouchMove);
    item.addEventListener('touchend', handleTouchEnd);
  });
}

/**
 * Handle drag start
 */
function handleDragStart(event) {
  const taskItem = event.target.closest('.task-item');
  if (!taskItem) return;
  
  dragSource = taskItem;
  taskItem.classList.add('dragging');
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/plain', taskItem.dataset.id);
}

/**
 * Handle drag end
 */
function handleDragEnd(event) {
  const taskItem = event.target.closest('.task-item');
  if (!taskItem) return;
  
  taskItem.classList.remove('dragging');
  document.querySelectorAll('.task-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

/**
 * Handle drag over
 */
function handleDragOver(event) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
  
  const targetItem = event.target.closest('.task-item');
  if (targetItem && targetItem !== dragSource) {
    targetItem.classList.add('drag-over');
  }
}

/**
 * Handle drag leave
 */
function handleDragLeave(event) {
  const targetItem = event.target.closest('.task-item');
  if (targetItem) {
    targetItem.classList.remove('drag-over');
  }
}

/**
 * Handle drop
 */
async function handleDrop(event) {
  event.preventDefault();
  
  const sourceId = event.dataTransfer.getData('text/plain') || event.dataTransfer.getData('text/html');
  const targetItem = event.target.closest('.task-item');
  
  if (!targetItem || !sourceId) {
    return;
  }

  const targetId = targetItem.dataset.id;

  if (sourceId !== targetId) {
    await reorderTasks(sourceId, targetId);
  }

  // Clean up
  document.querySelectorAll('.task-item').forEach(item => {
    item.classList.remove('drag-over', 'dragging');
  });
  
  dragSource = null;
}

/**
 * Reorder tasks
 */
async function reorderTasks(sourceId, targetId) {
  const sourceIndex = currentTasks.findIndex(t => t.id === sourceId);
  const targetIndex = currentTasks.findIndex(t => t.id === targetId);

  if (sourceIndex === -1 || targetIndex === -1) {
    return;
  }

  // Remove source from array
  const [movedTask] = currentTasks.splice(sourceIndex, 1);
  
  // Insert at target position
  currentTasks.splice(targetIndex, 0, movedTask);

  // Save new order
  await storageService.saveTasks(currentTasks);

  // Recalculate times
  recalculateAndRender();
}

/**
 * Setup notes handlers
 */
function setupNotesHandlers() {
  document.querySelectorAll('.notes-input').forEach(input => {
    input.addEventListener('blur', async (event) => {
      const taskId = event.target.dataset.taskId;
      const notes = event.target.value;

      // Update task in memory
      const task = currentTasks.find(t => t.id === taskId);
      if (task) {
        task.setNotes(notes);
        
        // Update in storage
        await storageService.updateTask(task);
        
        console.log('Notes saved for task:', task.taskName);
      }
    });
  });
}

/**
 * Show import summary
 */
function showImportSummary(summary) {
  const div = document.getElementById('import-summary');
  if (!div) return;

  if (summary.invalid > 0) {
    div.innerHTML = `
      <strong>Import Complete:</strong><br>
      ✓ ${summary.valid} valid tasks imported<br>
      ✗ ${summary.invalid} invalid rows skipped
    `;
  } else {
    div.innerHTML = `
      <strong>Import Complete:</strong><br>
      ✓ ${summary.valid} valid tasks imported
    `;
  }

  // Clear message after 5 seconds
  setTimeout(() => {
    div.innerHTML = '';
  }, 5000);
}

/**
 * Toggle the application's loading state in the UI.
 * When enabled, adds the `loading` class to the document body and disables the Set-to-Now button (id `set-to-now-btn`) if present; when disabled, removes the class and re-enables the button.
 * @param {boolean} loading - `true` to enable loading state, `false` to disable it.
 */
function showLoadingState(loading) {
  const body = document.body;
  const setToNowBtn = document.getElementById('set-to-now-btn');

  if (loading) {
    body.classList.add('loading');
    if (setToNowBtn) {
      setToNowBtn.disabled = true;
    }
  } else {
    body.classList.remove('loading');
    if (setToNowBtn) {
      setToNowBtn.disabled = false;
    }
  }
}

/**
 * Show empty state
 */
function showEmptyState() {
  const container = document.getElementById('task-list');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <h2>No tasks yet</h2>
      <p>Import an Excel file to get started</p>
    </div>
  `;
}

/**
 * Touch event handlers for mobile
 */
let touchStartY = 0;
let touchCurrentY = 0;
let touchedElement = null;

function handleTouchStart(event) {
  touchStartY = event.touches[0].clientY;
  touchedElement = event.target.closest('.task-item');
}

function handleTouchMove(event) {
  if (!touchedElement) return;
  touchCurrentY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
  if (!touchedElement) return;
  
  // TODO: Implement mobile drag-and-drop
  // For now, just clear the references
  touchedElement = null;
  touchStartY = 0;
  touchCurrentY = 0;
}

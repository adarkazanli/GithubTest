# Quick Start: Task Scheduler Implementation

**Date**: 2025-01-27  
**Purpose**: Development setup and quick implementation guide

## Prerequisites

- Modern web browser with ES6+ support
- Text editor or IDE
- Web server (optional, for local testing)
- Node.js (optional, for bundling tools)

## Project Setup

### 1. Directory Structure

```bash
mkdir -p task-scheduler/src/{models,services,ui,utils} assets/lib styles
touch index.html src/main.js
```

### 2. Download Dependencies

```bash
# Download SheetJS library
curl -o assets/lib/xlsx.full.min.js https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js
```

### 3. HTML Structure (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Scheduler</title>
  <link rel="stylesheet" href="styles/main.css">
</head>
<body>
  <!-- Import Panel -->
  <section id="import-panel">
    <input type="file" id="excel-file" accept=".xlsx">
    <div id="import-summary"></div>
  </section>

  <!-- Schedule Controls -->
  <section id="schedule-controls">
    <label>Estimated Start Time:</label>
    <input type="text" id="estimated-start-time" value="09:00" pattern="\d{2}:\d{2}">
  </section>

  <!-- Task List -->
  <section id="task-list">
    <!-- Tasks will be rendered here dynamically -->
  </section>

  <!-- Load SheetJS -->
  <script src="assets/lib/xlsx.full.min.js"></script>
  <!-- Main application -->
  <script src="src/main.js"></script>
</body>
</html>
```

### 4. Initial CSS (styles/main.css)

```css
/* Mobile-first responsive layout */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 1rem;
}

section {
  margin-bottom: 1.5rem;
}

#task-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.task-item {
  padding: 1rem;
  border: 1px solid #ddd;
  background: #f9f9f9;
  cursor: move;
}

.task-item.dragging {
  opacity: 0.5;
}

.task-item.drag-over {
  border-color: #007bff;
  background: #e3f2fd;
}

.notes-input {
  width: 100%;
  min-height: 60px;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.875rem;
  resize: vertical;
}

.task-notes {
  margin-top: 0.5rem;
}

@media (min-width: 768px) {
  body {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## Core Implementation

### 1. Time Utilities (src/utils/TimeUtils.js)

```javascript
class TimeUtils {
  static parseToMinutes(timeStr) {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) throw new Error('Invalid time format');
    
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    
    if (hours < 0 || minutes < 0 || minutes >= 60) {
      throw new Error('Invalid time range');
    }
    
    return hours * 60 + minutes;
  }

  static formatMinutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  static formatDateToTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
```

### 2. Task Model (src/models/Task.js)

```javascript
class Task {
  constructor(orderId, taskName, estimatedDuration) {
    this.id = this.generateId();
    this.orderId = orderId;
    this.taskName = taskName;
    this.estimatedDuration = estimatedDuration;
    this.notes = '';              // User-entered notes for the task
    this.calculatedStartTime = null;
    this.calculatedEndTime = null;
  }

  generateId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getDurationInMinutes() {
    return TimeUtils.parseToMinutes(this.estimatedDuration);
  }

  setCalculatedTimes(startTime, endTime) {
    this.calculatedStartTime = startTime;
    this.calculatedEndTime = endTime;
  }

  setNotes(notes) {
    this.notes = notes;
  }
}
```

### 3. Excel Importer (src/services/ExcelImporter.js)

```javascript
class ExcelImporter {
  static async importFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, {type: 'binary'});
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const rawData = XLSX.utils.sheet_to_json(worksheet);
          
          const result = this.validateAndParse(rawData);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  }

  static validateAndParse(rawData) {
    const tasks = [];
    const validRows = [];
    const invalidRows = [];
    
    rawData.forEach((row, index) => {
      try {
        // Validate columns exist
        if (!row.orderId && row.orderId !== 0) throw new Error('Missing orderId');
        if (!row.taskName) throw new Error('Missing taskName');
        if (!row.estimatedTime) throw new Error('Missing estimatedTime');
        
        // Validate time format
        const minutes = TimeUtils.parseToMinutes(row.estimatedTime);
        if (minutes === 0) throw new Error('Zero duration');
        
        const task = new Task(row.orderId, row.taskName, row.estimatedTime);
        validRows.push(task);
      } catch (error) {
        invalidRows.push({row: index + 1, error: error.message});
      }
    });
    
    // Handle duplicate order IDs
    this.deduplicateOrderIds(validRows);
    
    return {
      tasks: validRows,
      summary: {
        valid: validRows.length,
        invalid: invalidRows.length
      }
    };
  }

  static deduplicateOrderIds(tasks) {
    const seen = new Map();
    tasks.forEach(task => {
      while (seen.has(task.orderId)) {
        task.orderId++;
      }
      seen.set(task.orderId, true);
    });
  }
}
```

### 4. Storage Service (src/services/StorageService.js)

```javascript
class StorageService {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('taskSchedulerDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        db.createObjectStore('tasks', {keyPath: 'id'});
      };
    });
  }

  async saveTasks(tasks) {
    const tx = this.db.transaction('tasks', 'readwrite');
    const store = tx.objectStore('tasks');
    
    // Clear existing
    await store.clear();
    
    // Add new tasks
    for (const task of tasks) {
      await store.add(task);
    }
    
    localStorage.setItem('taskOrder', JSON.stringify(tasks.map(t => t.id)));
  }

  async getTasks() {
    const taskOrder = JSON.parse(localStorage.getItem('taskOrder') || '[]');
    const tx = this.db.transaction('tasks', 'readonly');
    const store = tx.objectStore('tasks');
    
    const tasks = [];
    for (const id of taskOrder) {
      const request = store.get(id);
      const task = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
      });
      if (task) tasks.push(task);
    }
    
    return tasks;
  }

  getEstimatedStartTime() {
    return localStorage.getItem('estimatedStartTime') || '09:00';
  }

  setEstimatedStartTime(time) {
    localStorage.setItem('estimatedStartTime', time);
  }
}
```

### 5. Task Calculator (src/services/TaskCalculator.js)

```javascript
class TaskCalculator {
  static calculateTimes(tasks, estimatedStartTime) {
    const startMinutes = TimeUtils.parseToMinutes(estimatedStartTime);
    const startDate = new Date();
    startDate.setHours(Math.floor(startMinutes / 60));
    startDate.setMinutes(startMinutes % 60);
    
    let currentTime = new Date(startDate);
    
    tasks.forEach(task => {
      const duration = task.getDurationInMinutes();
      const startTime = new Date(currentTime);
      
      currentTime.setMinutes(currentTime.getMinutes() + duration);
      const endTime = new Date(currentTime);
      
      task.setCalculatedTimes(startTime, endTime);
    });
    
    return tasks;
  }
}
```

### 6. Main Application (src/main.js)

```javascript
const storageService = new StorageService();
let currentTasks = [];

async function init() {
  await storageService.init();
  
  // Load existing tasks
  currentTasks = await storageService.getTasks();
  
  // Setup event listeners
  document.getElementById('excel-file').addEventListener('change', handleFileImport);
  document.getElementById('estimated-start-time').addEventListener('change', handleStartTimeChange);
  
  renderTasks();
}

async function handleFileImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  try {
    const result = await ExcelImporter.importFile(file);
    
    // Merge with existing tasks
    currentTasks = [...currentTasks, ...result.tasks];
    
    // Save to storage
    await storageService.saveTasks(currentTasks);
    
    // Show import summary
    showImportSummary(result.summary);
    
    // Recalculate and render
    recalculateAndRender();
  } catch (error) {
    alert('Import failed: ' + error.message);
  }
}

function handleStartTimeChange(event) {
  const newTime = event.target.value;
  storageService.setEstimatedStartTime(newTime);
  recalculateAndRender();
}

function recalculateAndRender() {
  const estimatedStartTime = storageService.getEstimatedStartTime();
  TaskCalculator.calculateTimes(currentTasks, estimatedStartTime);
  renderTasks();
}

function renderTasks() {
  const container = document.getElementById('task-list');
  container.innerHTML = currentTasks.map(task => {
    const start = TimeUtils.formatDateToTime(task.calculatedStartTime);
    const end = TimeUtils.formatDateToTime(task.calculatedEndTime);
    return `
      <div class="task-item" draggable="true" data-id="${task.id}">
        <div class="task-name">${task.taskName}</div>
        <div class="task-duration">Duration: ${task.estimatedDuration}</div>
        <div class="task-time">${start} - ${end}</div>
        <div class="task-notes">
          <textarea 
            class="notes-input" 
            placeholder="Add notes..."
            data-task-id="${task.id}"
          >${task.notes}</textarea>
        </div>
      </div>
    `;
  }).join('');
  
  setupDragAndDrop();
  setupNotesHandlers();
}

function setupNotesHandlers() {
  document.querySelectorAll('.notes-input').forEach(input => {
    input.addEventListener('blur', async (event) => {
      const taskId = event.target.dataset.taskId;
      const notes = event.target.value;
      
      // Update task in memory
      const task = currentTasks.find(t => t.id === taskId);
      if (task) {
        task.setNotes(notes);
        await storageService.saveTasks(currentTasks);
      }
    });
  });
}

function setupDragAndDrop() {
  // Implement drag and drop handlers
  // This would update taskOrder and recalculate times
}

function showImportSummary(summary) {
  const div = document.getElementById('import-summary');
  div.innerHTML = `Imported: ${summary.valid} valid, ${summary.invalid} invalid rows`;
}

// Initialize on load
init();
```

## Testing

### Manual Test Steps

1. **Open in browser**: Open `index.html` in Chrome/Firefox
2. **Import Excel**: Create test Excel with 3 columns, import file
3. **Verify display**: Check task list with calculated times
4. **Drag reorder**: Drag task to new position, verify time recalculation
5. **Change start**: Update estimated start time, verify shift
6. **Persistence**: Close browser, reopen, verify data persists

## Next Steps

- [ ] Implement drag-and-drop handlers for task reordering
- [ ] Add visual feedback during drag operations
- [ ] Handle mobile touch events for drag-and-drop
- [ ] Add export functionality
- [ ] Polish UI/UX
- [ ] Test on multiple browsers and devices


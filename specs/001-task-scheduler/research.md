# Technical Research: Task Scheduler

**Date**: 2025-01-27  
**Feature**: Task Scheduler  
**Purpose**: Research client-side Excel processing, drag-and-drop libraries, and browser storage for static SPA

## Excel Processing

### Client-Side Libraries

**SheetJS (xlsx.js)**
- **URL**: https://github.com/SheetJS/sheetjs
- **License**: Apache 2.0
- **Size**: ~200KB minified, ~800KB with full features
- **Pros**: 
  - Comprehensive Excel format support (.xlsx, .xls, .csv)
  - Parse and write Excel files entirely in browser
  - Works with FileReader API for file input
  - Actively maintained
- **Cons**: 
  - Large file size (mitigated by CDN or bundling)
  - Some advanced features require paid license (none needed for basic parsing)
- **Usage**: Parse XLSX files, extract cell values, handle validation

**Alternative: ExcelJS**
- Similar functionality but more complex API
- Not evaluated further as SheetJS meets requirements

### Implementation Approach

```javascript
// Read Excel file
const reader = new FileReader();
reader.onload = (e) => {
  const workbook = XLSX.read(e.target.result, {type: 'binary'});
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  // Process data
};
reader.readAsBinaryString(file);
```

**Key Considerations**:
- Validate data structure (3 columns: order id, task name, estimated time)
- Parse HH:MM format (e.g., "2:30" → 150 minutes)
- Handle missing/invalid rows
- Import summary with valid/invalid counts

## Drag-and-Drop

### Native HTML5 Drag and Drop API

**Documentation**: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API

**Pros**:
- No external dependencies
- Browser-native, no library size impact
- Works on both desktop and mobile (touch events)
- Built-in visual feedback

**Cons**:
- Mobile support requires additional touch event handling
- Some browser-specific quirks

**Implementation Approach**:

```javascript
// Make elements draggable
element.draggable = true;
element.addEventListener('dragstart', (e) => {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', elementId);
});

// Handle drop
element.addEventListener('drop', (e) => {
  e.preventDefault();
  const draggedId = e.dataTransfer.getData('text/html');
  // Reorder array and recalculate times
});

// Visual feedback
element.addEventListener('dragover', (e) => {
  e.preventDefault();
  element.classList.add('drag-over');
});
```

**Mobile Considerations**:
- Use touch events (touchstart, touchmove, touchend) alongside drag events
- Provide visual feedback during touch dragging
- Consider drag handles for small touch targets

## Browser Storage

### IndexedDB vs localStorage

**IndexedDB**
- **Pros**:
  - Much larger storage capacity (~50% of disk space)
  - Structured data with indexes
  - Asynchronous API (non-blocking)
  - Better for arrays of tasks (100+ items)
- **Cons**:
  - More complex API
  - Requires promise handling
- **Use Case**: Store task list and current order

**localStorage**
- **Pros**:
  - Simple synchronous API
  - Adequate for small config data
- **Cons**:
  - Limited to ~5MB
  - Synchronous (can block main thread)
  - Strings only (requires JSON serialization)
- **Use Case**: Store schedule settings (estimated start time)

### Storage Structure

```javascript
// IndexedDB structure
db.objectStore('tasks')
  - id: unique identifier
  - orderId: original Excel order ID
  - taskName: task name
  - estimatedDuration: HH:MM string
  - calculatedStartTime: calculated time
  - calculatedEndTime: calculated time

// localStorage structure
localStorage.setItem('estimatedStartTime', '09:00');
localStorage.setItem('taskOrder', JSON.stringify([1, 2, 3, ...]));
```

## Time Calculation

### HH:MM Format Parsing

**Requirements**:
- Parse "H:MM" or "HH:MM" format (e.g., "2:30", "12:45")
- Validate format (reject invalid entries)
- Convert to minutes for calculations
- Handle edge cases (negative, zero, very large)

**Implementation**:

```javascript
function parseTimeToMinutes(timeStr) {
  // Validate format
  const timeRegex = /^(\d{1,2}):(\d{2})$/;
  const match = timeStr.match(timeRegex);
  if (!match) throw new Error('Invalid time format');
  
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  
  // Validate range
  if (hours < 0 || minutes < 0 || minutes >= 60) {
    throw new Error('Invalid time range');
  }
  
  return hours * 60 + minutes;
}

function formatMinutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}
```

## Responsive Design

### Mobile-First Approach

**Breakpoints**:
- Mobile: 320px - 767px (single column, stacked layout)
- Tablet: 768px - 1023px (two columns, improved spacing)
- Desktop: 1024px+ (multi-column, side-by-side layout)

**Key Considerations**:
- Touch-friendly drag handles (minimum 44x44px target)
- Stack form controls on mobile
- Horizontal scrolling for time columns
- Collapsible sections for better mobile UX

**CSS Framework**: None (pure CSS, mobile-first media queries)

## Performance Optimization

**Strategies**:
1. Defer Excel parsing until file is selected (no upfront load)
2. Lazy-load SheetJS only when import triggered
3. Virtual scrolling for 100+ tasks (render visible items only)
4. Debounce time recalculation (batch updates)
5. IndexedDB caching to avoid re-parsing Excel on page reload

**Target Metrics**:
- Import 20 tasks: < 5 seconds (includes file read + parse + render)
- Time recalculation: < 1 second (for 100 tasks)
- Smooth 60fps scrolling with 100+ tasks

## Testing Strategy

**Manual Testing Matrix**:
- Chrome (desktop + Android)
- Firefox (desktop + Android)
- Safari (desktop + iOS)
- Edge (desktop)

**Test Scenarios**:
1. Import valid Excel file with 20 tasks
2. Import file with invalid data (verify skip behavior)
3. Drag and drop reordering
4. Change estimated start time
5. Import new file (verify merge behavior)
6. Close and reopen browser (verify persistence)
7. Test on mobile device (touch drag)

**No automated tests** - static SPA with manual validation per constitution requirements.

## Findings Summary

✅ **SheetJS** selected for Excel processing (client-side, well-maintained)  
✅ **Native HTML5 drag-and-drop** for task reordering (no dependencies)  
✅ **IndexedDB** for task storage, **localStorage** for settings  
✅ **HH:MM time format** parsing and validation approach defined  
✅ **Mobile-first responsive CSS** for cross-device compatibility  
✅ **Performance strategy** identified for smooth operation  
✅ **Manual testing approach** defined for cross-browser validation


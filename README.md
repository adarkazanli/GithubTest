# Task Scheduler

A static single-page application for importing Excel spreadsheets containing task schedules and managing them with calculated start and end times.

## Features

- 📊 **Excel Import**: Import tasks from .xlsx files with validation
- ⏰ **Time Calculations**: Automatic start/end time calculation based on durations
- 🔄 **Drag and Drop**: Reorder tasks easily with drag-and-drop
- 📝 **Task Notes**: Add notes to each task
- 💾 **Persistent Storage**: Data stored locally in browser (IndexedDB + localStorage)
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Stripe-inspired UI**: Modern, clean interface

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Running Locally

1. Open `index.html` in your web browser
   - Or use a local web server:
   ```bash
   python -m http.server 8000
   ```
   Then navigate to `http://localhost:8000`

2. Import an Excel file with the following structure:
   - **Column 1**: Order ID (numeric)
   - **Column 2**: Task Name (text)
   - **Column 3**: Estimated Time (HH:MM format, e.g., "2:30")

### Excel File Format

Your Excel file must contain 3 columns:

| Order ID | Task Name | Estimated Time |
|----------|-----------|----------------|
| 1 | Review documents | 1:30 |
| 2 | Write report | 2:00 |
| 3 | Send to client | 0:30 |

**Time Format**: Use HH:MM format (e.g., "2:30" for 2 hours 30 minutes)

## Usage

### Importing Tasks

1. Click "Import Excel" button
2. Select your .xlsx file
3. View the import summary showing valid and invalid rows
4. Tasks are automatically displayed with calculated start/end times

### Reordering Tasks

1. Drag a task to a new position
2. All times automatically recalculate
3. Changes are saved automatically

### Adjusting Start Time

1. Enter a new start time in HH:MM format (e.g., "09:00")
2. Click "Update Times" button
3. All task times shift to the new start time

### Adding Notes

1. Click in the notes textarea for any task
2. Type your notes
3. Click away to automatically save

## Running Tests

This project includes a comprehensive test suite with 141 tests covering all critical functionality.

### Test Commands

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run tests in watch mode (auto-reruns on changes)
npm run test:watch

# Run tests with interactive UI
npm run test:ui

# Generate coverage report
npm run coverage

# Run in CI mode (verbose output)
npm run test:ci
```

### Test Structure

- **Unit Tests** (87 tests): Individual module testing
  - TimeUtils, Task Model, TaskCalculator
  - StorageService, ExcelImporter, ResetButton

- **Integration Tests** (54 tests): Complete workflow testing
  - Excel Import, Reset, Time Update, Task Reordering

### Running Specific Tests

```bash
# Run only unit tests
npx vitest tests/unit/

# Run only integration tests
npx vitest tests/integration/

# Run a specific test file
npx vitest tests/unit/models/Task.test.js

# Run tests matching a pattern
npx vitest -t "should calculate"
```

### Test Coverage

The test suite maintains high coverage:
- **87.85%** statement coverage
- **95.45%** branch coverage
- **75%** function coverage

View detailed coverage reports at `coverage/index.html` after running `npm run coverage`.

For more information, see [tests/README.md](tests/README.md).

## Technical Details

- **Technology**: Vanilla JavaScript, HTML5, CSS3
- **Storage**: IndexedDB for tasks, localStorage for settings
- **Excel Processing**: SheetJS (xlsx.js) client-side
- **Testing**: Vitest + JSDOM with comprehensive test coverage
- **No Backend**: Fully offline-capable static application

## License

See LICENSE file for details. This application uses SheetJS (Apache 2.0 license).

## Browser Compatibility

- ✅ Chrome (desktop + mobile)
- ✅ Firefox (desktop + mobile)
- ✅ Safari (desktop + iOS)
- ✅ Edge (desktop)

## Troubleshooting

### Import fails
- Ensure Excel file has exactly 3 columns in the first row
- Check that time values are in HH:MM format (e.g., "2:30")
- Verify there are no zero or negative durations

### Tasks not displaying
- Check browser console for errors
- Ensure IndexedDB is enabled in your browser
- Try clearing browser data and re-importing

### Times not calculating
- Verify estimated start time is in HH:MM format
- Check that task durations are valid (not "0:00")
- Ensure JavaScript is enabled


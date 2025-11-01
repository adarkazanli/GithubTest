# Master Functional Requirements
## Task Scheduler Application

**Document Version:** 1.0
**Date:** 2025-10-26
**Status:** Active

---

## 1. Document Purpose and Scope

### 1.1 Purpose
This document defines the complete set of functional and non-functional requirements for the Task Scheduler application. It serves as the authoritative reference for understanding all system capabilities, constraints, and expected behaviors.

### 1.2 Scope
The Task Scheduler is a client-side web application that enables users to:
- Import task schedules from Excel spreadsheets
- View tasks with automatically calculated start and end times
- Reorder tasks through drag-and-drop interaction
- Adjust overall schedule timing
- Add notes to individual tasks
- Persist all changes locally in the browser

### 1.3 Intended Audience
- Product managers
- Developers
- QA engineers
- Project stakeholders
- Technical writers

---

## 2. System Overview

### 2.1 Application Type
Static single-page web application (SPA) running entirely in the browser with no backend dependencies.

### 2.2 Key Characteristics
- Fully offline-capable
- Zero server requirements
- Responsive design (mobile and desktop)
- Local data persistence
- Real-time calculation engine

### 2.3 Technology Stack
- HTML5, CSS3, Vanilla JavaScript (ES6+)
- SheetJS (xlsx.js) for Excel parsing
- IndexedDB for task storage
- localStorage for configuration

---

## 3. Functional Requirements

### 3.1 Excel Import Functionality

#### FR-3.1.1 File Upload
**Requirement:** The system shall accept Excel files (.xlsx format) through a file input control.

**Acceptance Criteria:**
- File input filters to show only .xlsx files
- Import button becomes active when file is selected
- System validates file format before processing

#### FR-3.1.2 Excel Data Structure
**Requirement:** The system shall process Excel files containing exactly three columns in the following order:

1. **Order ID** (Column A): Numeric identifier for task sequence
2. **Task Name** (Column B): Text description of the task
3. **Estimated Time** (Column C): Duration in HH:MM format

**Acceptance Criteria:**
- System reads data starting from row 2 (assumes row 1 is headers)
- Empty rows are skipped
- Invalid rows are reported but do not halt import

#### FR-3.1.3 Data Validation
**Requirement:** The system shall validate each imported row according to the following rules:

| Field | Validation Rules |
|-------|-----------------|
| Order ID | Must be numeric; duplicates are auto-incremented |
| Task Name | Must be non-empty string |
| Estimated Time | Must be valid HH:MM format (e.g., "2:30", "0:45", "10:00") |
| Duration Value | Must be greater than zero |

**Acceptance Criteria:**
- Invalid rows are identified and counted
- Valid rows are imported successfully
- Import summary displays count of valid and invalid rows
- System does not crash on malformed data

#### FR-3.1.4 Import Summary
**Requirement:** The system shall display an import summary after each import operation.

**Acceptance Criteria:**
- Summary shows count of valid rows imported
- Summary shows count of invalid rows skipped
- Summary displays file name and timestamp
- Summary persists in import history

#### FR-3.1.5 Task Merging
**Requirement:** When importing new tasks into an existing schedule, the system shall append new tasks while preserving existing task order and properties.

**Acceptance Criteria:**
- New tasks are added after existing tasks
- Existing task notes are preserved
- Existing task order is maintained
- User-defined start time is preserved
- All tasks recalculate times after merge

---

### 3.2 Task Display Functionality

#### FR-3.2.1 Task List View
**Requirement:** The system shall display all tasks in a vertically scrolling list.

**Acceptance Criteria:**
- Tasks appear in order defined by task order array
- Each task displays as a distinct visual card
- List supports smooth scrolling
- Empty state message appears when no tasks exist

#### FR-3.2.2 Task Information Display
**Requirement:** Each task card shall display the following information:

| Element | Description |
|---------|-------------|
| Order ID | Numeric badge showing original order |
| Task Name | Full text of task description |
| Estimated Duration | Time in HH:MM format |
| Calculated Start Time | Computed start time in HH:MM format |
| Calculated End Time | Computed end time in HH:MM format |
| Notes Field | User-editable text area |

**Acceptance Criteria:**
- All fields are clearly visible and readable
- Times are formatted consistently (HH:MM)
- Duration shows original estimated time
- Start and end times reflect current schedule position

#### FR-3.2.3 Empty State
**Requirement:** When no tasks exist, the system shall display a user-friendly empty state message.

**Acceptance Criteria:**
- Message instructs user to import an Excel file
- Message is visually centered and clear
- Import controls remain accessible

---

### 3.3 Time Calculation Functionality

#### FR-3.3.1 Sequential Time Calculation
**Requirement:** The system shall calculate start and end times for all tasks sequentially based on:
1. The estimated start time for the schedule
2. Task order in the list
3. Estimated duration of each task

**Calculation Logic:**
```
For the first task:
  Start Time = Estimated Start Time

For subsequent tasks:
  Start Time = Previous Task End Time

For all tasks:
  End Time = Start Time + Estimated Duration
```

**Acceptance Criteria:**
- First task starts at estimated start time
- Each subsequent task starts when previous task ends
- No gaps between tasks
- Times update when order or start time changes

#### FR-3.3.2 Time Format
**Requirement:** All time values shall use 24-hour HH:MM format.

**Acceptance Criteria:**
- Hours range from 00 to 23
- Minutes range from 00 to 59
- Leading zeros are displayed (e.g., "09:00", not "9:0")
- Invalid formats are rejected with error message

#### FR-3.3.3 Cross-Midnight Calculation
**Requirement:** The system shall correctly calculate times that span across midnight.

**Acceptance Criteria:**
- Times correctly increment past 23:59 to 00:00
- End times after midnight display correctly
- Task duration calculations remain accurate

---

### 3.4 Drag-and-Drop Reordering

#### FR-3.4.1 Drag Initiation
**Requirement:** Users shall be able to initiate a drag operation on any task card.

**Acceptance Criteria:**
- Task card becomes draggable on mouse down or touch start
- Visual feedback indicates dragging state (reduced opacity)
- Cursor changes to indicate drag capability

#### FR-3.4.2 Drop Target Indication
**Requirement:** The system shall visually indicate valid drop targets during drag operations.

**Acceptance Criteria:**
- Task cards change appearance when dragged task hovers over them
- Border and background color change to indicate drop zone
- Invalid drop areas do not show feedback

#### FR-3.4.3 Task Reordering
**Requirement:** When a task is dropped on a new position, the system shall reorder the task list and recalculate all times.

**Acceptance Criteria:**
- Task moves to new position in list
- All task times recalculate based on new order
- New order persists to browser storage
- UI updates immediately to reflect new order
- Drag operation completes cleanly (visual feedback removed)

#### FR-3.4.4 Mobile Touch Support
**Requirement:** The drag-and-drop functionality shall work on touch devices.

**Acceptance Criteria:**
- Touch events (touchstart, touchmove, touchend) are supported
- Touch feedback provides same visual indicators as mouse
- Drag operations work on iOS and Android browsers
- No conflicts with native browser scrolling

#### FR-3.4.5 Drag Cancellation
**Requirement:** Users shall be able to cancel a drag operation.

**Acceptance Criteria:**
- Dragging outside valid drop zones cancels operation
- Task returns to original position on cancel
- Visual feedback resets to normal state
- No unintended reordering occurs

---

### 3.5 Schedule Start Time Adjustment

#### FR-3.5.1 Start Time Input
**Requirement:** The system shall provide an input field for users to modify the estimated start time of the entire schedule.

**Acceptance Criteria:**
- Input field displays current estimated start time
- Input accepts HH:MM format
- Input validates format on change
- Invalid formats trigger error message

#### FR-3.5.2 Schedule Time Shift
**Requirement:** When the estimated start time changes, the system shall shift all task times while maintaining their relative positions and durations.

**Acceptance Criteria:**
- All task start times shift by the same amount
- All task end times shift by the same amount
- Task order remains unchanged
- Task durations remain unchanged
- New start time persists to browser storage

#### FR-3.5.3 Bulk Time Recalculation
**Requirement:** After start time adjustment, the system shall recalculate and save all task times.

**Acceptance Criteria:**
- All tasks recalculate sequentially
- Updated times save to IndexedDB
- UI updates to show new times
- Calculation completes within 1 second for up to 100 tasks

---

### 3.6 Task Notes Functionality

#### FR-3.6.1 Notes Input
**Requirement:** Each task shall have an editable notes field for user annotations.

**Acceptance Criteria:**
- Notes field appears on each task card
- Field supports multiline text input
- Field is clearly labeled as "Notes"
- Field expands to accommodate content

#### FR-3.6.2 Notes Auto-Save
**Requirement:** Notes shall automatically save when the user finishes editing.

**Acceptance Criteria:**
- Notes save on blur (when field loses focus)
- No manual save action required
- Save operation provides visual confirmation
- Notes persist to IndexedDB immediately

#### FR-3.6.3 Notes Validation
**Requirement:** The system shall validate note content before saving.

**Acceptance Criteria:**
- Empty notes are allowed
- Excessively long notes are truncated or warned
- Special characters are supported
- Line breaks are preserved

---

### 3.7 Data Persistence

#### FR-3.7.1 Task Storage
**Requirement:** All task data shall persist in browser IndexedDB.

**Acceptance Criteria:**
- Tasks save to database named "taskSchedulerDB"
- Object store named "tasks" contains all task objects
- Each task has unique ID as primary key
- Index exists on orderId field
- Data persists across browser sessions

#### FR-3.7.2 Configuration Storage
**Requirement:** Schedule configuration shall persist in browser localStorage.

**Acceptance Criteria:**
- Estimated start time stores in localStorage key "estimatedStartTime"
- Task order stores in localStorage key "taskOrder" as JSON array
- Import history stores in localStorage key "importHistory"
- Data is immediately available on page load

#### FR-3.7.3 Data Reconstruction
**Requirement:** On page load, the system shall reconstruct Task objects from stored data.

**Acceptance Criteria:**
- Task instances are created with all properties
- Task methods are available after reconstruction
- Calculated times are restored as Date objects
- All data integrity is maintained

#### FR-3.7.4 Storage Cleanup
**Requirement:** The system shall handle storage quota limitations gracefully.

**Acceptance Criteria:**
- System detects when approaching storage limits
- User receives warning if storage is nearly full
- System continues to function with existing data
- No data corruption occurs due to storage errors

---

### 3.8 Import History

#### FR-3.8.1 History Tracking
**Requirement:** The system shall track the most recent Excel import operation.

**Acceptance Criteria:**
- File name is recorded
- Import timestamp is recorded
- Valid and invalid row counts are recorded
- History displays in import panel

#### FR-3.8.2 History Display
**Requirement:** Import history shall be visible to users in the import panel.

**Acceptance Criteria:**
- Last import file name displays
- Import date and time display in readable format
- Import summary (valid/invalid counts) displays
- History updates after each new import

---

### 3.9 Error Handling

#### FR-3.9.1 File Read Errors
**Requirement:** The system shall handle file read errors gracefully.

**Acceptance Criteria:**
- Corrupted Excel files trigger clear error message
- Incorrect file formats are detected and reported
- System remains stable after file errors
- User can retry with different file

#### FR-3.9.2 Data Validation Errors
**Requirement:** Invalid data within Excel files shall be reported without halting the import.

**Acceptance Criteria:**
- Each validation error is logged
- Error summary shows which rows failed and why
- Valid rows are imported despite invalid rows
- User can review validation errors

#### FR-3.9.3 Storage Errors
**Requirement:** The system shall handle database and storage errors appropriately.

**Acceptance Criteria:**
- IndexedDB errors trigger user-friendly messages
- localStorage quota errors are detected
- System provides recovery options
- Critical errors prevent data loss

#### FR-3.9.4 Browser Compatibility Errors
**Requirement:** The system shall detect and report browser incompatibility.

**Acceptance Criteria:**
- Missing IndexedDB support is detected
- Missing File API support is detected
- User receives guidance on compatible browsers
- Graceful degradation where possible

---

### 3.10 Loading States

#### FR-3.10.1 Import Loading
**Requirement:** During Excel import operations, the system shall indicate processing status.

**Acceptance Criteria:**
- Import button shows loading state
- UI elements have reduced opacity during processing
- User cannot initiate new import until current completes
- Loading state clears after import completes

#### FR-3.10.2 Calculation Loading
**Requirement:** During time recalculation operations, the system shall indicate processing status.

**Acceptance Criteria:**
- Visual indicator appears during calculations
- User interactions are queued during processing
- UI updates after calculations complete
- Loading state does not block urgent interactions

---

### 3.11 Database Reset Functionality

#### FR-3.11.1 Reset Button Placement
**Requirement:** The system shall provide a reset button positioned next to the import button in the control panel.

**Acceptance Criteria:**
- Reset button appears in import controls area
- Button is clearly labeled "Reset All Data"
- Button has distinctive warning color (red)
- Button is visible on all screen sizes
- Button is disabled during import operations

#### FR-3.11.2 Confirmation Dialog
**Requirement:** Before executing reset, the system shall display a modal confirmation dialog.

**Acceptance Criteria:**
- Dialog appears centered on screen with semi-transparent backdrop
- Dialog blocks interaction with rest of page
- Dialog message states: "This will permanently delete all your task data and cannot be undone"
- Dialog provides two buttons: "Cancel" (secondary) and "Delete All Data" (danger/red)
- Cancel button is focused by default for safe default behavior
- Escape key closes dialog without executing reset
- Clicking backdrop does not close dialog (user must explicitly choose)

#### FR-3.11.3 Data Clearing
**Requirement:** The reset operation shall clear all application data from browser storage.

**Acceptance Criteria:**
- All tasks are removed from IndexedDB tasks store
- taskOrder is removed from localStorage
- estimatedStartTime is removed from localStorage
- importHistory is removed from localStorage
- Database schema is preserved (not deleted)
- Operation completes in under 5 seconds for typical datasets

#### FR-3.11.4 Error Handling
**Requirement:** The reset operation shall handle storage errors gracefully.

**Acceptance Criteria:**
- Errors from IndexedDB are caught and reported separately
- Errors from localStorage are caught and reported separately
- Partial failures complete clearing of successful storage areas
- Error messages specify which storage area failed
- User receives detailed error feedback with suggested actions
- Failed operations can be retried

#### FR-3.11.5 Visual Feedback
**Requirement:** The system shall provide clear visual feedback during and after reset operations.

**Acceptance Criteria:**
- Success message displays: "✓ All data cleared successfully"
- Success message uses green color scheme
- Error message displays: "⚠️ Reset partially failed: [error details]"
- Error message uses red color scheme
- Messages include dismiss button (× icon)
- Messages auto-dismiss after 5 seconds
- Messages have ARIA attributes for screen reader support (role="alert", aria-live="polite")
- Empty state message displays after successful reset

#### FR-3.11.6 Button State Management
**Requirement:** The reset button shall be disabled during operations to prevent concurrent executions.

**Acceptance Criteria:**
- Button disables immediately when clicked
- Button remains disabled until confirmation is resolved (confirm or cancel)
- Button re-enables after operation completes (success or error)
- Disabled state shows reduced opacity and "not-allowed" cursor
- Button stays disabled during Excel import operations
- Tooltip "Reset unavailable during import" displays when disabled during import

#### FR-3.11.7 UI State Management
**Requirement:** After successful reset, the UI shall update to reflect the empty state.

**Acceptance Criteria:**
- Task list clears and shows empty state message
- Import summary clears
- Schedule start time resets to default (09:00)
- Page does not require manual refresh
- All UI updates occur automatically after reset callback fires

#### FR-3.11.8 Keyboard Accessibility
**Requirement:** The reset feature shall be fully accessible via keyboard navigation.

**Acceptance Criteria:**
- Reset button is reachable via Tab key
- Enter or Space key activates reset button
- Dialog buttons are reachable via Tab key within dialog
- Escape key cancels dialog
- Focus returns to reset button after dialog closes
- All interactive elements have visible focus indicators

#### FR-3.11.9 Mobile Responsiveness
**Requirement:** The reset feature shall work correctly on mobile devices.

**Acceptance Criteria:**
- Reset button layout adapts to mobile screens (stacks vertically if needed)
- Dialog is responsive (full width with padding on screens < 768px)
- Dialog buttons stack vertically on mobile
- Touch targets meet minimum size (44x44px)
- Dialog scrolls if content exceeds viewport height
- Confirmation works with touch events

#### FR-3.11.10 Data Persistence Validation
**Requirement:** The system shall verify that reset operations actually clear browser storage.

**Acceptance Criteria:**
- IndexedDB tasks store is empty after reset (verified via DevTools)
- localStorage keys (taskOrder, estimatedStartTime, importHistory) are removed (verified via DevTools)
- No residual task data remains in any storage area
- Subsequent page load shows empty state
- Re-importing tasks works correctly after reset

---

## 4. Non-Functional Requirements

### 4.1 Performance Requirements

#### NFR-4.1.1 Page Load Time
**Requirement:** Initial page load shall complete within 3 seconds on 3G network connections.

**Acceptance Criteria:**
- HTML, CSS, JavaScript assets total < 500KB
- SheetJS library loads efficiently
- No blocking network requests
- Critical path rendering is optimized

#### NFR-4.1.2 Import Performance
**Requirement:** Excel files containing 20 tasks shall import within 5 seconds.

**Acceptance Criteria:**
- File parsing completes within 2 seconds
- Validation completes within 1 second
- Data storage completes within 1 second
- UI rendering completes within 1 second

#### NFR-4.1.3 Calculation Performance
**Requirement:** Time recalculation for 100 tasks shall complete within 1 second.

**Acceptance Criteria:**
- Sequential calculation algorithm is optimized
- UI remains responsive during calculation
- No frame drops or janky animations
- Smooth scrolling maintained

#### NFR-4.1.4 Drag-and-Drop Performance
**Requirement:** Drag-and-drop operations shall provide smooth 60fps visual feedback.

**Acceptance Criteria:**
- Drag animations are hardware-accelerated
- Drop zones highlight without lag
- Task reordering completes within 500ms
- No visual glitches during drag operations

#### NFR-4.1.5 Scalability
**Requirement:** The system shall support up to 100 tasks with smooth performance.

**Acceptance Criteria:**
- List scrolling remains smooth with 100 tasks
- Time calculations complete within 1 second
- Memory usage remains reasonable (< 100MB)
- No performance degradation at scale

---

### 4.2 Usability Requirements

#### NFR-4.2.1 Responsive Design
**Requirement:** The application shall be fully functional on screen sizes from 320px to 2560px wide.

**Acceptance Criteria:**
- Mobile phones (320px-767px): Stacked vertical layout
- Tablets (768px-1023px): Optimized horizontal layout
- Desktops (1024px+): Full-featured layout with expanded notes
- No horizontal scrolling required
- Touch targets are at least 44x44px on mobile

#### NFR-4.2.2 Visual Feedback
**Requirement:** All user interactions shall provide immediate visual feedback.

**Acceptance Criteria:**
- Buttons show hover and active states
- Drag operations show opacity change
- Drop targets show highlight
- Form inputs show focus states
- Loading states are clearly visible

#### NFR-4.2.3 Error Messages
**Requirement:** Error messages shall be clear, actionable, and user-friendly.

**Acceptance Criteria:**
- Messages explain what went wrong
- Messages suggest corrective actions
- Messages avoid technical jargon
- Messages are visually distinct (color, icons)

#### NFR-4.2.4 Accessibility
**Requirement:** The application shall follow basic web accessibility guidelines.

**Acceptance Criteria:**
- Semantic HTML elements are used
- Form inputs have associated labels
- Sufficient color contrast (WCAG AA)
- Keyboard navigation works for primary flows
- Focus indicators are visible

---

### 4.3 Reliability Requirements

#### NFR-4.3.1 Data Integrity
**Requirement:** The system shall maintain data integrity across all operations.

**Acceptance Criteria:**
- No data loss during normal operations
- Concurrent operations are handled safely
- Storage transactions are atomic
- Data validation prevents corruption

#### NFR-4.3.2 Error Recovery
**Requirement:** The system shall recover gracefully from errors without data loss.

**Acceptance Criteria:**
- Failed operations can be retried
- Partial imports do not corrupt existing data
- Storage errors do not cause crashes
- User can continue working after errors

#### NFR-4.3.3 Browser Refresh Handling
**Requirement:** Data shall persist correctly across browser refreshes and closures.

**Acceptance Criteria:**
- All task data loads on page refresh
- Task order is preserved
- Schedule settings are preserved
- No data loss on unexpected closure

---

### 4.4 Compatibility Requirements

#### NFR-4.4.1 Browser Support
**Requirement:** The application shall function correctly on the following browsers:

- Chrome 90+ (desktop and mobile)
- Firefox 88+ (desktop and mobile)
- Safari 14+ (desktop and iOS)
- Edge 90+ (desktop)

**Acceptance Criteria:**
- All features work on listed browsers
- Visual appearance is consistent
- Performance is acceptable
- No browser-specific bugs in critical paths

#### NFR-4.4.2 Operating System Support
**Requirement:** The application shall work on desktop and mobile operating systems:

- Windows 10+
- macOS 11+
- iOS 14+
- Android 10+

**Acceptance Criteria:**
- Native OS features do not interfere
- File selection works on all platforms
- Touch and mouse inputs work appropriately
- No OS-specific crashes or bugs

#### NFR-4.4.3 Excel File Compatibility
**Requirement:** The system shall support Excel files created by:

- Microsoft Excel 2010+
- Google Sheets (exported as .xlsx)
- LibreOffice Calc
- Apple Numbers (exported as .xlsx)

**Acceptance Criteria:**
- Files from all sources parse correctly
- Column structures are recognized
- Data types are interpreted correctly
- No compatibility-related import failures

---

### 4.5 Security Requirements

#### NFR-4.5.1 Client-Side Security
**Requirement:** All data processing shall occur entirely in the client browser.

**Acceptance Criteria:**
- No data is transmitted to external servers
- No third-party tracking scripts
- No external API calls
- File uploads are processed locally

#### NFR-4.5.2 Data Privacy
**Requirement:** User data shall remain private and under user control.

**Acceptance Criteria:**
- Data stores only in user's browser
- No cloud synchronization
- No user account or authentication required
- User can clear all data via browser tools

#### NFR-4.5.3 Input Sanitization
**Requirement:** All user inputs shall be sanitized to prevent injection attacks.

**Acceptance Criteria:**
- HTML special characters are escaped
- Script tags in text inputs are neutralized
- No XSS vulnerabilities in notes or task names
- Safe handling of Excel cell contents

---

### 4.6 Maintainability Requirements

#### NFR-4.6.1 Code Organization
**Requirement:** Code shall be organized in a modular, maintainable structure.

**Acceptance Criteria:**
- Separation of concerns (models, services, utils)
- Single responsibility for each module
- Clear file naming conventions
- Logical directory structure

#### NFR-4.6.2 Code Documentation
**Requirement:** Code shall include inline documentation for complex logic.

**Acceptance Criteria:**
- Public methods have JSDoc comments
- Complex algorithms are explained
- Data structures are documented
- File headers describe module purpose

#### NFR-4.6.3 Version Control
**Requirement:** All code changes shall be tracked in version control.

**Acceptance Criteria:**
- Git repository with clear commit messages
- Commit history shows development progression
- Branches used for feature development
- Clean commit log without sensitive data

---

### 4.7 Deployment Requirements

#### NFR-4.7.1 Static Hosting
**Requirement:** The application shall be deployable as static files to any web server or CDN.

**Acceptance Criteria:**
- No server-side processing required
- No build process required for deployment
- Files can be served directly
- Works from any URL path (e.g., subdirectory)

#### NFR-4.7.2 Offline Capability
**Requirement:** The application shall function without internet connectivity after initial load.

**Acceptance Criteria:**
- All assets are cached after first visit
- Application works offline completely
- No external resource dependencies
- Excel import works offline

#### NFR-4.7.3 File Size Optimization
**Requirement:** Total application size shall be optimized for fast delivery.

**Acceptance Criteria:**
- Minified JavaScript where appropriate
- Optimized CSS (no unused rules)
- Minimal external dependencies
- Total bundle < 500KB

---

## 5. User Interface Requirements

### 5.1 Layout Structure

#### UIR-5.1.1 Main Layout
**Requirement:** The application shall use a three-section vertical layout:

1. **Import Panel** (top): File upload and import controls
2. **Schedule Controls** (middle): Estimated start time input
3. **Task List** (bottom): Scrollable list of tasks

**Acceptance Criteria:**
- Sections are visually distinct
- Order is logical for workflow
- Responsive on all screen sizes
- Sections stack on mobile

#### UIR-5.1.2 Maximum Width
**Requirement:** The main content shall have a maximum width of 1200px on large screens.

**Acceptance Criteria:**
- Content centers on screens wider than 1200px
- Prevents excessively long line lengths
- Maintains readability on large monitors

---

### 5.2 Visual Design

#### UIR-5.2.1 Color Scheme
**Requirement:** The application shall use a Stripe.com-inspired color palette:

- **Primary Purple**: #635bff (buttons, accents)
- **Navy**: #0a2540 (headings, primary text)
- **Gray**: #425466 (secondary text)
- **Light Gray**: #e1e8ed (borders, dividers)
- **White**: #ffffff (backgrounds, cards)

**Acceptance Criteria:**
- Colors are consistently applied
- Sufficient contrast for readability
- Professional, modern appearance
- Gradient purple for import panel header

#### UIR-5.2.2 Typography
**Requirement:** The application shall use system fonts for optimal performance:

- Font stack: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- Base font size: 16px
- Heading sizes: 24px (h1), 18px (h2)
- Line height: 1.5 for body text

**Acceptance Criteria:**
- Text is readable on all devices
- Font sizes scale appropriately
- Proper hierarchy is maintained
- No web font loading delays

#### UIR-5.2.3 Spacing and Layout
**Requirement:** The application shall use consistent spacing throughout:

- Section padding: 24px
- Card padding: 16px
- Element margins: 8px, 16px, 24px
- Border radius: 8px for cards and buttons

**Acceptance Criteria:**
- Visual rhythm is consistent
- Elements have breathing room
- Alignment is precise
- Responsive spacing on mobile

---

### 5.3 Component Styling

#### UIR-5.3.1 Import Panel
**Requirement:** The import panel shall have a distinctive gradient purple background.

**Acceptance Criteria:**
- Gradient from #667eea to #635bff
- White text for contrast
- File input and button styled consistently
- Import summary displays below controls

#### UIR-5.3.2 Task Cards
**Requirement:** Each task card shall have a clean, card-like appearance.

**Acceptance Criteria:**
- White background with 1px light gray border
- 8px border radius for rounded corners
- Box shadow on hover for depth
- Clear internal structure with proper alignment

#### UIR-5.3.3 Buttons
**Requirement:** Buttons shall have clear interactive states.

**Acceptance Criteria:**
- Solid background colors (purple or blue)
- White text
- Hover state darkens background
- Active state shows slight scale transform
- Disabled state reduces opacity

#### UIR-5.3.4 Form Inputs
**Requirement:** Form inputs shall follow consistent styling.

**Acceptance Criteria:**
- 1px border (light gray default, blue on focus)
- 8px border radius
- Adequate padding (12px)
- Clear focus indicators
- Proper touch targets on mobile

---

### 5.4 Responsive Breakpoints

#### UIR-5.4.1 Mobile Layout (< 768px)
**Requirement:** On mobile devices, the layout shall stack vertically.

**Acceptance Criteria:**
- Full-width sections
- Stacked task card elements
- Larger touch targets (44x44px minimum)
- Single-column layout
- Optimized font sizes

#### UIR-5.4.2 Tablet Layout (768px - 1023px)
**Requirement:** On tablets, the layout shall use available horizontal space.

**Acceptance Criteria:**
- Task info displays horizontally
- Notes field has increased width
- Two-column layouts where appropriate
- Optimized for landscape and portrait

#### UIR-5.4.3 Desktop Layout (1024px+)
**Requirement:** On desktop screens, the layout shall maximize horizontal space.

**Acceptance Criteria:**
- Full horizontal layout for task cards
- Expanded notes field
- Maximum container width enforced
- Hover states fully utilized

---

## 6. Data Requirements

### 6.1 Data Models

#### DR-6.1.1 Task Entity
**Requirement:** The Task entity shall contain the following properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | String | Yes | Unique identifier (timestamp + random) |
| orderId | Number | Yes | Original order from Excel |
| taskName | String | Yes | Task description |
| estimatedDuration | String | Yes | Duration in HH:MM format |
| notes | String | No | User-entered notes |
| calculatedStartTime | Date | Yes | Computed start time |
| calculatedEndTime | Date | Yes | Computed end time |

**Acceptance Criteria:**
- All properties are validated before storage
- Date objects are properly serialized/deserialized
- Task instances include getter methods
- Data integrity is maintained

#### DR-6.1.2 Schedule Configuration
**Requirement:** Schedule configuration shall include:

- **estimatedStartTime**: String in HH:MM format (default: "09:00")
- **taskOrder**: Array of task IDs defining display order
- **importHistory**: Object containing last import metadata

**Acceptance Criteria:**
- Configuration persists in localStorage
- Default values are applied when not set
- Configuration updates atomically
- No data loss on update

---

### 6.2 Data Validation Rules

#### DR-6.2.1 Order ID Validation
**Requirement:** Order IDs shall be validated as follows:

- Must be numeric
- Duplicates are automatically incremented
- Range: 1 to 9999

**Acceptance Criteria:**
- Non-numeric values are rejected
- Duplicate detection works correctly
- Auto-increment maintains uniqueness

#### DR-6.2.2 Task Name Validation
**Requirement:** Task names shall be validated as follows:

- Must be non-empty string
- Maximum length: 500 characters
- Special characters allowed
- Leading/trailing whitespace trimmed

**Acceptance Criteria:**
- Empty strings are rejected
- Long names are validated
- Special characters do not cause issues

#### DR-6.2.3 Time Format Validation
**Requirement:** Time values shall be validated as follows:

- Format: HH:MM (24-hour)
- Hours: 00-23
- Minutes: 00-59
- Leading zeros required

**Acceptance Criteria:**
- Invalid formats are rejected
- Validation errors provide clear messages
- Parsing handles edge cases (00:00, 23:59)

#### DR-6.2.4 Duration Validation
**Requirement:** Duration values shall be validated as follows:

- Must be greater than zero
- Format: HH:MM
- Maximum: 23:59
- Negative values are rejected

**Acceptance Criteria:**
- Zero durations are rejected
- Negative durations are rejected
- Valid durations are correctly parsed

---

### 6.3 Data Storage

#### DR-6.3.1 IndexedDB Schema
**Requirement:** IndexedDB shall use the following schema:

- **Database Name**: taskSchedulerDB
- **Version**: 1
- **Object Store**: tasks
  - **keyPath**: id
  - **Index**: orderId (unique: false)

**Acceptance Criteria:**
- Database initializes on first use
- Schema upgrades handle version changes
- Indexes improve query performance
- Transactions ensure data consistency

#### DR-6.3.2 LocalStorage Keys
**Requirement:** localStorage shall use the following keys:

- `estimatedStartTime`: Schedule start time
- `taskOrder`: JSON array of task IDs
- `importHistory`: JSON object with import metadata

**Acceptance Criteria:**
- Keys are consistently named
- Values are properly serialized
- No localStorage quota exceeded
- Data persists across sessions

---

### 6.4 Data Migration

#### DR-6.4.1 Version Compatibility
**Requirement:** The system shall handle data from previous versions gracefully.

**Acceptance Criteria:**
- Old data formats are detected
- Migration logic transforms old data
- No data loss during migration
- Fallback to defaults if migration fails

#### DR-6.4.2 Data Export
**Requirement:** Users shall be able to clear all application data via browser tools.

**Acceptance Criteria:**
- Browser's clear site data removes all tasks
- localStorage clear removes configuration
- Application resets to initial state after clear
- No residual data remains

---

## 7. Integration Requirements

### 7.1 Excel Integration

#### IR-7.1.1 SheetJS Library
**Requirement:** The application shall use SheetJS library for Excel parsing.

**Acceptance Criteria:**
- Library version: xlsx.full.min.js
- Bundled locally (no CDN dependency)
- Supports .xlsx format
- Binary data handling works correctly

#### IR-7.1.2 File API
**Requirement:** The application shall use browser File API for file reading.

**Acceptance Criteria:**
- FileReader API reads .xlsx files
- Binary data is correctly handled
- Progress events are monitored
- Error events are caught

---

### 7.2 Browser API Integration

#### IR-7.2.1 IndexedDB API
**Requirement:** The application shall use IndexedDB API for persistent storage.

**Acceptance Criteria:**
- API availability is detected
- Database operations use transactions
- Errors are handled gracefully
- Async operations are properly managed

#### IR-7.2.2 LocalStorage API
**Requirement:** The application shall use localStorage API for configuration storage.

**Acceptance Criteria:**
- API availability is detected
- Quota errors are handled
- JSON serialization/deserialization works
- Fallback exists if unavailable

#### IR-7.2.3 Drag-and-Drop API
**Requirement:** The application shall use HTML5 Drag-and-Drop API.

**Acceptance Criteria:**
- Desktop events: dragstart, dragover, drop, dragend
- Mobile events: touchstart, touchmove, touchend
- DataTransfer object is used correctly
- Event defaults are properly prevented

---

## 8. Constraints and Assumptions

### 8.1 Technical Constraints

#### C-8.1.1 Browser Limitations
- Application requires browsers with IndexedDB support
- File API must be available
- JavaScript must be enabled
- LocalStorage must be available

#### C-8.1.2 Storage Limitations
- IndexedDB quota varies by browser (typically 50MB+)
- LocalStorage limited to 5-10MB per origin
- No server-side storage available
- Data is device-specific

#### C-8.1.3 Performance Limitations
- Large task lists (>100 tasks) may impact performance
- Excel file parsing is CPU-intensive
- Complex calculations block UI thread
- Mobile devices have reduced performance

---

### 8.2 Business Constraints

#### C-8.2.1 Deployment
- Must deploy as static files only
- No backend infrastructure available
- No database server available
- No user authentication system

#### C-8.2.2 Support
- Application is single-user only
- No collaboration features
- No cloud synchronization
- No cross-device data sharing

---

### 8.3 Assumptions

#### A-8.3.1 User Assumptions
- Users have basic computer literacy
- Users understand Excel spreadsheet format
- Users have compatible browsers
- Users accept local-only data storage

#### A-8.3.2 Data Assumptions
- Excel files follow expected three-column format
- Task durations are reasonable (<24 hours)
- Task names are reasonably short (<500 chars)
- Users manage their own data backups

#### A-8.3.3 Usage Assumptions
- Typical use case: 10-50 tasks
- Maximum use case: 100 tasks
- Single user per browser profile
- Infrequent imports (not real-time)

---

## 9. Success Criteria

### 9.1 Functional Success
- All functional requirements (FR-3.x) are implemented and tested
- Excel import works with valid .xlsx files
- Drag-and-drop reordering works on desktop and mobile
- Time calculations are accurate across all scenarios
- Data persists correctly across sessions

### 9.2 Performance Success
- Page load < 3 seconds on 3G
- Import 20 tasks < 5 seconds
- Recalculate 100 tasks < 1 second
- Drag operations maintain 60fps
- Smooth scrolling with 100 tasks

### 9.3 Usability Success
- Responsive on screen sizes 320px-2560px
- Touch-friendly on mobile devices
- Clear error messages for all failure scenarios
- Intuitive workflow requires no documentation
- Professional visual design

### 9.4 Reliability Success
- No data loss during normal operations
- Graceful error recovery
- Works offline after initial load
- Compatible with target browsers
- No critical bugs in production

---

## 10. Out of Scope

The following features are explicitly **out of scope** for the current version:

- User authentication and accounts
- Cloud storage and synchronization
- Multi-user collaboration
- Real-time updates
- Task dependencies and critical path analysis
- Gantt chart visualization
- Excel export functionality
- Task categories and tags
- Task filtering and search
- Undo/redo functionality
- Keyboard shortcuts
- Print stylesheet
- Mobile app versions (native iOS/Android)
- PWA features (service workers, app manifest)
- Email notifications
- Integration with project management tools
- Advanced time zone support
- Recurring tasks
- Task templates

---

## 11. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-26 | System | Initial master functional requirements document created |

---

## 12. Automated Testing

### 12.1 Test Suite Overview
The application includes a comprehensive automated test suite with 141 tests covering all critical functionality through unit and integration testing.

### 12.2 Test Coverage Requirements

#### 12.2.1 Coverage Thresholds
- **Minimum Statement Coverage**: 75%
- **Minimum Branch Coverage**: 75%
- **Minimum Function Coverage**: 60%
- **Current Achievement**: 87.85% statements, 95.45% branches, 75% functions

#### 12.2.2 Tested Components
All critical business logic modules must maintain test coverage:
- TimeUtils (time parsing and calculations)
- Task Model (data validation and serialization)
- TaskCalculator (schedule calculations)
- StorageService (data persistence)
- ExcelImporter (file parsing and validation)
- ResetButton (UI component logic)

### 12.3 Test Execution

#### 12.3.1 Test Commands
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:ui       # Interactive UI
npm run coverage      # Generate coverage report
npm run test:ci       # CI mode with verbose output
```

#### 12.3.2 Test Types

**Unit Tests** (87 tests)
- Individual module testing in isolation
- Fast execution (< 1 second)
- Mock external dependencies
- Located in `tests/unit/`

**Integration Tests** (54 tests)
- Complete workflow testing
- Multi-component interaction
- End-to-end data flow validation
- Located in `tests/integration/`

#### 12.3.3 Test Workflows Covered
1. **Excel Import Workflow**: File upload → parse → validate → store → display
2. **Task Reordering Workflow**: Drag → drop → recalculate times → persist
3. **Time Update Workflow**: Change start time → recalculate all → save
4. **Database Reset Workflow**: Confirm → clear data → update UI → callback

### 12.4 Continuous Integration

#### 12.4.1 CI Requirements
- Tests must pass in Node.js 18+ environment
- All tests must execute successfully offline (no network dependencies)
- Test suite must complete in under 10 seconds
- Coverage thresholds must be met

#### 12.4.2 GitHub Actions Integration
A sample CI workflow is provided at `.github/workflows/test.yml` that:
- Runs tests on multiple Node.js versions (18.x, 20.x)
- Generates coverage reports
- Uploads coverage artifacts
- Fails build if tests fail or coverage drops below threshold

### 12.5 Test Maintenance

#### 12.5.1 Adding New Tests
When adding new functionality:
1. Write unit tests first (TDD approach)
2. Ensure new code meets coverage thresholds
3. Add integration tests for new workflows
4. Update test documentation

#### 12.5.2 Test Quality Standards
All tests must:
- Follow AAA pattern (Arrange, Act, Assert)
- Have descriptive names explaining what they verify
- Be independent (no test dependencies)
- Clean up after execution (proper teardown)
- Execute quickly (< 100ms per unit test)

### 12.6 Viewing Coverage Reports
After running `npm run coverage`, open `coverage/index.html` in a browser to view:
- Line-by-line coverage highlighting
- Function coverage details
- Branch coverage analysis
- File-level coverage metrics

For detailed test documentation, see `tests/README.md`.

---

## 13. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Manager | | | |
| Technical Lead | | | |
| QA Lead | | | |

---

**END OF DOCUMENT**

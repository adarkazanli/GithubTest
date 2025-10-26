# Feature Specification: Task Scheduler

**Feature Branch**: `001-task-scheduler`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "this application will ingest an excel spreadsheet consistant of three columns: order id, task name, estimated time of completion.  The data will be displayed on the screen, we should be able to change the order of the tasks by drag and drop.  The UI must have an estimated start time and the task start time and end time for each will be calculated and displayed.  When changing the order of the tasks, the task start time and task end times will be recalculated."

## Clarifications

### Session 2025-01-27

- Q: What is the time unit for estimated duration? → A: Hours and minutes in HH:MM format (e.g., 2:30 for 2 hours 30 minutes)
- Q: How should system handle invalid or missing data in Excel import? → A: Skip invalid rows, display summary of valid vs invalid rows imported
- Q: How should system handle zero or negative durations? → A: Auto-correct negative to zero during import, reject zero durations and skip those rows
- Q: How should system handle duplicate order IDs? → A: Auto-increment duplicate order IDs to make them unique
- Q: How should new Excel import handle existing tasks? → A: Merge new data with existing tasks (append new tasks, preserve manual order)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Import Excel and View Task Schedule (Priority: P1)

A user imports an Excel spreadsheet containing task data and immediately sees a visual schedule showing all tasks with calculated start and end times based on their estimated durations.

**Why this priority**: This is the core functionality - users cannot use the application without being able to load and view their task data with calculated timings.

**Independent Test**: Can be fully tested by importing an Excel file and verifying that tasks are displayed with calculated start/end times without needing any reordering functionality.

**Acceptance Scenarios**:

1. **Given** a user has an Excel file with task data, **When** they import the file, **Then** all tasks are displayed on screen with their names and calculated start/end times
2. **Given** a user imports a file with 5 tasks, **When** they view the schedule, **Then** each task shows its estimated duration and calculated start/end times
3. **Given** the first task has duration of 2 hours and estimated start is 9:00 AM, **When** the schedule is displayed, **Then** task 1 shows start time 9:00 AM and end time 11:00 AM

---

### User Story 2 - Reorder Tasks via Drag and Drop (Priority: P2)

A user can reorder tasks by dragging and dropping, and all calculated start and end times automatically update to reflect the new sequence.

**Why this priority**: This is the primary interactive feature that enables users to optimize their schedule by adjusting task order without manually editing data.

**Independent Test**: Can be fully tested by importing a file and then dragging a task to a new position, verifying that the task moves and all times recalculate correctly.

**Acceptance Scenarios**:

1. **Given** a schedule is displayed, **When** a user drags task 2 to position 1, **Then** task 2 is now first and all tasks have recalculated start/end times
2. **Given** a user reorders tasks from [A,B,C] to [C,A,B], **When** they complete the drag operation, **Then** the display updates to show C first with its times calculated from the start time, followed by A and B with sequential timing
3. **Given** tasks are being reordered, **When** the user drags a task to a new position, **Then** visual feedback shows the drop target location and times update immediately upon completion

---

### User Story 3 - Adjust Estimated Start Time (Priority: P3)

A user can change the estimated start time for the entire schedule, and all task start and end times automatically recalculate based on the new starting point.

**Why this priority**: This feature provides flexibility for users to see how different start times affect their entire schedule, enabling better planning.

**Independent Test**: Can be fully tested by importing tasks and changing the estimated start time, verifying that all tasks maintain their relative timing but shift to the new start point.

**Acceptance Scenarios**:

1. **Given** a schedule starts at 9:00 AM, **When** a user changes the estimated start to 10:00 AM, **Then** all task start and end times shift forward by 1 hour
2. **Given** tasks have been reordered manually, **When** the user changes the estimated start time, **Then** the current task order is preserved but all times recalculate from the new start
3. **Given** a user changes start time to 8:00 AM, **When** the schedule updates, **Then** the first task shows 8:00 AM as its start time

### Edge Cases

- **Invalid/missing data**: When Excel file has missing or invalid data in required columns, system skips those rows and displays a summary of valid vs invalid rows imported
- **Large files**: System handles very large Excel files with hundreds of tasks (performance targets apply)
- **Zero/negative durations**: Negative values are auto-corrected to zero; zero durations are rejected and those rows are skipped during import
- **Duplicate order IDs**: Duplicate order IDs are auto-incremented to ensure each task has a unique identifier
- **Past start time**: What happens when estimated start time is changed to a time in the past?
- **Long durations**: How does system handle tasks with very long estimated durations (days/weeks)?
- **New file import**: New Excel import merges data with existing tasks (appends new tasks, preserves existing manual order and schedule settings)
- **Additional columns**: How does system handle Excel files with additional columns that aren't used?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept Excel spreadsheets (.xlsx format) containing three columns: order id, task name, estimated time of completion (in HH:MM format)
- **FR-002**: System MUST parse and extract data from all rows in the Excel file
- **FR-002a**: System MUST validate that estimated time values are in HH:MM format and skip rows with invalid time formats
- **FR-002c**: System MUST auto-correct negative duration values to zero and then reject rows with zero duration (skip those rows)
- **FR-002d**: System MUST auto-increment duplicate order IDs to ensure each task has a unique order identifier
- **FR-002b**: System MUST display an import summary showing number of valid rows imported and number of invalid rows skipped
- **FR-003**: System MUST display all imported tasks in a list or grid view on screen
- **FR-004**: System MUST provide a user interface element to set the estimated start time for the entire schedule
- **FR-005**: System MUST calculate start time for each task based on: estimated start time plus cumulative duration of all preceding tasks in current order
- **FR-006**: System MUST calculate end time for each task as: task start time plus task estimated duration
- **FR-007**: System MUST display for each task: task name, start time, end time, and estimated duration
- **FR-007a**: System MUST allow users to add, edit, and display notes for each task
- **FR-007b**: System MUST persist task notes in browser storage and restore them on page reload
- **FR-008**: System MUST allow users to reorder tasks by drag and drop interaction
- **FR-009**: System MUST recalculate all task start and end times whenever tasks are reordered via drag and drop
- **FR-010**: System MUST recalculate all task start and end times whenever the estimated start time is changed
- **FR-011**: System MUST provide visual feedback during drag and drop operations to show where the task will be placed
- **FR-012**: System MUST preserve the task order in persistent storage (local browser storage)
- **FR-013**: System MUST maintain data integrity when browser is closed and reopened (retrieve tasks and current order from storage)
- **FR-014**: System MUST handle import of new Excel files, merging new data with existing tasks (append new tasks while preserving existing manual order)

### Key Entities *(include if feature involves data)*

- **Task**: Represents a single work item with orderId (sequence identifier), taskName (descriptive name), estimatedDuration (time to complete in HH:MM format, e.g., 2:30 for 2 hours 30 minutes), and notes (optional user-entered text for additional context). Tasks are displayed in chronological order with calculated start and end times.
- **Schedule**: Contains the estimatedStartTime (user-configured start point for entire schedule in HH:MM format) and maintains the current order of all tasks. The schedule determines how times are calculated for all tasks.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can import an Excel file with 20 tasks and see all tasks displayed with calculated start/end times within 5 seconds
- **SC-002**: Users can reorder any task to any position in the list via drag and drop with visual feedback during the operation
- **SC-003**: When a task is moved to a new position, all affected tasks have their times recalculated and displayed accurately (task X moved from position 5 to 2 should result in correct sequential timing)
- **SC-004**: Users can change the estimated start time and see all task times update automatically within 1 second
- **SC-005**: Users can import a new Excel file and immediately see the new task schedule without manual refresh or page reload
- **SC-006**: Imported task data persists when user closes and reopens the browser (retrieved from local storage)
- **SC-007**: The interface responds to drag and drop interactions smoothly on both desktop and mobile devices
- **SC-008**: Users can view schedules containing at least 100 tasks with scrollable display without performance degradation

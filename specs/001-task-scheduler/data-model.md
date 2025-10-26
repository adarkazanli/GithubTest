# Data Model: Task Scheduler

**Date**: 2025-01-27  
**Feature**: Task Scheduler

## Overview

The application manages two primary data entities:
1. **Task**: Represents a single task with its attributes and calculated times
2. **Schedule**: Manages the collection of tasks, their order, and schedule settings

## Task Entity

### Definition

A **Task** represents a single work item with the following properties:

```javascript
{
  id: string,                    // Unique identifier (generated on import)
  orderId: number,               // Original order from Excel (may be adjusted if duplicates)
  taskName: string,              // Name/description of the task
  estimatedDuration: string,      // Duration in HH:MM format (e.g., "2:30")
  notes: string,                 // User-entered notes about the task (optional)
  calculatedStartTime: Date,     // Calculated start time (based on schedule)
  calculatedEndTime: Date,        // Calculated end time (start + duration)
}
```

### Properties

**id**
- Type: `string`
- Purpose: Unique identifier for each task instance
- Generation: UUID or timestamp-based ID on import
- Usage: Used for drag-and-drop tracking and DOM element references

**orderId**
- Type: `number`
- Purpose: Original sequence identifier from Excel import
- Auto-increment: If Excel contains duplicate order IDs, system auto-increments to ensure uniqueness
- Notes: May not match display order after user reordering

**taskName**
- Type: `string`
- Purpose: Descriptive name of the task
- Source: Directly from Excel "task name" column
- Required: Yes

**estimatedDuration**
- Type: `string`
- Format: `"H:MM"` or `"HH:MM"` (e.g., "2:30", "12:45")
- Purpose: Estimated time to complete the task in hours and minutes
- Source: Excel "estimated time of completion" column
- Validation: Must be valid HH:MM format, converted to minutes for calculations
- Rejected if: Zero duration ("0:00") - row skipped during import

**notes**
- Type: `string`
- Purpose: User-entered notes and observations about the task
- Source: User input via UI (editable text field)
- Required: No (empty string if no notes)
- Storage: Persisted in IndexedDB with task data
- Usage: Allow users to add context, reminders, or details about each task

**calculatedStartTime**
- Type: `Date`
- Purpose: Start time for the task based on schedule settings and previous tasks
- Calculation: `estimatedStartTime + sum of all preceding task durations in current order`
- Update triggers: Drag-and-drop reordering, estimated start time change

**calculatedEndTime**
- Type: `Date`
- Purpose: End time for the task
- Calculation: `calculatedStartTime + estimatedDuration`
- Update triggers: Same as calculatedStartTime

## Schedule Entity

### Definition

A **Schedule** represents the entire task schedule with configuration and task collection:

```javascript
{
  estimatedStartTime: string,     // User-configured start time in HH:MM
  taskOrder: string[],           // Array of task IDs in display order
  importHistory: {                // Summary of last import
    validRows: number,
    invalidRows: number,
    fileName: string,
    importDate: Date
  }
}
```

### Properties

**estimatedStartTime**
- Type: `string`
- Format: `"HH:MM"` (24-hour format, e.g., "09:00", "14:30")
- Purpose: Base start time for the entire schedule
- Storage: localStorage key `'estimatedStartTime'`
- Validation: Must be valid HH:MM format
- Default: "09:00" (9:00 AM)

**taskOrder**
- Type: `string[]` (array of task IDs)
- Purpose: Maintains the current display order of tasks
- Storage: IndexedDB or localStorage
- Initial value: Ordered by original orderId from Excel
- Updates: Modified by drag-and-drop operations
- Persistence: Saved to browser storage on every change

**importHistory**
- Type: `object`
- Purpose: Tracks last import operation for user feedback
- Storage: localStorage
- Properties:
  - `validRows`: number of successfully imported tasks
  - `invalidRows`: number of rejected rows
  - `fileName`: name of the imported Excel file
  - `importDate`: timestamp of import

## Data Validation Rules

### Excel Import Validation

1. **Column Structure**: Excel must have exactly 3 columns (order id, task name, estimated time)
2. **Order ID**: Must be a number (duplicates auto-incremented)
3. **Task Name**: Must be a non-empty string
4. **Estimated Duration**: Must be valid HH:MM format (e.g., "2:30")
5. **Zero Duration**: Rows with "0:00" duration are rejected
6. **Negative Duration**: Auto-corrected to "0:00", then rejected

### Runtime Validation

1. **Start Time Format**: Must be valid HH:MM format
2. **Time Calculations**: End time must be after start time
3. **Task Order**: Array must contain valid task IDs only

## Storage Architecture

### IndexedDB (Task Data)

**Database Name**: `taskSchedulerDB`  
**Version**: 1  
**Store Name**: `tasks`

**Structure**:
```
tasks (ObjectStore)
├── id (primary key)
├── orderId
├── taskName
├── estimatedDuration
├── notes
├── calculatedStartTime
└── calculatedEndTime
```

**Operations**:
- `add(task)`: Add new task
- `get(id)`: Retrieve task by ID
- `getAll()`: Retrieve all tasks
- `update(task)`: Update existing task
- `delete(id)`: Delete task
- `clear()`: Remove all tasks

### localStorage (Schedule Configuration)

**Keys**:
- `estimatedStartTime`: HH:MM string
- `taskOrder`: JSON stringified array of task IDs
- `importHistory`: JSON stringified import summary

### Data Flow

1. **Import**: Excel → Validate → Create Task objects → Store in IndexedDB → Update taskOrder
2. **Display**: Read taskOrder → Load tasks from IndexedDB → Calculate times → Render UI
3. **Reorder**: User drags task → Update taskOrder → Recalculate times → Update IndexedDB → Re-render
4. **Change Start Time**: Update estimatedStartTime in localStorage → Recalculate all times → Update IndexedDB → Re-render

## Data Relationships

### Task-to-Schedule Relationship

- Schedule contains ordered array of task IDs (`taskOrder`)
- Task IDs reference actual Task objects in IndexedDB
- Order determines time calculation sequence (preceding tasks sum up durations)

### Time Calculation Dependency Graph

```
estimatedStartTime (Schedule)
         +
         │
         ▼
   Task[0] (first in order)
         +
         │ estimatedDuration
         ▼
   Task[1] (second in order)
         +
         │ estimatedDuration
         ▼
   Task[2] (third in order)
         ...
```

**Key Rule**: Each task's calculatedStartTime = sum of estimatedStartTime + all preceding task durations

## Edge Case Handling

### Duplicate Order IDs

**Input**: Excel with rows: [1, Task A], [2, Task B], [1, Task C]  
**Processing**: Auto-increment third row's orderId from 1 to 3  
**Result**: Task list: [1, Task A], [2, Task B], [3, Task C]

### Merging Excel Imports

**Scenario**: Existing tasks [A, B, C], new import [D, E, F]  
**Behavior**: Append new tasks to existing, preserve current order  
**Result**: Final list: [A, B, C, D, E, F]  
**Note**: Schedule settings (estimatedStartTime) preserved

### Time Overflow (Past Midnight)

**Scenario**: Task starts at 22:00 with 3:00 duration  
**Calculation**: Start 22:00, End 01:00 (next day)  
**Display**: Show both date and time for multi-day schedules


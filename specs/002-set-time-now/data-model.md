# Phase 1: Data Model - Set Time to Now Button

**Feature**: 002-set-time-now
**Date**: 2025-11-01
**Purpose**: Define data structures and state management for "Set to Now" button feature

## Overview

This feature does **not introduce new data entities**. It operates on existing data structures and adds a new UI interaction pattern for setting the `estimatedStartTime` value.

## Existing Data Model (No Changes Required)

### Start Time (Existing)

**Location**: `localStorage` key `estimatedStartTime`
**Format**: String in HH:MM format (24-hour)
**Example**: `"14:30"`

**Current Access Patterns**:
- Read: `storageService.getEstimatedStartTime()` → Returns string or default "09:00"
- Write: `storageService.setEstimatedStartTime(timeString)` → Persists to localStorage

**New Access Pattern Added by This Feature**:
- Write via "Set to Now" button: Captures `new Date()`, formats to HH:MM, writes via existing `setEstimatedStartTime()`

### Task (Existing)

**Location**: IndexedDB object store `tasks`
**Structure**: Task class instances with properties:
- `id`: String (UUID)
- `orderId`: Number
- `taskName`: String
- `estimatedDuration`: Number (minutes)
- `startTime`: String (HH:MM) - calculated value
- `endTime`: String (HH:MM) - calculated value
- `notes`: String

**Current Behavior**:
- When `estimatedStartTime` changes, all tasks are recalculated by `TaskCalculator.calculateTimes()`
- `startTime` and `endTime` are derived values based on `estimatedStartTime` and task durations

**No Changes**: This feature triggers existing recalculation logic, does not modify Task structure

## State Management

### UI State

**Loading State** (Existing):
- **Element**: `document.body`
- **Class**: `loading`
- **Purpose**: Indicates Excel import operation in progress
- **Managed By**: `showLoadingState(loading)` function in `main.js`

**Usage by This Feature**:
- "Set to Now" button checks for `loading` class before executing
- If `loading` class present, button action is no-op (silently ignored)

### Button State

**New Button Element**:
```html
<button id="set-to-now-btn" type="button">Set to Now</button>
```

**State Transitions**:
```
[Enabled] --user clicks--> [Execute setToNow()] --> [Enabled]
            |
            |--if loading class present--> [No-op, remain Enabled]
```

**Note**: Button does NOT transition to disabled state during recalculation (per FR-009). Visual feedback via CSS only.

## Data Flow

### Set to Now Operation

```
User clicks "Set to Now" button
  ↓
Check if import in progress (body.loading class)
  ↓ (if not loading)
Capture current time: new Date()
  ↓
Format to HH:MM: TimeUtils.formatDateToTime(now)
  ↓
Update UI: document.getElementById('estimated-start-time').value = formatted
  ↓
Trigger validation & persistence: handleStartTimeChange()
  ↓
  ├─> Validate: TimeUtils.isValidTimeFormat(timeString)
  ├─> Persist: storageService.setEstimatedStartTime(timeString)
  └─> Recalculate: recalculateAndRender()
        ↓
        ├─> TaskCalculator.calculateTimes(tasks, newStartTime)
        ├─> storageService.saveTasks(tasks)
        └─> renderTasks()
```

### Edge Case: Midnight Rollover

**Scenario**: Current time is 23:58, tasks extend past midnight

**Data Handling**:
- `TimeUtils.addMinutes()` already handles 24-hour wraparound (line 122-133 in TimeUtils.js)
- Times like "00:15", "00:45" are valid HH:MM strings
- No special handling required in this feature

**Example**:
```javascript
// Current time: 23:58
// Task 1: 30 minutes → startTime: "23:58", endTime: "00:28" (next day)
// Task 2: 45 minutes → startTime: "00:28", endTime: "01:13" (next day)
```

## Validation Rules

### Time Format Validation (Existing)

**Function**: `TimeUtils.isValidTimeFormat(timeStr)`
**Rules**:
- Must match regex: `/^(\d{1,2}):(\d{2})$/`
- Hours: 0-23
- Minutes: 0-59

**When Applied**:
- Before persisting new start time via `handleStartTimeChange()`

**Guaranteed Valid**: Time captured from `new Date()` and formatted by `TimeUtils.formatDateToTime()` will always pass validation

### Zero Duration Check (Not Applicable)

This feature does not create or modify tasks, so zero-duration validation is not relevant.

## Storage Schema

**No schema changes required**. Feature uses existing storage keys and structures:

### localStorage Keys (Existing)

| Key | Type | Example | Modified By Feature |
|-----|------|---------|---------------------|
| `estimatedStartTime` | String (HH:MM) | `"14:30"` | ✅ Yes (via handleStartTimeChange) |
| `taskOrder` | JSON Array | `["uuid1", "uuid2"]` | ❌ No |
| `importHistory` | JSON Object | `{validRows: 10, ...}` | ❌ No |

### IndexedDB Object Stores (Existing)

| Store | Key Path | Modified By Feature |
|-------|----------|---------------------|
| `tasks` | `id` | ❌ No (only recalculated) |

## Relationships

```
[User Click] --triggers--> [Set to Now Handler]
                                  |
                                  v
                           [Capture & Format Time]
                                  |
                                  v
                           [Update estimatedStartTime]
                                  |
                                  +--affects--> [All Tasks (recalculation)]
                                  |
                                  +--persists--> [localStorage]
```

## Data Integrity

### Concurrent Modifications

**Scenario**: User clicks "Set to Now" while import is in progress

**Protection**:
- Check `body.loading` class before proceeding
- If loading, return early (no-op)
- Prevents race condition between import and time update

**Scenario**: User clicks "Set to Now" multiple times rapidly

**Behavior** (per clarification):
- Each click triggers new recalculation
- No debouncing or queueing
- Most recent click "wins" (overwrites previous values)
- May cause flickering but no data corruption

### Data Consistency

**Guarantee**: All task times are derived from `estimatedStartTime`
- Single source of truth: localStorage `estimatedStartTime` value
- Recalculation uses consistent logic: `TaskCalculator.calculateTimes()`
- No partial updates possible (recalculation is synchronous)

## Summary

This feature is **data-light**:
- ✅ No new entities
- ✅ No schema changes
- ✅ No new storage keys
- ✅ Reuses existing validation and persistence logic
- ✅ Operates on existing `estimatedStartTime` string value

**Primary interaction**: UI trigger → capture time → format → persist via existing functions

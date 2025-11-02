# UI Contract: Set to Now Button

**Feature**: 002-set-time-now
**Date**: 2025-11-01
**Type**: Client-side UI Contract

## Overview

This document defines the interface contract between the "Set to Now" button UI component and the application's time management system.

## DOM Contract

### HTML Structure

**Required Elements**:

```html
<!-- Existing element - DO NOT MODIFY -->
<input type="text" id="estimated-start-time" value="09:00" pattern="\d{2}:\d{2}" placeholder="HH:MM" />

<!-- New element - ADD THIS -->
<button id="set-to-now-btn" type="button" aria-label="Set estimated start time to current time">
  Set to Now
</button>

<!-- Existing element - REFERENCE ONLY -->
<button id="update-time-btn">Update Times</button>
```

**Element Contracts**:

| Element ID | Type | Purpose | Interaction |
|------------|------|---------|-------------|
| `set-to-now-btn` | `<button>` | Trigger "set to now" action | Click event listener |
| `estimated-start-time` | `<input>` | Display/edit start time | Value updated by button |
| `update-time-btn` | `<button>` | Manual time update trigger | Reference for styling |

### CSS Contract

**Required Classes/Styles**:

```css
#set-to-now-btn {
  /* Minimum touch target size */
  min-height: 44px;
  min-width: 44px;
  padding: 0.5rem 1rem;

  /* Typography */
  font-size: 1rem;

  /* Mobile optimization */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

/* Active state feedback (required per FR-010) */
#set-to-now-btn:active {
  transform: scale(0.98);
  opacity: 0.8;
  transition: all 0.1s ease;
}

/* Focus indicator (required per FR-008) */
#set-to-now-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

/* Disabled state (during imports per FR-013) */
#set-to-now-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

## JavaScript API Contract

### Function Signature

```javascript
/**
 * Handle "Set to Now" button click
 * Captures current system time and sets it as estimated start time
 *
 * @returns {void}
 *
 * @fires handleStartTimeChange - Triggers existing time change handler
 *
 * @sideEffects
 * - Updates #estimated-start-time input value
 * - Persists time to localStorage
 * - Recalculates all task times
 * - Re-renders task list
 *
 * @preconditions
 * - TimeUtils module must be imported
 * - handleStartTimeChange function must be defined
 * - DOM elements #estimated-start-time and #set-to-now-btn must exist
 *
 * @postconditions
 * - Input field displays current time in HH:MM format
 * - localStorage['estimatedStartTime'] updated
 * - All tasks have new calculated start/end times
 *
 * @performance
 * - Target: < 100ms execution time
 * - Synchronous operation
 */
function handleSetToNowClick() {
  // Implementation defined in main.js
}
```

### Event Listener Contract

```javascript
/**
 * Setup: Register event listener in init() function
 */
const setToNowBtn = document.getElementById('set-to-now-btn');
if (setToNowBtn) {
  setToNowBtn.addEventListener('click', handleSetToNowClick);
}

/**
 * Teardown: No cleanup required (page-level listener)
 */
```

### State Management Contract

```javascript
/**
 * Button State Check
 *
 * @returns {boolean} - true if operation should proceed
 */
function canExecuteSetToNow() {
  // Check 1: Import operation in progress?
  const isImporting = document.body.classList.contains('loading');

  return !isImporting;
}
```

## Integration Contracts

### Integration with StorageService

**Contract**: Use existing `setEstimatedStartTime` method

```javascript
// Input: String in HH:MM format
// Output: void (persists to localStorage)
storageService.setEstimatedStartTime(timeString);
```

**Guarantees**:
- Time string is validated before calling this method
- Persistence is synchronous
- Value survives page refresh

### Integration with TimeUtils

**Contract**: Use existing `formatDateToTime` method

```javascript
// Input: Date object
// Output: String in HH:MM format
const formatted = TimeUtils.formatDateToTime(new Date());

// Example: new Date('2025-11-01T14:30:00') → "14:30"
```

**Guarantees**:
- Output always matches HH:MM format
- Hours are zero-padded if needed
- Minutes are always 2 digits

### Integration with TaskCalculator

**Contract**: Trigger via existing `handleStartTimeChange` function

```javascript
// Sequence:
// 1. Validate time format
// 2. Persist to storage
// 3. Call recalculateAndRender()
//    → TaskCalculator.calculateTimes(tasks, newStartTime)
//    → storageService.saveTasks(tasks)
//    → renderTasks()
```

**Guarantees**:
- All tasks recalculated atomically
- UI updates after recalculation completes
- No partial updates visible to user

## Accessibility Contract

### Keyboard Navigation

**Required Behavior**:
- Button is in tab order
- Enter key activates button
- Space key activates button
- Focus visible (outline) when navigated via keyboard

**Testing**:
```
Tab → Button receives focus (outline visible)
Enter → Executes handleSetToNowClick()
Space → Executes handleSetToNowClick()
```

### Screen Reader Announcements

**Required ARIA Attributes**:
```html
<button
  id="set-to-now-btn"
  type="button"
  aria-label="Set estimated start time to current time"
  aria-disabled="false"
>
  Set to Now
</button>
```

**Dynamic Updates**:
- When button disabled during import: `aria-disabled="true"`
- When button re-enabled: `aria-disabled="false"`

**Screen Reader Flow**:
1. User tabs to button: "Button, Set estimated start time to current time"
2. User activates: No announcement (action is immediate)
3. Time input field updates: "Input, estimated start time, [new time]"

## Error Handling Contract

### Error Scenarios

| Scenario | Expected Behavior | User Feedback |
|----------|-------------------|---------------|
| Import in progress | Silent no-op | None (button may appear disabled) |
| Invalid Date object | Should never occur | N/A (trust Date API) |
| TimeUtils.formatDateToTime fails | Should never occur | N/A (defensive check not required per spec) |
| localStorage full | Handled by StorageService | Existing error handling |

### Contract with Error Handling

```javascript
function handleSetToNowClick() {
  // Error case 1: Import in progress
  if (document.body.classList.contains('loading')) {
    return; // Silent early return
  }

  // Error case 2-4: Not applicable per research.md R1
  // Trust Date API and existing validation
}
```

## Performance Contract

### Timing Requirements

| Metric | Target | Measurement Point |
|--------|--------|-------------------|
| Click to input update | < 50ms | handleSetToNowClick() execution |
| Click to task recalculation | < 500ms | End of recalculateAndRender() |
| Total operation | < 1s | Success criterion SC-001 |

### Performance Budget

```javascript
// Estimated operation breakdown:
// - Date capture & format: ~5ms
// - Input field update: ~10ms
// - handleStartTimeChange validation: ~5ms
// - Storage persistence: ~20ms
// - Task recalculation: ~100-400ms (depends on task count)
// - Re-render: ~50-150ms (depends on task count)
// ----
// Total: ~190-590ms (well within 1s budget)
```

## Testing Contract

### Unit Test Coverage

**Required Tests**:
1. `handleSetToNowClick()` captures current time
2. `handleSetToNowClick()` formats time to HH:MM
3. `handleSetToNowClick()` updates input field value
4. `handleSetToNowClick()` calls handleStartTimeChange()
5. `handleSetToNowClick()` no-ops when loading class present
6. Button has correct ARIA attributes
7. Button is keyboard accessible

### Integration Test Coverage

**Required Tests**:
1. End-to-end: Click button → time updates → tasks recalculate → UI renders
2. Midnight rollover: Time near midnight produces correct next-day times
3. Rapid clicks: Multiple rapid clicks don't cause errors
4. Import interaction: Button disabled during import, enabled after

## Version Compatibility

**Browser Support**:
- Chrome 90+ (Date API, ES6+)
- Firefox 88+ (Date API, ES6+)
- Safari 14+ (Date API, ES6+)
- Mobile Safari iOS 14+
- Chrome Android 90+

**Breaking Changes**:
- None expected (uses stable browser APIs)

## Summary

This contract defines:
- ✅ DOM structure and IDs
- ✅ CSS requirements for accessibility and feedback
- ✅ JavaScript API signatures and behavior
- ✅ Integration points with existing services
- ✅ Accessibility requirements
- ✅ Error handling expectations
- ✅ Performance targets
- ✅ Testing requirements

**Compliance**: All requirements mapped to functional requirements (FR-001 through FR-013) and success criteria (SC-001 through SC-005).

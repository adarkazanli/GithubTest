# Phase 0: Research - Set Time to Now Button

**Feature**: 002-set-time-now
**Date**: 2025-11-01
**Purpose**: Research technical decisions and best practices for implementing the "Set to Now" button

## Research Questions

### R1: Button State Management During Import Operations

**Decision**: Hook into existing loading state management via `document.body.classList.contains('loading')`

**Rationale**:
- Existing codebase already tracks import state using the `loading` class on `<body>` element
- `showLoadingState(loading)` function in `main.js:427-434` adds/removes this class
- ResetButton component uses similar pattern with `isImportInProgress` callback (line 66)
- Consistent with established patterns in the codebase
- No additional state management required

**Alternatives Considered**:
- **Global import flag variable**: Rejected because it duplicates existing loading state and requires additional coordination
- **Event-based pub/sub**: Rejected as over-engineered for single button, adds unnecessary complexity
- **Disable all buttons during import**: Rejected because spec only requires disabling "Set to Now" button

**Implementation Approach**:
```javascript
// Check if import in progress before executing
function handleSetToNow() {
  if (document.body.classList.contains('loading')) {
    return; // Silently ignore if import in progress
  }
  // ... proceed with setting time
}

// In init, setup MutationObserver or check loading state when re-enabling
```

### R2: Time Formatting Best Practices

**Decision**: Use existing `TimeUtils.formatDateToTime()` utility for consistency

**Rationale**:
- `TimeUtils.js` already provides `formatDateToTime(date)` method that formats Date objects to HH:MM (line 52-60)
- Ensures consistent time formatting across the application
- Handles edge cases (invalid dates, padding zeros)
- Already tested and validated
- Spec requires HH:MM 24-hour format matching existing input field

**Alternatives Considered**:
- **Inline Date formatting**: Rejected to avoid code duplication and potential formatting inconsistencies
- **toLocaleTimeString()**: Rejected because it's locale-dependent and may not produce HH:MM format
- **Manual string manipulation**: Rejected as error-prone and redundant

**Implementation Approach**:
```javascript
import TimeUtils from './utils/TimeUtils.js';

function getCurrentTimeFormatted() {
  const now = new Date();
  return TimeUtils.formatDateToTime(now);
}
```

### R3: Button Accessibility Implementation

**Decision**: Follow WAI-ARIA button pattern with keyboard support and screen reader labels

**Rationale**:
- Success criterion SC-003 requires keyboard accessibility (Enter/Space keys)
- Functional requirement FR-008 mandates accessibility
- Standard `<button>` element provides built-in keyboard support
- Need explicit `aria-label` for screen readers since button text may be abbreviated
- Existing ResetButton component provides reference pattern (lines 29-69 in ResetButton.js)

**Alternatives Considered**:
- **Custom keyboard handlers**: Rejected because native `<button>` already handles Enter/Space
- **Div with role="button"**: Rejected as unnecessary and requires manual keyboard handling
- **Icon-only button**: Rejected because spec requires "Set to Now" label for discoverability

**Implementation Approach**:
```html
<button
  id="set-to-now-btn"
  type="button"
  aria-label="Set estimated start time to current time"
>
  Set to Now
</button>
```

### R4: Visual Feedback Patterns

**Decision**: Use CSS transition for brief highlight effect without disabling button

**Rationale**:
- Functional requirement FR-010 specifies visual feedback but NOT disabled state
- Clarification confirms each click should trigger recalculation (no debouncing per FR-009)
- CSS-only solution maintains responsiveness and avoids JavaScript state management
- Provides user confidence that click was registered without blocking interaction

**Alternatives Considered**:
- **Disabled state during processing**: Rejected per FR-009 (allow each click to trigger recalculation)
- **Loading spinner**: Rejected as overkill for sub-500ms operation
- **Ripple effect**: Considered but CSS transition is simpler and sufficient

**Implementation Approach**:
```css
#set-to-now-btn:active {
  transform: scale(0.98);
  opacity: 0.8;
  transition: all 0.1s ease;
}

#set-to-now-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}
```

### R5: Integration with Existing Time Change Logic

**Decision**: Reuse `handleStartTimeChange()` function to trigger recalculation

**Rationale**:
- Existing `handleStartTimeChange()` in `main.js:185-196` already handles:
  - Time validation via `TimeUtils.isValidTimeFormat()`
  - Storage persistence via `storageService.setEstimatedStartTime()`
  - Task recalculation via `recalculateAndRender()`
- Avoids code duplication and ensures consistent behavior
- Reduces risk of bugs from divergent logic paths
- Simpler to test and maintain

**Alternatives Considered**:
- **Duplicate recalculation logic**: Rejected to avoid code duplication and maintenance burden
- **New function that calls handleStartTimeChange**: Rejected as unnecessary wrapper
- **Direct manipulation of storage and recalculation**: Rejected as it bypasses validation

**Implementation Approach**:
```javascript
function handleSetToNowClick() {
  // Check if import in progress
  if (document.body.classList.contains('loading')) {
    return;
  }

  // Get current time formatted
  const now = new Date();
  const formattedTime = TimeUtils.formatDateToTime(now);

  // Update input field
  const startTimeInput = document.getElementById('estimated-start-time');
  startTimeInput.value = formattedTime;

  // Trigger existing time change handler
  handleStartTimeChange();
}
```

### R6: Mobile Touch Optimization

**Decision**: Use standard button with appropriate touch target size (min 44x44px)

**Rationale**:
- Constitution Principle IV requires mobile-first responsive design
- iOS/Android guidelines recommend 44x44px minimum touch target
- Standard `<button>` element handles touch events natively
- Existing button styles already mobile-optimized (can reference Update Times button)

**Alternatives Considered**:
- **Custom touch event handlers**: Rejected as unnecessary, native button handles touch
- **Larger button on mobile only**: Rejected in favor of consistent 44px minimum across all viewports
- **Touch ripple effect**: Deferred as enhancement, not required for MVP

**Implementation Approach**:
```css
#set-to-now-btn {
  min-height: 44px;
  min-width: 44px;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  touch-action: manipulation; /* Prevents double-tap zoom on iOS */
}
```

## Summary of Technical Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| State Management | Use existing `loading` class | Consistent with codebase patterns |
| Time Formatting | Reuse `TimeUtils.formatDateToTime()` | Avoid duplication, ensure consistency |
| Accessibility | Native `<button>` with ARIA labels | Built-in keyboard support, screen reader friendly |
| Visual Feedback | CSS transitions (no disabled state) | Non-blocking, responsive feel |
| Integration | Call existing `handleStartTimeChange()` | DRY principle, single source of truth |
| Mobile | Standard button with 44px min target | Meets accessibility guidelines |

## Dependencies Confirmed

**No new dependencies required**:
- ✅ Browser Date API (built-in)
- ✅ TimeUtils utility (existing)
- ✅ StorageService (existing)
- ✅ TaskCalculator (existing)
- ✅ DOM manipulation (vanilla JavaScript)

## Next Phase

Proceed to **Phase 1: Design & Contracts** with all research questions resolved and technical approach validated.

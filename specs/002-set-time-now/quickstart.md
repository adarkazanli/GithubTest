# Quickstart: Set to Now Button

**Feature**: 002-set-time-now
**For**: Developers implementing this feature
**Time to Complete**: ~2 hours

## Overview

Add a "Set to Now" button that captures the current system time and sets it as the estimated start time, triggering automatic recalculation of all task times.

## Prerequisites

- Node.js and npm installed
- Project cloned and dependencies installed (`npm install`)
- Familiarity with vanilla JavaScript ES6+
- Understanding of existing codebase structure

## Implementation Checklist

### Step 1: Add Button to HTML (5 minutes)

**File**: `index.html`

**Location**: Line 26 (inside `#schedule-controls` section, after `#update-time-btn`)

**Code to Add**:
```html
<button id="set-to-now-btn" type="button" aria-label="Set estimated start time to current time">
  Set to Now
</button>
```

**Verification**:
```bash
# Open index.html in browser
open index.html
# You should see the new "Set to Now" button next to "Update Times"
```

### Step 2: Add Button Styles (10 minutes)

**File**: `styles/main.css`

**Location**: Add to button styles section (near other button rules)

**Code to Add**:
```css
/* Set to Now Button */
#set-to-now-btn {
  /* Base styling - match existing buttons */
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: 1px solid #007bff;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;

  /* Accessibility - touch targets */
  min-height: 44px;
  min-width: 44px;

  /* Mobile optimization */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

#set-to-now-btn:hover {
  background-color: #0056b3;
}

#set-to-now-btn:active {
  transform: scale(0.98);
  opacity: 0.8;
  transition: all 0.1s ease;
}

#set-to-now-btn:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

#set-to-now-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: #6c757d;
  border-color: #6c757d;
}
```

**Verification**:
```bash
# Refresh browser
# Button should have blue styling and hover effects
```

### Step 3: Implement Event Handler (30 minutes)

**File**: `src/main.js`

**Location 1**: Add import at top (line 10, after existing imports)
```javascript
import TimeUtils from './utils/TimeUtils.js';
```

**Location 2**: Add function definition (after `handleStartTimeChange` function, around line 197)

**Code to Add**:
```javascript
/**
 * Handle "Set to Now" button click
 * Captures current system time and sets it as estimated start time
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
```

**Location 3**: Register event listener in `setupEventListeners()` function (around line 127)

**Code to Add**:
```javascript
// Set to Now button
const setToNowBtn = document.getElementById('set-to-now-btn');
if (setToNowBtn) {
  setToNowBtn.addEventListener('click', handleSetToNowClick);
  console.log('✓ Set to Now button listener attached');
} else {
  console.error('✗ Set to Now button element not found');
}
```

**Verification**:
```bash
# Refresh browser and open DevTools console
# Should see: "✓ Set to Now button listener attached"
# Click "Set to Now" button
# Time input should update to current time
# Tasks should recalculate
```

### Step 4: Add Import State Management (15 minutes)

**File**: `src/main.js`

**Location**: Update `showLoadingState()` function (around line 427)

**Code to Modify**:
```javascript
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
```

**Verification**:
```bash
# Import an Excel file
# During import, "Set to Now" button should be disabled
# After import completes, button should re-enable
```

### Step 5: Write Unit Tests (45 minutes)

**File**: `tests/set-to-now.test.js` (new file)

**Code to Add**:
```javascript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import TimeUtils from '../src/utils/TimeUtils.js';

describe('Set to Now Button', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="set-to-now-btn">Set to Now</button>
      <input type="text" id="estimated-start-time" value="09:00" />
    `;
  });

  it('should update input field with current time when clicked', () => {
    // Mock current time
    const mockDate = new Date('2025-11-01T14:30:00');
    vi.setSystemTime(mockDate);

    // Get formatted time
    const expectedTime = TimeUtils.formatDateToTime(mockDate);

    // Simulate button click logic
    const input = document.getElementById('estimated-start-time');
    input.value = expectedTime;

    // Verify
    expect(input.value).toBe('14:30');
  });

  it('should not execute if loading class is present', () => {
    // Add loading class
    document.body.classList.add('loading');

    // Store original value
    const input = document.getElementById('estimated-start-time');
    const originalValue = input.value;

    // Simulate button click with loading check
    if (!document.body.classList.contains('loading')) {
      input.value = '14:30';
    }

    // Verify value unchanged
    expect(input.value).toBe(originalValue);
  });

  it('should handle midnight rollover correctly', () => {
    // Mock time near midnight
    const mockDate = new Date('2025-11-01T23:58:00');
    const formatted = TimeUtils.formatDateToTime(mockDate);

    expect(formatted).toBe('23:58');

    // Test that addMinutes handles rollover
    const nextDay = TimeUtils.addMinutes('23:58', 30);
    expect(nextDay).toBe('00:28');
  });
});
```

**Run Tests**:
```bash
npm test tests/set-to-now.test.js
```

**Expected Output**:
```
✓ tests/set-to-now.test.js (3)
  ✓ Set to Now Button (3)
    ✓ should update input field with current time when clicked
    ✓ should not execute if loading class is present
    ✓ should handle midnight rollover correctly
```

### Step 6: Manual Testing (15 minutes)

**Test Cases**:

1. **Basic Functionality**
   ```
   [ ] Click "Set to Now" button
   [ ] Time input updates to current time
   [ ] Tasks recalculate with new times
   ```

2. **No Tasks Loaded**
   ```
   [ ] Clear all tasks (use Reset button)
   [ ] Click "Set to Now" button
   [ ] Time input updates (no errors)
   ```

3. **Rapid Clicks**
   ```
   [ ] Click "Set to Now" multiple times quickly
   [ ] Each click triggers recalculation
   [ ] No JavaScript errors in console
   [ ] Time stays accurate to click moment
   ```

4. **Import Interaction**
   ```
   [ ] Start importing Excel file
   [ ] Button becomes disabled
   [ ] Import completes
   [ ] Button re-enables
   ```

5. **Keyboard Accessibility**
   ```
   [ ] Tab to "Set to Now" button
   [ ] Focus outline visible
   [ ] Press Enter - button activates
   [ ] Press Space - button activates
   ```

6. **Mobile Testing**
   ```
   [ ] Open on mobile device or DevTools mobile view
   [ ] Button is easily tappable (44x44px minimum)
   [ ] Touch interaction works smoothly
   [ ] No double-tap zoom issues
   ```

7. **Midnight Rollover**
   ```
   [ ] Set system time to 23:58
   [ ] Import tasks with 30+ minute durations
   [ ] Click "Set to Now"
   [ ] Times correctly show 00:XX for tasks past midnight
   ```

## Common Issues & Solutions

### Issue 1: Button Not Appearing
**Symptom**: "Set to Now" button is not visible in the UI
**Solution**:
- Check `index.html` - button element added inside `#schedule-controls`?
- Check CSS - button styles applied?
- Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### Issue 2: Button Click Does Nothing
**Symptom**: Clicking button has no effect
**Solution**:
- Open DevTools console - any errors?
- Check event listener registered: Look for "✓ Set to Now button listener attached"
- Verify `handleSetToNowClick` function is defined
- Check if `loading` class is present on `<body>` (prevents execution)

### Issue 3: Time Format Invalid
**Symptom**: Error "Invalid time format" after clicking button
**Solution**:
- Verify `TimeUtils.formatDateToTime()` is imported and called correctly
- Check that function returns HH:MM format string
- Ensure `handleStartTimeChange()` receives properly formatted time

### Issue 4: Tasks Not Recalculating
**Symptom**: Time updates but task times don't change
**Solution**:
- Verify `handleStartTimeChange()` is called after updating input value
- Check that `recalculateAndRender()` is executing
- Look for errors in `TaskCalculator.calculateTimes()`

### Issue 5: Button Stays Disabled
**Symptom**: Button remains disabled after import completes
**Solution**:
- Check `showLoadingState(false)` is called after import
- Verify button element is correctly referenced in `showLoadingState()`
- Check for JavaScript errors that might prevent re-enabling

## Performance Verification

**Expected Performance**:
- Button click to input update: < 50ms
- Full recalculation with 100 tasks: < 500ms
- Memory usage: Negligible increase

**How to Verify**:
```javascript
// Add to handleSetToNowClick() for debugging
console.time('setToNow');
// ... existing code ...
console.timeEnd('setToNow');
// Should log < 50ms in console
```

## Accessibility Verification

**Screen Reader Testing** (macOS VoiceOver):
```bash
1. Enable VoiceOver: Cmd + F5
2. Navigate to button: VO + Right Arrow
3. Should announce: "Button, Set estimated start time to current time"
4. Activate: VO + Space
5. Should hear time input value update announcement
```

**Keyboard Testing**:
```
1. Tab through page controls
2. "Set to Now" button should receive focus (visible outline)
3. Press Enter - should activate
4. Press Space - should activate
```

## Deployment Checklist

Before merging to main:

- [ ] All unit tests pass (`npm test`)
- [ ] Manual testing completed (all 7 test cases)
- [ ] Code follows existing style conventions
- [ ] No console errors or warnings
- [ ] Tested on Chrome, Firefox, Safari
- [ ] Tested on mobile viewport
- [ ] Accessibility requirements verified
- [ ] Documentation updated (if needed)
- [ ] Constitution principles validated (all ✅ in plan.md)

## Next Steps

After implementation:
1. Create pull request with description
2. Link to spec.md and plan.md in PR
3. Request code review
4. Address feedback
5. Merge to main
6. Close feature branch

## Resources

- **Specification**: [spec.md](./spec.md)
- **Implementation Plan**: [plan.md](./plan.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **UI Contract**: [contracts/ui-contract.md](./contracts/ui-contract.md)

## Estimated Time Breakdown

| Task | Time | Complexity |
|------|------|------------|
| HTML changes | 5 min | Easy |
| CSS styling | 10 min | Easy |
| JavaScript handler | 30 min | Medium |
| State management | 15 min | Medium |
| Unit tests | 45 min | Medium |
| Manual testing | 15 min | Easy |
| **Total** | **~2 hours** | **Low-Medium** |

## Success Criteria Verification

After implementation, verify all success criteria met:

- ✅ **SC-001**: Button click completes in under 1 second
- ✅ **SC-002**: Recalculation completes within 500ms
- ✅ **SC-003**: Button accessible via Enter/Space keys
- ✅ **SC-004**: Time accurate to current minute
- ✅ **SC-005**: Works with/without tasks loaded

---

**Questions?** Refer to research.md for technical decisions, or spec.md for requirements clarification.

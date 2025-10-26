# Research: Database Reset Button

**Feature**: Database Reset Button
**Date**: 2025-10-26
**Phase**: 0 - Research & Best Practices

## Research Findings

### 1. Confirmation Dialog UX Patterns

**Decision**: Use modal dialog with clear warning message and distinct button styling

**Rationale**:
- Modal dialogs prevent accidental actions by requiring explicit interaction
- Industry standard for destructive operations (Gmail, Google Drive, GitHub)
- Clear visual hierarchy: Cancel (secondary) and Confirm (destructive/red)
- Modal prevents interaction with other UI elements during decision

**Best Practices**:
- **Message Clarity**: Use explicit language like "This will permanently delete all your data and cannot be undone"
- **Button Labels**: Use action-specific labels ("Delete All Data") instead of generic ("OK")
- **Visual Distinction**: Destructive action button should be red/warning color
- **Escape Route**: Cancel button should be visually prominent and default-focused
- **Keyboard Support**: ESC to cancel, Enter to confirm (with focus management)

**Alternatives Considered**:
- Inline confirmation: Rejected - too easy to miss or accidentally confirm
- Two-step confirmation: Rejected - overcomplicates for this use case (data can be reimported)
- Password protection: Out of scope per spec

**References**:
- Material Design: Dialogs for destructive actions
- Apple HIG: Action sheets for irreversible operations
- Nielsen Norman Group: Confirmation dialog best practices

---

### 2. Browser Storage Clearing

**Decision**: Sequential clearing with try-catch blocks for each storage area, collecting errors without halting

**Rationale**:
- Per clarification: "Show error but complete partial deletion"
- Each storage area (IndexedDB, localStorage) can fail independently
- Better to clear what we can than fail completely
- User gets detailed feedback about what failed

**Implementation Pattern**:

```javascript
async resetAll() {
  const errors = [];
  const cleared = { indexedDB: false, localStorage: false };

  // Clear IndexedDB
  try {
    const tx = this.db.transaction('tasks', 'readwrite');
    await tx.objectStore('tasks').clear();
    cleared.indexedDB = true;
  } catch (err) {
    errors.push(`IndexedDB: ${err.message}`);
  }

  // Clear localStorage keys
  try {
    localStorage.removeItem('taskOrder');
    localStorage.removeItem('estimatedStartTime');
    localStorage.removeItem('importHistory');
    cleared.localStorage = true;
  } catch (err) {
    errors.push(`localStorage: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    errors,
    cleared
  };
}
```

**Error Scenarios**:
- **QuotaExceededError**: Unlikely during deletion, but catch it
- **InvalidStateError**: Database not initialized or closed
- **SecurityError**: Private browsing mode restrictions
- **Generic errors**: Catch-all for unexpected issues

**Browser Compatibility**:
- IndexedDB supported in Chrome 24+, Firefox 16+, Safari 10+, Edge 12+
- localStorage supported in all modern browsers
- Both APIs throw different errors across browsers - use generic catch

**Alternatives Considered**:
- Atomic transaction: Rejected - IndexedDB and localStorage can't share transactions
- Rollback on failure: Rejected - clarification specifies partial deletion acceptable
- Delete entire database: Rejected - cleaner to clear object stores (preserves schema)

---

### 3. Button State Management

**Decision**: Disable button immediately on click using synchronous state update, re-enable after operation completes or fails

**Rationale**:
- Prevents race conditions from double-clicks
- Visual feedback that operation is in progress
- Simple state machine: enabled → disabled (during op) → enabled
- Works with both mouse and touch events

**Implementation Pattern**:

```javascript
async handleResetClick() {
  // Disable immediately
  this.setEnabled(false);

  try {
    // Show confirmation
    const confirmed = await this.showConfirmation();

    if (confirmed) {
      // Execute reset
      const result = await this.executeReset();

      if (result.success) {
        this.showSuccess();
      } else {
        this.showError(result.errors);
      }
    }
  } finally {
    // Always re-enable when done (success or failure)
    this.setEnabled(true);
  }
}
```

**State Coordination**:
- Button disabled during import: Check global import state before enabling
- Button disabled during reset: Track local reset state
- Use CSS `:disabled` pseudo-class for visual feedback
- Update `aria-disabled` attribute for accessibility

**Visual Feedback**:
- Disabled state: Reduced opacity (0.5), no pointer events
- Loading indicator: Optional spinner icon (not required by spec)
- Cursor: `cursor: not-allowed` when disabled

**Alternatives Considered**:
- Debouncing: Rejected - disabling is more explicit and reliable
- Loading spinner: Deferred - can add in polish phase if time permits
- Progress bar: Rejected - operation is too fast to justify

---

### 4. Error Message Design

**Decision**: Inline error message below button with auto-dismiss after 5 seconds

**Rationale**:
- Non-blocking: User can continue using app after seeing error
- Contextual: Appears near the action that caused it
- Specific: Lists which storage areas failed
- Auto-dismiss: Cleans up UI automatically but user has time to read

**Message Format**:

```
⚠️ Reset partially failed:
• IndexedDB: Could not clear tasks
• You may need to refresh the page and try again
```

**Success Message Format**:

```
✓ All data cleared successfully
```

**Styling**:
- Error: Red border, light red background, dark red text
- Success: Green border, light green background, dark green text
- Icon: Emoji or Unicode symbol for broad compatibility
- Dismissible: X button in corner for manual dismissal
- Animation: Fade in (200ms), fade out after 5s (500ms)

**Accessibility**:
- `role="alert"` for screen readers
- `aria-live="polite"` for non-intrusive announcements
- Sufficient color contrast (WCAG AA)
- Keyboard dismissible (Escape key)

**Alternatives Considered**:
- Modal error dialog: Rejected - too disruptive for non-critical error
- Toast notification: Rejected - component doesn't exist yet, inline is simpler
- Console-only: Rejected - user needs visual feedback per spec requirements

---

## Technology Decisions

### Browser APIs

**IndexedDB API**:
- Use `IDBObjectStore.clear()` for efficient deletion
- Wrap in try-catch for error handling
- Check `this.db` is initialized before operations

**localStorage API**:
- Use `removeItem()` for specific keys (taskOrder, estimatedStartTime, importHistory)
- Don't use `clear()` - might affect other app data if localStorage is shared
- Each removeItem() call is synchronous and throws on failure

**DOM API**:
- Use `<dialog>` element for native modal behavior
- Fallback to `<div>` with `role="dialog"` for older browsers
- Use `addEventListener` for click handlers
- Use `classList` for state management

### CSS Strategy

**Button Styling**:
- Base: Similar to import button but with warning color (orange/red)
- Disabled: `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`
- Hover: Slightly darker background (when enabled)
- Focus: Visible outline for keyboard navigation

**Dialog Styling**:
- Backdrop: Semi-transparent black (`rgba(0,0,0,0.5)`)
- Container: White background, centered, rounded corners (8px)
- Max-width: 500px for readability
- Mobile: Full-width minus padding on small screens
- Animation: Fade-in 200ms ease-out

**Responsive Behavior**:
- Desktop: Button inline with import button
- Mobile: Buttons stack vertically if needed
- Dialog: Responsive width, safe padding from edges

---

## Implementation Guidelines

### Code Organization

**New Files**:
- `src/components/ResetButton.js` - Component class with all logic
- `src/components/` - New directory for UI components

**Modified Files**:
- `src/services/StorageService.js` - Add `resetAll()` method
- `src/main.js` - Initialize and wire reset button
- `index.html` - Add button and dialog markup
- `styles/main.css` - Add button and dialog styles

### Testing Strategy

**Manual Testing Checklist**:
1. ✓ Button appears and is properly positioned
2. ✓ Click shows confirmation dialog
3. ✓ Cancel closes dialog without action
4. ✓ Confirm clears all data
5. ✓ Success message appears
6. ✓ Empty state displays after reset
7. ✓ Button disabled during operation
8. ✓ Button disabled during import
9. ✓ Works with empty storage
10. ✓ Error message for storage failures
11. ✓ Mobile touch interactions
12. ✓ Keyboard navigation (Tab, Enter, Escape)

**Cross-Browser Testing**:
- Chrome 90+ (desktop + mobile)
- Firefox 88+ (desktop + mobile)
- Safari 14+ (desktop + iOS)
- Edge 90+ (desktop)

**Edge Cases to Test**:
- Multiple rapid clicks (should not create multiple dialogs)
- Reset during import (button should be disabled)
- Storage quota errors (simulate in DevTools)
- Private browsing mode (may have storage restrictions)
- Page refresh during confirmation (dialog should close)

---

## Risk Mitigation

### Risk 1: Partial Storage Failure

**Mitigation**:
- Catch errors for each storage area independently
- Report specific failures to user
- Don't rollback successful deletions
- Application remains functional with partial state

**Testing**: Simulate by:
- Closing IndexedDB before reset
- Filling localStorage quota
- Using Private Browsing with restrictions

### Risk 2: Race Conditions

**Mitigation**:
- Disable button immediately on click
- Use single async operation chain
- Check import state before enabling
- No concurrent reset operations allowed

**Testing**: Simulate by:
- Rapid clicking button
- Clicking during import
- Opening multiple tabs

### Risk 3: Browser Incompatibility

**Mitigation**:
- Use standard Web APIs only
- Feature detection for `<dialog>` element
- Fallback styling for older browsers
- Catch all errors generically

**Testing**:
- Test on all supported browsers
- Test on oldest supported versions
- Test with browser DevTools throttling

---

## Summary

All research questions resolved. Ready to proceed to Phase 1 (Design & Contracts).

**Key Decisions**:
1. Modal confirmation dialog with clear destructive action styling
2. Sequential storage clearing with error collection
3. Button disabled immediately on click, re-enabled after completion
4. Inline error/success messages with auto-dismiss

**Next Steps**:
- Generate data-model.md
- Generate contracts/reset-button-api.md
- Generate quickstart.md
- Update agent context

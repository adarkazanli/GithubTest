# Feature Specification: Set Time to Now Button

**Feature Branch**: `002-set-time-now`
**Created**: 2025-11-01
**Status**: Draft
**Input**: User description: "add a button next to set time that will force the start time to be the current time now, all the data should be refreshed as a result"

## Clarifications

### Session 2025-11-01

- Q: What should happen when the user clicks the "Set to Now" button rapidly multiple times? → A: Each click triggers a new recalculation, potentially causing flickering or inconsistent state
- Q: How should the system handle setting time to "now" when the current time is near midnight (e.g., 23:58) and tasks extend past midnight? → A: Display crosses midnight seamlessly (tasks show times like 00:15, 00:45 on next day) with no special indication
- Q: What should happen if the system clock is incorrect or unavailable when the user clicks "Set to Now"? → A: Trust the browser's Date object without validation (if clock is wrong, wrong time is used)
- Q: How should the button behave when an import operation is in progress? → A: Button is disabled during import operations and re-enabled when import completes

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Quick Time Sync (Priority: P1)

A user opens the task scheduler in the morning and has tasks loaded from yesterday or earlier. Instead of manually typing the current time, they want to quickly set the start time to the current moment with a single click, so all task times recalculate to show when each task will actually be completed starting from now.

**Why this priority**: This is the core functionality requested and provides immediate value for users who need to quickly sync their schedule to the current time. It eliminates manual time entry errors and saves time.

**Independent Test**: Can be fully tested by loading tasks with any start time, clicking the "Set to Now" button, and verifying that the start time updates to the current time and all task times recalculate. Delivers immediate time-saving value.

**Acceptance Scenarios**:

1. **Given** the task scheduler has loaded tasks with a start time of "09:00" and the current time is "14:30", **When** the user clicks the "Set to Now" button, **Then** the estimated start time input updates to "14:30" and all task start/end times recalculate based on "14:30"
2. **Given** the user has no tasks loaded, **When** the user clicks the "Set to Now" button, **Then** the estimated start time input updates to the current time
3. **Given** the task scheduler is displaying tasks, **When** the user clicks the "Set to Now" button, **Then** the task list visually updates to show the new calculated times immediately

---

### User Story 2 - Time Input Convenience (Priority: P2)

A user wants the convenience of not having to look at a clock and manually type the time when they want to start their task schedule right now. The button should provide a quick shortcut that's faster than manual entry.

**Why this priority**: Enhances user experience by providing a convenient shortcut, but the core functionality (P1) could work without this polish.

**Independent Test**: Can be tested by comparing the time it takes to manually enter the current time versus clicking the button, and verifying the button is easily accessible and clearly labeled.

**Acceptance Scenarios**:

1. **Given** the user is viewing the schedule controls section, **When** they look for a way to set the current time, **Then** they can easily identify the "Set to Now" button positioned next to the time input
2. **Given** the user hovers over or focuses on the "Set to Now" button, **When** they interact with it, **Then** they receive clear visual feedback indicating it's an interactive element

---

### Edge Cases

- **Rapid button clicks**: Each click triggers a new recalculation with the current time at that moment. This may result in multiple rapid updates and potential flickering as the task list re-renders with each click. The system does not debounce or queue these requests.
- **Midnight rollover**: When the current time is near midnight (e.g., 23:58) and calculated task times extend past midnight, the display seamlessly shows times wrapping to the next day (e.g., 00:15, 00:45) using standard 24-hour time format. No special warning or indication is provided to the user.
- **Incorrect system clock**: The system trusts the browser's Date object without validation. If the user's system clock is incorrect, the incorrect time will be used for the start time. No validation or error handling is performed.
- **Concurrent import operation**: The "Set to Now" button is disabled during Excel import operations and automatically re-enabled when the import completes. This prevents data conflicts and state inconsistencies.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a button labeled "Set to Now" positioned next to the "Update Times" button in the schedule controls section
- **FR-002**: System MUST capture the current system time when the "Set to Now" button is clicked
- **FR-003**: System MUST format the captured current time in HH:MM format (24-hour format)
- **FR-004**: System MUST update the estimated start time input field to display the current time when the button is clicked
- **FR-005**: System MUST trigger a recalculation of all task start and end times based on the new current time
- **FR-006**: System MUST persist the new start time to storage so it survives page refreshes
- **FR-007**: System MUST update the task list display to reflect the newly calculated times immediately after clicking the button
- **FR-008**: Button MUST be accessible via keyboard navigation and screen readers
- **FR-009**: System MUST allow each button click to trigger a new recalculation with the current time at that moment, without debouncing or disabling the button
- **FR-010**: Button MUST provide visual feedback when clicked (e.g., visual highlight or animation, but not a disabled state)
- **FR-011**: System MUST handle midnight rollover seamlessly when task times extend past 23:59, displaying times in next day's 24-hour format (e.g., 00:15, 00:45) without warnings or special indicators
- **FR-012**: System MUST use the browser's Date object to capture current time without validation, accepting whatever time value is returned by the system clock
- **FR-013**: System MUST disable the "Set to Now" button during Excel import operations and automatically re-enable it when the import operation completes (successfully or with errors)

### Key Entities

- **Start Time**: The estimated time when the user plans to begin working on tasks. Currently set manually via text input, will now also be settable via the "Set to Now" button. Stored in HH:MM format and persists in localStorage.
- **Task**: Individual work item with calculated start and end times based on the estimated start time and task duration. All tasks recalculate when start time changes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can set the current time as the start time with a single button click in under 1 second
- **SC-002**: All task times recalculate and display within 500 milliseconds of clicking the "Set to Now" button
- **SC-003**: The button is keyboard accessible and can be activated using the Enter or Space key
- **SC-004**: 100% of time updates via the "Set to Now" button accurately reflect the current system time within the same minute
- **SC-005**: Users can successfully use the "Set to Now" button whether tasks are loaded or not, with no errors

## Assumptions

- The system will use the browser's local system time (via JavaScript `Date` object) as the source of "current time"
- The button will follow the same visual design language as the existing "Update Times" button
- The button will be enabled at all times when the page is loaded (not dependent on tasks being present)
- Time formatting will use 24-hour format (HH:MM) consistent with the existing time input field
- The button will trigger the same recalculation logic as the existing "Update Times" button, just with a different source for the time value
- If multiple time-related operations are in progress, the most recent one takes precedence

## Out of Scope

- Custom time zone selection (will use browser's local time zone)
- Time synchronization with network time servers
- Historical time tracking or logging of when the button was clicked
- Undo/redo functionality for time changes
- Scheduling the button to automatically update the time at intervals

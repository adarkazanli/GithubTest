# Tasks: Database Reset Button

**Input**: Design documents from `/specs/001-database-reset-button/`
**Prerequisites**: plan.md (complete), spec.md (complete), research.md (complete), data-model.md (complete), contracts/ (complete)

**Tests**: No test tasks included - manual testing strategy defined in quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project Type**: Single-page web application (static)
- **Root paths**: `src/`, `styles/`, `index.html` at repository root
- All paths shown below are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create components directory structure for the reset button feature

- [x] T001 Create src/components/ directory for UI components

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend StorageService with reset functionality that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Implement resetAll() method in src/services/StorageService.js to clear IndexedDB tasks store
- [x] T003 [P] Add localStorage clearing logic to resetAll() method in src/services/StorageService.js for taskOrder, estimatedStartTime, and importHistory keys
- [x] T004 Add error handling to resetAll() in src/services/StorageService.js to collect errors from both IndexedDB and localStorage operations independently
- [x] T005 Add return value structure to resetAll() in src/services/StorageService.js with success, errors[], and cleared{} properties

**Checkpoint**: StorageService.resetAll() is complete and can be tested independently in browser console

---

## Phase 3: User Story 1 - Clear All Task Data (Priority: P1) 🎯 MVP

**Goal**: Users can clear all their task data with a single button click after confirmation

**Independent Test**: Import tasks using existing Excel import, click reset button, confirm in dialog, verify all tasks removed from UI and storage (check DevTools → Application → IndexedDB and localStorage)

### Implementation for User Story 1

- [x] T006 [P] [US1] Create ResetButton component class in src/components/ResetButton.js with constructor and init() method
- [x] T007 [P] [US1] Add HTML markup for reset button in index.html positioned next to import button in control panel
- [x] T008 [P] [US1] Add HTML markup for confirmation dialog in index.html with backdrop, title, message, and action buttons
- [x] T009 [P] [US1] Add HTML markup for message container in index.html below control panel
- [x] T010 [US1] Implement showConfirmation() method in src/components/ResetButton.js that returns Promise<boolean>
- [x] T011 [US1] Implement hideConfirmation() method in src/components/ResetButton.js
- [x] T012 [US1] Implement executeReset() method in src/components/ResetButton.js that calls storageService.resetAll()
- [x] T013 [US1] Implement handleButtonClick() method in src/components/ResetButton.js that orchestrates confirmation → reset → feedback flow
- [x] T014 [US1] Wire ResetButton initialization in src/main.js after StorageService is ready with onResetComplete callback to refresh UI
- [ ] T015 [US1] Verify reset clears all tasks from IndexedDB and all localStorage keys (manual browser testing)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can reset data with confirmation

---

## Phase 4: User Story 2 - Confirmation Before Reset (Priority: P1)

**Goal**: Users see a clear confirmation dialog before any data is deleted to prevent accidental loss

**Independent Test**: Click reset button, verify modal dialog appears with warning message, click Cancel, verify data remains intact, click reset again, click Confirm, verify reset proceeds

### Implementation for User Story 2

- [x] T016 [US2] Update confirmation dialog message in index.html to clearly state "This will permanently delete all your task data and cannot be undone"
- [x] T017 [P] [US2] Add base dialog styles to styles/main.css for backdrop, content container, and positioning
- [x] T018 [P] [US2] Add dialog button styles to styles/main.css with Cancel (secondary) and Confirm (danger/red) styling
- [x] T019 [US2] Add event listeners in ResetButton.init() for confirm and cancel buttons in src/components/ResetButton.js
- [x] T020 [US2] Add Escape key listener in ResetButton.init() to cancel dialog in src/components/ResetButton.js
- [x] T021 [US2] Update showConfirmation() to focus Cancel button by default for safe default behavior in src/components/ResetButton.js
- [ ] T022 [US2] Verify Cancel button closes dialog without executing reset (manual browser testing)
- [ ] T023 [US2] Verify Confirm button proceeds with reset operation (manual browser testing)
- [ ] T024 [US2] Verify Escape key cancels dialog (keyboard testing)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - reset requires explicit confirmation

---

## Phase 5: User Story 3 - Visual Feedback After Reset (Priority: P2)

**Goal**: Users receive clear feedback when reset completes successfully or fails

**Independent Test**: Perform a successful reset, verify success message appears and auto-dismisses after 5 seconds, simulate storage error, verify error message appears with specific failure details

### Implementation for User Story 3

- [x] T025 [P] [US3] Implement showSuccess() method in src/components/ResetButton.js to display "✓ All data cleared successfully"
- [x] T026 [P] [US3] Implement showError() method in src/components/ResetButton.js to display errors with specific storage area failures
- [x] T027 [P] [US3] Implement showMessage() helper method in src/components/ResetButton.js with auto-dismiss after 5 seconds
- [x] T028 [P] [US3] Add message container styles to styles/main.css with success (green) and error (red) variants
- [x] T029 [P] [US3] Add message dismiss button styles to styles/main.css with X icon positioning
- [x] T030 [P] [US3] Add fadeIn animation to styles/main.css for message appearance
- [x] T031 [US3] Update handleButtonClick() in src/components/ResetButton.js to call showSuccess() or showError() based on result
- [x] T032 [US3] Add ARIA attributes (role="alert", aria-live="polite") to message elements for screen reader support in src/components/ResetButton.js
- [x] T033 [US3] Update UI to show empty state message after successful reset in src/main.js onResetComplete callback
- [ ] T034 [US3] Verify success message displays and auto-dismisses after 5 seconds (manual timing test)
- [ ] T035 [US3] Verify error message displays with specific failure details (test by closing database before reset)

**Checkpoint**: All three core user stories should now be complete and independently functional with full feedback

---

## Phase 6: Edge Cases & Polish

**Purpose**: Handle edge cases and add final polish to the feature

- [x] T036 [P] Implement setEnabled() method in src/components/ResetButton.js to control button disabled state
- [x] T037 [P] Add reset button base styles to styles/main.css with warning color (#dc3545) and hover state
- [x] T038 [P] Add disabled button styles to styles/main.css with reduced opacity and cursor: not-allowed
- [x] T039 [P] Add focus styles to styles/main.css for reset button and dialog buttons for keyboard accessibility
- [x] T040 Update handleButtonClick() to disable button immediately after click in src/components/ResetButton.js (FR-001a)
- [x] T041 Add try-finally block to handleButtonClick() to re-enable button after operation in src/components/ResetButton.js
- [x] T042 Add isImportInProgress callback check to ResetButton constructor options in src/components/ResetButton.js (FR-011)
- [ ] T043 Update import button click handler in src/main.js to disable reset button during import and re-enable after
- [ ] T044 Add window.isImporting flag management in src/main.js for import state tracking
- [x] T045 Update setEnabled() to show tooltip "Reset unavailable during import" when disabled during import in src/components/ResetButton.js
- [x] T046 [P] Add mobile responsive styles to styles/main.css for button layout (stack vertically on < 768px)
- [x] T047 [P] Add mobile responsive styles to styles/main.css for dialog (full width with padding on small screens)
- [x] T048 [P] Add mobile responsive styles to styles/main.css for dialog buttons (full width, stacked)
- [ ] T049 Verify button disables after first click and prevents multiple confirmations (rapid click testing)
- [ ] T050 Verify button stays disabled during import operation with tooltip (test during Excel import)
- [ ] T051 Verify reset works correctly with empty storage (test on fresh page load with no data)
- [ ] T052 Verify error message displays for partial storage failure (simulate by causing one storage area to fail)
- [x] T053 Update FUNCTIONAL-REQUIREMENTS.md to add new FR-013 for reset button functionality per constitution requirements
- [ ] T054 Run cross-browser manual testing on Chrome, Firefox, Safari, and Edge (desktop + mobile viewports)
- [ ] T055 Run accessibility testing with keyboard navigation (Tab, Enter, Escape) and verify ARIA announcements
- [ ] T056 Run mobile touch testing on iOS Safari and Android Chrome
- [ ] T057 Validate feature against quickstart.md testing checklist (all items must pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational (Phase 2) - Core reset functionality
  - User Story 2 (P1): Can start after Foundational (Phase 2) - Confirmation dialog (integrates with US1)
  - User Story 3 (P2): Can start after Foundational (Phase 2) - Visual feedback (integrates with US1)
- **Edge Cases & Polish (Phase 6)**: Depends on User Stories 1-3 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Core reset button and data clearing
- **User Story 2 (P1)**: Loosely coupled with US1 - Adds confirmation before US1's reset action
- **User Story 3 (P2)**: Loosely coupled with US1 - Adds feedback after US1's reset completes

Note: While US2 and US3 integrate with US1's flow, they can be implemented in parallel by different developers since they touch different parts of the codebase (dialog HTML/CSS vs message display logic).

### Within Each User Story

- Models before services: N/A (no new models)
- Services before UI: StorageService.resetAll() (Phase 2) before ResetButton (Phase 3+)
- Core implementation before integration: Button component before main.js wiring
- HTML/CSS can be created in parallel with JavaScript logic

### Parallel Opportunities

- **Phase 1**: Single task, no parallelization
- **Phase 2**: T002 and T003 can run in parallel (different methods/storage areas)
- **User Story 1**: T006, T007, T008, T009 all marked [P] - can run in parallel (HTML vs JS class)
- **User Story 2**: T017 and T018 can run in parallel (different CSS sections)
- **User Story 3**: T025-T030 all marked [P] - can run in parallel (different methods/styles)
- **Edge Cases**: T036-T039 and T046-T048 marked [P] - can run in parallel (methods vs styles)

---

## Parallel Example: User Story 1

```bash
# Launch these tasks together:
Task: "Create ResetButton component class in src/components/ResetButton.js with constructor and init() method"
Task: "Add HTML markup for reset button in index.html positioned next to import button in control panel"
Task: "Add HTML markup for confirmation dialog in index.html with backdrop, title, message, and action buttons"
Task: "Add HTML markup for message container in index.html below control panel"
# All four tasks modify different files and have no dependencies
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001) - ~5 minutes
2. Complete Phase 2: Foundational (T002-T005) - ~30 minutes
3. Complete Phase 3: User Story 1 (T006-T015) - ~1.5 hours
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Import some tasks
   - Click reset button
   - Confirm in dialog
   - Verify all data cleared
   - Check IndexedDB and localStorage are empty
5. Deploy/demo if ready - **This is a complete MVP!**

**Estimated MVP Effort**: 2-2.5 hours

### Incremental Delivery

1. **Iteration 1**: Setup + Foundational + US1 → Test independently → Deploy (MVP - basic reset with confirmation)
2. **Iteration 2**: Add US2 → Test independently → Deploy (Enhanced confirmation UX)
3. **Iteration 3**: Add US3 → Test independently → Deploy (Full feedback system)
4. **Iteration 4**: Add Edge Cases & Polish → Full cross-browser testing → Deploy (Production-ready)

Each iteration adds value without breaking previous functionality.

### Parallel Team Strategy

With 2-3 developers:

1. **Together**: Complete Setup (Phase 1) + Foundational (Phase 2) - ~35 minutes
2. **Once Foundational is done, split up**:
   - **Developer A**: User Story 1 (T006-T015) - ~1.5 hours
   - **Developer B**: User Story 2 HTML/CSS (T016-T018) - ~30 minutes
   - **Developer C**: User Story 3 Methods/Styles (T025-T030) - ~45 minutes
3. **Developer A finishes US1, then**:
   - Developer A: Wire US2 logic (T019-T024) - ~30 minutes
   - Developer B: Wire US3 logic (T031-T035) - ~30 minutes
4. **Together**: Edge Cases & Polish (T036-T057) - ~2 hours

**Total Parallel Time**: ~4-5 hours vs ~6-7 hours sequential

---

## Task Count Summary

- **Phase 1 (Setup)**: 1 task
- **Phase 2 (Foundational)**: 4 tasks
- **Phase 3 (User Story 1 - P1)**: 10 tasks
- **Phase 4 (User Story 2 - P1)**: 9 tasks
- **Phase 5 (User Story 3 - P2)**: 11 tasks
- **Phase 6 (Edge Cases & Polish)**: 22 tasks

**Total Tasks**: 57 tasks

**Parallel Tasks**: 22 tasks marked [P] (38% can run in parallel)

**Story Distribution**:
- US1: 10 tasks (core reset functionality)
- US2: 9 tasks (confirmation dialog)
- US3: 11 tasks (visual feedback)
- Non-story: 27 tasks (setup, foundational, edge cases, testing)

---

## Independent Test Criteria

### User Story 1 Validation

✅ **Pass if**:
- Reset button appears next to import button
- Clicking button shows confirmation dialog
- Confirming dialog clears all IndexedDB tasks
- Confirming dialog clears all localStorage keys (taskOrder, estimatedStartTime, importHistory)
- Task list UI updates to show empty state
- Button is clickable after operation completes

### User Story 2 Validation

✅ **Pass if**:
- Confirmation dialog has clear warning message about permanent deletion
- Cancel button closes dialog without deleting data
- Confirm button (red/danger styled) proceeds with deletion
- Escape key cancels dialog
- Cancel button is focused by default (safe default)

### User Story 3 Validation

✅ **Pass if**:
- Success message appears after successful reset
- Success message says "✓ All data cleared successfully"
- Success message auto-dismisses after 5 seconds
- Error message appears if storage operations fail
- Error message lists specific failures (e.g., "IndexedDB: ..." or "localStorage: ...")
- Messages are dismissible via X button
- Messages have appropriate color coding (green for success, red for error)

---

## Success Metrics

After completing all tasks, verify:

- ✅ **SC-001**: Reset operation completes in < 5 seconds
- ✅ **SC-002**: Confirmation dialog prevents accidental deletion
- ✅ **SC-003**: 100% of data removed (verify in DevTools)
- ✅ **SC-004**: Works on Chrome, Firefox, Safari, Edge
- ✅ **SC-005**: Feedback appears within 1 second
- ✅ **SC-006**: Button functional in all states (with data, empty, during import)
- ✅ All 12 functional requirements (FR-001 to FR-012) implemented
- ✅ Zero regressions in existing functionality

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Manual testing strategy defined in quickstart.md (no automated tests)
- Focus on browser DevTools for validation (IndexedDB, localStorage inspection)
- Constitution compliance maintained throughout (static-only, browser storage, no dependencies)

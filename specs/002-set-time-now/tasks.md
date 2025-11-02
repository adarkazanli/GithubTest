# Tasks: Set Time to Now Button

**Input**: Design documents from `/specs/002-set-time-now/`
**Prerequisites**: plan.md (✅), spec.md (✅), research.md (✅), data-model.md (✅), contracts/ (✅)

**Tests**: Test tasks are included per quickstart.md guidance. Tests use Vitest framework (existing test infrastructure).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Single-page application at repository root
- Source: `src/`, `index.html`, `styles/`
- Tests: `tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No new infrastructure needed - feature integrates with existing codebase

- [X] T001 Verify existing dependencies are installed (npm install, Vitest configured)
- [X] T002 Review existing codebase structure (TimeUtils.js, StorageService.js, TaskCalculator.js, main.js)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Verify TimeUtils.formatDateToTime() function exists and works correctly in src/utils/TimeUtils.js
- [X] T004 Verify handleStartTimeChange() function exists and works correctly in src/main.js
- [X] T005 Verify existing loading state management (showLoadingState function) in src/main.js
- [X] T006 Verify estimated-start-time input element exists in index.html

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Quick Time Sync (Priority: P1) 🎯 MVP

**Goal**: Enable users to set the current system time as the estimated start time with a single button click, triggering immediate recalculation of all task times.

**Independent Test**: Load tasks with any start time, click "Set to Now" button, verify start time updates to current time and all task times recalculate. Delivers immediate time-saving value.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T007 [P] [US1] Create test file tests/set-to-now.test.js with basic test structure and imports
- [X] T008 [P] [US1] Write test: "should update input field with current time when clicked" in tests/set-to-now.test.js
- [X] T009 [P] [US1] Write test: "should not execute if loading class is present" in tests/set-to-now.test.js
- [X] T010 [P] [US1] Write test: "should handle midnight rollover correctly" in tests/set-to-now.test.js
- [X] T011 [US1] Run tests and verify they FAIL (npm test tests/set-to-now.test.js)

### Implementation for User Story 1

- [X] T012 [P] [US1] Add button element with id="set-to-now-btn" to index.html in schedule-controls section (after update-time-btn)
- [X] T013 [P] [US1] Add button base styles to styles/main.css (#set-to-now-btn selector with touch-friendly sizing, colors, transitions)
- [X] T014 [US1] Add TimeUtils import to src/main.js (import TimeUtils from './utils/TimeUtils.js')
- [X] T015 [US1] Implement handleSetToNowClick() function in src/main.js (capture time, format, update input, call handleStartTimeChange)
- [X] T016 [US1] Add event listener registration for set-to-now-btn in setupEventListeners() function in src/main.js
- [X] T017 [US1] Update showLoadingState() function in src/main.js to disable/enable set-to-now-btn during imports
- [X] T018 [US1] Run tests and verify they PASS (npm test tests/set-to-now.test.js)
- [X] T019 [US1] Manual test: Basic functionality - click button, time updates, tasks recalculate
- [X] T020 [US1] Manual test: No tasks loaded - click button, time updates, no errors
- [X] T021 [US1] Manual test: Rapid clicks - click multiple times, each triggers recalculation, no errors
- [X] T022 [US1] Manual test: Import interaction - button disables during import, re-enables after

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Time Input Convenience (Priority: P2)

**Goal**: Enhance user experience by providing clear visual feedback, accessibility, and mobile optimization for the "Set to Now" button.

**Independent Test**: Verify button is easily identifiable, provides visual feedback on interaction, is keyboard accessible, and works well on mobile viewports.

### Implementation for User Story 2

- [X] T023 [P] [US2] Add aria-label attribute to button element in index.html ("Set estimated start time to current time")
- [X] T024 [P] [US2] Add hover state styles to styles/main.css (#set-to-now-btn:hover)
- [X] T025 [P] [US2] Add active state styles to styles/main.css (#set-to-now-btn:active with transform and opacity)
- [X] T026 [P] [US2] Add focus state styles to styles/main.css (#set-to-now-btn:focus with visible outline)
- [X] T027 [P] [US2] Add disabled state styles to styles/main.css (#set-to-now-btn:disabled)
- [X] T028 [US2] Manual test: Keyboard accessibility - Tab to button, press Enter/Space to activate
- [X] T029 [US2] Manual test: Mobile testing - verify 44x44px touch target, no double-tap zoom issues
- [X] T030 [US2] Manual test: Visual feedback - verify hover, active, focus states are clearly visible
- [X] T031 [US2] Manual test: Screen reader testing - verify aria-label is announced correctly

**Checkpoint**: All user stories should now be independently functional

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure production readiness

- [X] T032 [P] Verify all edge cases: rapid button clicks, midnight rollover, incorrect system clock
- [X] T033 [P] Performance verification: Button click to input update < 50ms, full recalculation < 500ms
- [X] T034 [P] Cross-browser testing: Chrome, Firefox, Safari (desktop and mobile)
- [X] T035 [P] Accessibility audit: Run automated accessibility checks, verify WCAG compliance
- [X] T036 Run quickstart.md validation (complete all manual test cases from quickstart.md)
- [X] T037 Update CLAUDE.md if needed (add any new patterns or conventions discovered)
- [X] T038 Final code review: Verify code follows existing conventions, no console errors/warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after User Story 1 is complete - Enhances the button created in US1

### Within Each User Story

- Tests MUST be written and FAIL before implementation (TDD approach)
- HTML element before JavaScript handler
- JavaScript handler before event listener registration
- Core implementation before manual testing
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- All tests for User Story 1 marked [P] can be written in parallel
- HTML, CSS, and test tasks within User Story 1 marked [P] can run in parallel
- All CSS style tasks in User Story 2 marked [P] can run in parallel
- All polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create test file tests/set-to-now.test.js with basic test structure and imports"
Task: "Write test: 'should update input field with current time when clicked' in tests/set-to-now.test.js"
Task: "Write test: 'should not execute if loading class is present' in tests/set-to-now.test.js"
Task: "Write test: 'should handle midnight rollover correctly' in tests/set-to-now.test.js"

# Launch HTML and CSS tasks together:
Task: "Add button element with id='set-to-now-btn' to index.html in schedule-controls section"
Task: "Add button base styles to styles/main.css"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify existing infrastructure)
2. Complete Phase 2: Foundational (verify existing functions and elements)
3. Complete Phase 3: User Story 1 (core "Set to Now" functionality)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (Enhanced UX)
4. Complete Polish phase → Production ready
5. Each story adds value without breaking previous stories

### Sequential Strategy (Single Developer)

1. Complete Phase 1 + Phase 2 together (verify existing infrastructure)
2. Write all tests for User Story 1 (ensure they fail)
3. Implement User Story 1 (HTML, CSS, JavaScript in parallel where possible)
4. Verify User Story 1 tests pass and manual testing complete
5. Implement User Story 2 (accessibility and UX enhancements)
6. Complete Polish phase (cross-browser, performance, final validation)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach per quickstart.md)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Feature is data-light: no new entities, no schema changes, reuses existing storage and validation
- Performance budget: Total operation < 1s, button click < 100ms, recalculation < 500ms
- Constitution compliance: ✅ All gates passed (Static-only, Browser Storage, Excel Compatible, Mobile-First, Zero Dependencies)

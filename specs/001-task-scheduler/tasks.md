# Tasks: Task Scheduler

**Input**: Design documents from `/specs/001-task-scheduler/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Tests**: Manual testing only - no automated test tasks (per constitution requirements)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Static SPA structure
  - `index.html` (main entry)
  - `src/models/` (data models)
  - `src/services/` (business logic)
  - `src/ui/` (UI components)
  - `src/utils/` (utilities)
  - `assets/lib/` (third-party libraries)
  - `styles/` (CSS files)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create project directory structure (index.html, src/, assets/, styles/)
- [x] T002 [P] Create HTML structure in index.html with sections for import, controls, and task list
- [x] T003 [P] Download SheetJS library to assets/lib/xlsx.full.min.js
- [x] T004 Create initial CSS structure in styles/main.css with mobile-first responsive layout
- [x] T005 Create main JavaScript entry point src/main.js with initialization code

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Task model in src/models/Task.js with id, orderId, taskName, estimatedDuration, notes, calculatedStartTime, calculatedEndTime properties
- [x] T007 Create TimeUtils utility in src/utils/TimeUtils.js with parseToMinutes, formatMinutesToTime, and formatDateToTime methods
- [x] T008 Create StorageService in src/services/StorageService.js with IndexedDB initialization and localStorage helpers
- [x] T009 Implement IndexedDB setup in StorageService with tasks object store creation
- [x] T010 Implement localStorage helpers in StorageService for estimatedStartTime and taskOrder

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Import Excel and View Task Schedule (Priority: P1) 🎯 MVP

**Goal**: Users can import Excel files and view all tasks with calculated start and end times

**Independent Test**: Import an Excel file with valid task data, verify all tasks display with calculated times without any reordering functionality

### Implementation for User Story 1

- [x] T011 [US1] Create ExcelImporter service in src/services/ExcelImporter.js with importFile method using SheetJS
- [x] T012 [US1] Implement validateAndParse method in ExcelImporter to validate column structure and data formats
- [x] T013 [US1] Implement time format validation in ExcelImporter to check HH:MM format and reject invalid rows
- [x] T014 [US1] Implement auto-correction of negative durations in ExcelImporter validation (convert to zero, then reject)
- [x] T015 [US1] Implement duplicate order ID handling in ExcelImporter with auto-increment logic
- [x] T016 [US1] Create TaskCalculator service in src/services/TaskCalculator.js with calculateTimes method
- [x] T017 [US1] Implement start/end time calculation logic in TaskCalculator based on cumulative durations
- [x] T018 [US1] Create TaskList UI component integrated in main.js for rendering task list
- [x] T019 [US1] Implement renderTasks function in main.js to display task name, duration, and calculated times
- [x] T020 [US1] Create ImportPanel UI component integrated in index.html for file input
- [x] T021 [US1] Implement file import handler in main.js to process Excel upload
- [x] T022 [US1] Implement import summary display in main.js showing valid/invalid row counts
- [x] T023 [US1] Integrate ExcelImporter with StorageService to save imported tasks to IndexedDB
- [x] T024 [US1] Implement task data persistence on import and page load from IndexedDB
- [x] T025 [US1] Add Stripe.com-inspired styling to task list for modern, clean appearance

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Reorder Tasks via Drag and Drop (Priority: P2)

**Goal**: Users can reorder tasks by drag-and-drop and see all times automatically recalculate

**Independent Test**: Import tasks, drag one task to a new position, verify the task moves and all affected times recalculate correctly

### Implementation for User Story 2

- [x] T026 [US2] Create drag-and-drop functions integrated in main.js with helper functions
- [x] T027 [US2] Implement dragstart event handler in main.js to initiate drag operation
- [x] T028 [US2] Implement dragover event handler in main.js to show visual drop target feedback
- [x] T029 [US2] Implement drop event handler in main.js to handle task reordering
- [x] T030 [US2] Add drag feedback styling in styles/main.css for dragging and drag-over states
- [x] T031 [US2] Implement touch event handlers in main.js for mobile drag-and-drop support
- [x] T032 [US2] Connect drag-and-drop to taskOrder update in main.js to persist new order
- [x] T033 [US2] Implement automatic time recalculation after drag operation completes
- [x] T034 [US2] Update StorageService to save new task order on reorder in localStorage
- [x] T035 [US2] Add visual feedback during drag operation (opacity, border highlighting)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Adjust Estimated Start Time (Priority: P3)

**Goal**: Users can change the estimated start time and all task times automatically update

**Independent Test**: Change estimated start time, verify all tasks shift by the same duration while maintaining relative timing

### Implementation for User Story 3

- [x] T036 [US3] Create schedule controls UI integrated in index.html for start time input
- [x] T037 [US3] Implement start time input field with HH:MM format validation
- [x] T038 [US3] Connect start time change handler in main.js to update all task times
- [x] T039 [US3] Implement recalculateAndRender function to update all task times based on new start time
- [x] T040 [US3] Update StorageService to persist estimatedStartTime changes to localStorage
- [x] T041 [US3] Load and apply stored estimatedStartTime on page initialization
- [x] T042 [US3] Ensure reordered tasks maintain their order when start time changes

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T043 [P] Implement notes editing functionality in main.js for user-entered task notes
- [x] T044 [P] Add notes persistence in StorageService to save notes to IndexedDB
- [x] T045 [P] Implement notes change handler with blur event to save notes automatically
- [x] T046 Enhance mobile responsiveness with touch-friendly drag handles and improved spacing
- [x] T047 Add loading indicators during Excel import process
- [ ] T048 Implement virtual scrolling optimization for 100+ tasks performance
- [x] T049 Add error handling and user-friendly error messages throughout application
- [x] T050 Polish CSS styling to match Stripe.com aesthetic (clean, modern, professional)
- [x] T051 Add import history tracking for last import summary persistence
- [x] T052 Implement merge behavior for importing new Excel files while preserving existing tasks
- [x] T053 Add mobile-specific touch gesture improvements for drag-and-drop
- [x] T054 Create LICENSE and NOTICE files for SheetJS attribution compliance
- [ ] T055 Test application across Chrome, Firefox, Safari (desktop and mobile)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Requires US1's TaskList component but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires US1's TaskCalculator but should be independently testable

### Within Each User Story

- Models before services
- Services before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T002, T003, T004) can run in parallel
- Foundational phase tasks (T006-T010) can run in parallel
- Once Foundational completes, user stories can proceed independently
- Within US1: ExcelImporter (T011), TaskCalculator (T016), and UI components (T018-T020) can be developed in parallel
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch Excel import and time calculation in parallel:
Task T011: "Create ExcelImporter service in src/services/ExcelImporter.js"
Task T016: "Create TaskCalculator service in src/services/TaskCalculator.js"

# Launch UI components in parallel:
Task T018: "Create TaskList UI component in src/ui/TaskList.js"
Task T020: "Create ImportPanel UI component in src/ui/ImportPanel.js"
Task T022: "Implement import summary display in src/ui/ImportSummary.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T010)
3. Complete Phase 3: User Story 1 (T011-T025)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add Polish tasks → Final product

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Excel import & view)
   - Developer B: User Story 2 (Drag and drop)
   - Developer C: User Story 3 (Start time adjustment)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Manual testing required (no automated tests per constitution)


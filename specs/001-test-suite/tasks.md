# Tasks: Comprehensive Test Suite

**Input**: Design documents from `/specs/001-test-suite/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/test-api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project Type**: Single-page web application (static HTML/CSS/JavaScript)
- **Test Location**: `tests/` at repository root
- **Source Location**: `src/` at repository root
- All paths are absolute from repository root

---

## Phase 1: Setup (Test Infrastructure Initialization)

**Purpose**: Initialize test framework, configuration, and project structure

- [x] T001 Install Vitest testing framework dependencies - run `npm install --save-dev vitest@^1.0.0 jsdom@^23.0.0 @vitest/ui@^1.0.0`
- [x] T002 Create Vitest configuration file at vitest.config.js with JSDOM environment and coverage settings
- [x] T003 [P] Update package.json with test scripts (test, test:watch, test:ui, coverage, test:ci)
- [x] T004 [P] Create tests/ directory structure (unit/, integration/, fixtures/, helpers/)
- [x] T005 [P] Create global test setup file at tests/setup.js
- [x] T006 [P] Add .gitignore entries for coverage/ and node_modules/

---

## Phase 2: Foundational (Test Helpers & Fixtures)

**Purpose**: Core test utilities and fixtures that ALL user stories depend on

**⚠️ CRITICAL**: No user story test implementation can begin until this phase is complete

- [x] T007 [P] Implement StorageMock class in tests/helpers/storage-mock.js per contracts/test-api.md
- [x] T008 [P] Implement createMockFile() and createMockExcelFile() in tests/helpers/file-mock.js per contracts/test-api.md
- [x] T009 [P] Implement DOM setup helpers (setupDOM, cleanupDOM, createMockElement) in tests/helpers/dom-setup.js per contracts/test-api.md
- [x] T010 [P] Implement data generators (generateTask, generateTasks, generateExcelData) in tests/helpers/data-generators.js per data-model.md
- [x] T011 [P] Create task data fixtures in tests/fixtures/task-data.js with sampleTasks, emptyTaskList, singleTask per data-model.md
- [x] T012 [P] Create storage state fixtures in tests/fixtures/storage-states.js with emptyStorage, populatedStorage per data-model.md
- [x] T013 [P] Generate sample-tasks.xlsx Excel file in tests/fixtures/ with 10 valid task rows
- [x] T014 [P] Generate invalid-tasks.xlsx Excel file in tests/fixtures/ with mixed valid/invalid data (5 valid, 5 invalid rows)
- [x] T015 [P] Generate empty-sheet.xlsx Excel file in tests/fixtures/ with header row only
- [x] T016 [P] Generate large-import.xlsx Excel file in tests/fixtures/ with 100 valid task rows for performance testing

**Checkpoint**: Foundation ready - all test helpers and fixtures available for use ✅

---

## Phase 3: User Story 1 - Unit Test Coverage (Priority: P1) 🎯 MVP

**Goal**: Developers can run unit tests for individual components (Task, TaskCalculator, TimeUtils, StorageService, ExcelImporter, ResetButton) to validate business logic in isolation

**Independent Test**: Run `npm test tests/unit/` and verify all 6 modules have passing unit tests with clear pass/fail results

### Unit Tests for TimeUtils (US1)

- [x] T017 [P] [US1] Create unit test file at tests/unit/utils/TimeUtils.test.js
- [x] T018 [US1] Write unit tests for TimeUtils.isValidTimeFormat() - valid formats, invalid formats, edge cases
- [x] T019 [US1] Write unit tests for TimeUtils.parseTime() - parsing HH:MM format, invalid inputs
- [x] T020 [US1] Write unit tests for TimeUtils.formatTime() - formatting time objects to HH:MM
- [x] T021 [US1] Write unit tests for TimeUtils.addMinutes() - adding duration to time, boundary cases (midnight crossover)

### Unit Tests for Task Model (US1)

- [x] T022 [P] [US1] Create unit test file at tests/unit/models/Task.test.js
- [x] T023 [US1] Write unit tests for Task constructor - valid task creation, required fields validation
- [x] T024 [US1] Write unit tests for Task.getFormattedStartTime() and Task.getFormattedEndTime()
- [x] T025 [US1] Write unit tests for Task.setNotes() - updating notes, empty notes
- [x] T026 [US1] Write unit tests for Task property getters (id, orderId, taskName, estimatedDuration)
- [x] T027 [US1] Write unit tests for Task validation logic - invalid duration, invalid time formats

### Unit Tests for TaskCalculator (US1)

- [x] T028 [P] [US1] Create unit test file at tests/unit/services/TaskCalculator.test.js
- [x] T029 [US1] Write unit tests for TaskCalculator.calculateTimes() with single task - verify start time, end time calculation
- [x] T030 [US1] Write unit tests for TaskCalculator.calculateTimes() with multiple tasks - verify cumulative time calculation
- [x] T031 [US1] Write unit tests for TaskCalculator.calculateTimes() with empty task array
- [x] T032 [US1] Write unit tests for TaskCalculator.calculateTimes() with invalid start time format
- [x] T033 [US1] Write unit tests for TaskCalculator edge cases - midnight crossover, very long durations

### Unit Tests for StorageService (US1)

- [x] T034 [P] [US1] Create unit test file at tests/unit/services/StorageService.test.js
- [x] T035 [US1] Setup localStorage mock in beforeEach hook using StorageMock from helpers
- [x] T036 [US1] Write unit tests for StorageService.init() - initialization, empty storage handling
- [x] T037 [US1] Write unit tests for StorageService.saveTasks() - save tasks array, verify localStorage calls
- [x] T038 [US1] Write unit tests for StorageService.getTasks() - retrieve tasks, reconstruct Task instances
- [x] T039 [US1] Write unit tests for StorageService.updateTask() - update single task, verify persistence
- [x] T040 [US1] Write unit tests for StorageService.clearAll() - clear all data, reset to initial state
- [x] T041 [US1] Write unit tests for StorageService.getEstimatedStartTime() and setEstimatedStartTime()
- [x] T042 [US1] Write unit tests for StorageService.setImportHistory() and retrieval

### Unit Tests for ExcelImporter (US1)

- [x] T043 [P] [US1] Create unit test file at tests/unit/services/ExcelImporter.test.js
- [x] T044 [US1] Write unit tests for ExcelImporter.importFile() with valid Excel file - verify task parsing, summary generation
- [x] T045 [US1] Write unit tests for ExcelImporter.importFile() with invalid data - verify error handling, invalid row counting
- [x] T046 [US1] Write unit tests for ExcelImporter.importFile() with empty Excel file - verify graceful handling
- [x] T047 [US1] Write unit tests for ExcelImporter.importFile() with missing columns - verify validation errors
- [x] T048 [US1] Write unit tests for ExcelImporter row validation logic - empty Order ID, empty Task Name, negative duration

### Unit Tests for ResetButton Component (US1)

- [x] T049 [P] [US1] Create unit test file at tests/unit/components/ResetButton.test.js
- [x] T050 [US1] Setup DOM mock in beforeEach using setupDOM() from helpers
- [x] T051 [US1] Write unit tests for ResetButton.init() - button initialization, event listener setup
- [x] T052 [US1] Write unit tests for ResetButton click handler - verify confirmation dialog shows
- [x] T053 [US1] Write unit tests for ResetButton confirmation flow - confirm resets data, cancel preserves data
- [x] T054 [US1] Write unit tests for ResetButton.reset() - verify StorageService.clearAll() called, callback triggered
- [x] T055 [US1] Write unit tests for ResetButton error handling - storage errors, callback errors

**Checkpoint**: All 6 modules have comprehensive unit test coverage. Run `npm test tests/unit/` to verify all tests pass independently.

---

## Phase 4: User Story 2 - Integration Test Coverage (Priority: P2)

**Goal**: Developers can run integration tests to verify multi-component workflows (Excel import, task reordering, time updates, database reset) work correctly end-to-end

**Independent Test**: Run `npm test tests/integration/` and verify all 4 workflows have passing integration tests demonstrating data flows correctly through the system

### Integration Test: Excel Import Workflow (US2)

- [x] T056 [P] [US2] Create integration test file at tests/integration/import-workflow.test.js
- [x] T057 [US2] Setup full DOM and storage mocks in beforeEach hook
- [x] T058 [US2] Write integration test for valid Excel import - file upload → parse → validate → store → verify in storage
- [x] T059 [US2] Write integration test for invalid Excel import - file upload → parse → validation errors → summary with valid/invalid counts
- [x] T060 [US2] Write integration test for Excel import with existing tasks - verify tasks are appended, not replaced
- [x] T061 [US2] Write integration test for import history tracking - verify importHistory object saved to storage

### Integration Test: Task Reordering Workflow (US2)

- [x] T062 [P] [US2] Create integration test file at tests/integration/reorder-workflow.test.js
- [x] T063 [US2] Setup populated storage state with multiple tasks in beforeEach
- [x] T064 [US2] Write integration test for drag-and-drop reorder - simulate drag → drop → verify task order changed in storage
- [x] T065 [US2] Write integration test for reorder with time recalculation - verify startTime/endTime updated after reorder
- [x] T066 [US2] Write integration test for reorder persistence - verify new order persists across page reload (storage retrieval)

### Integration Test: Time Update Workflow (US2)

- [x] T067 [P] [US2] Create integration test file at tests/integration/time-update-workflow.test.js
- [x] T068 [US2] Setup populated storage state with tasks in beforeEach
- [x] T069 [US2] Write integration test for estimated start time change - update start time → verify all tasks recalculated
- [x] T070 [US2] Write integration test for time update persistence - verify recalculated times saved to storage
- [x] T071 [US2] Write integration test for invalid time format handling - verify validation error, no state change

### Integration Test: Database Reset Workflow (US2)

- [x] T072 [P] [US2] Create integration test file at tests/integration/reset-workflow.test.js
- [x] T073 [US2] Setup populated storage state with tasks and import history in beforeEach
- [x] T074 [US2] Write integration test for reset confirmation flow - click reset → confirm dialog → confirm → verify storage cleared
- [x] T075 [US2] Write integration test for reset cancellation - click reset → confirm dialog → cancel → verify storage unchanged
- [x] T076 [US2] Write integration test for reset UI updates - verify UI state resets (empty state shown, import summary cleared)
- [x] T077 [US2] Write integration test for reset callback execution - verify onResetComplete callback triggered

**Checkpoint**: All 4 critical workflows have integration test coverage. Run `npm test tests/integration/` to verify workflows pass independently.

---

## Phase 5: User Story 3 - Test Infrastructure and Automation (Priority: P3)

**Goal**: Developers can execute tests via command line, see clear reports, track coverage, and integrate with CI environments

**Independent Test**: Run `npm test` and verify tests execute, display pass/fail results, show execution time. Run `npm run coverage` and verify HTML coverage report generated.

### Test Execution and Reporting (US3)

- [x] T078 [P] [US3] Verify `npm test` command runs all tests and displays pass/fail summary with execution time
- [x] T079 [P] [US3] Verify `npm run test:watch` command starts watch mode and re-runs tests on file changes
- [x] T080 [P] [US3] Verify `npm run test:ui` command launches Vitest UI in browser for interactive testing

### Code Coverage Reporting (US3)

- [x] T081 [P] [US3] Verify `npm run coverage` generates coverage report with line, branch, function, statement percentages
- [x] T082 [US3] Verify coverage HTML report generated at coverage/index.html with line-by-line highlighting
- [x] T083 [US3] Verify coverage thresholds enforced - exit with error if coverage below 80% for business logic
- [x] T084 [US3] Test coverage report excludes test files and correctly includes only src/ files

### Test Filtering and Selection (US3)

- [x] T085 [P] [US3] Verify `npx vitest tests/unit/` runs only unit tests
- [x] T086 [P] [US3] Verify `npx vitest tests/integration/` runs only integration tests
- [x] T087 [P] [US3] Verify `npx vitest -t "should calculate"` runs only tests matching pattern
- [x] T088 [P] [US3] Verify `npx vitest tests/unit/services/TaskCalculator.test.js` runs single test file

### CI Environment Support (US3)

- [x] T089 [P] [US3] Verify `npm run test:ci` runs tests with verbose output suitable for CI logs
- [x] T090 [US3] Verify tests pass in Node.js 18+ environment (minimum required version)
- [x] T091 [US3] Test that test suite executes successfully offline (no network requests)
- [x] T092 [US3] Create sample GitHub Actions workflow file at .github/workflows/test.yml (optional, documented in quickstart.md)

### Error Messages and Debugging (US3)

- [x] T093 [P] [US3] Verify failing tests display clear error messages with expected vs. actual values
- [x] T094 [US3] Verify failing tests display file path and line number of failure
- [x] T095 [US3] Verify failing tests display stack traces for debugging
- [x] T096 [US3] Test that test timeout errors provide clear messaging (default 5 second timeout)

**Checkpoint**: Test infrastructure fully automated. Developers can run tests with single commands, view reports, and integrate with CI.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, verification, and final quality checks

- [x] T097 [P] Update FUNCTIONAL-REQUIREMENTS.md with new section on automated testing capabilities, coverage requirements, and test execution instructions
- [x] T098 [P] Update README.md with "Running Tests" section including npm scripts and examples
- [x] T099 [P] Verify all test files follow naming convention (*.test.js) and are in correct directories
- [x] T100 Validate quickstart.md instructions - follow guide step-by-step to ensure accuracy
- [x] T101 Run full test suite with `npm run coverage` and verify 80% coverage threshold met for business logic
- [x] T102 Run test suite in watch mode and verify hot reload works correctly
- [x] T103 Test suite execution time verification - ensure total execution time under 10 seconds (Success Criteria SC-001)
- [x] T104 [P] Add .gitignore entries for coverage/, .vitest/ if not already present
- [x] T105 Final validation: Run `npm test && npm run coverage` and verify all tests pass with adequate coverage

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion AND User Story 1 completion (integration tests need unit-tested components)
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2), User Story 1, AND User Story 2 completion (needs tests to run)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Unit Tests**: Depends ONLY on Foundational phase. Can be implemented and tested independently.
- **User Story 2 (P2) - Integration Tests**: Depends on User Story 1 (needs unit-tested components to integrate). Integration tests verify US1 components work together.
- **User Story 3 (P3) - Test Infrastructure**: Depends on User Stories 1 & 2 (needs tests to execute and report on). Validates test execution and reporting.

### Within Each User Story

**User Story 1 (Unit Tests)**:
- Test helpers and fixtures MUST be ready (Foundational phase)
- Unit test files can be created in parallel (different files)
- Each module's tests are independent (TimeUtils tests don't depend on Task tests, etc.)

**User Story 2 (Integration Tests)**:
- US1 unit tests MUST pass first (ensures components work individually)
- Integration test files can be created in parallel (different workflows)
- Each workflow test is independent

**User Story 3 (Test Infrastructure)**:
- US1 and US2 tests MUST exist (validates execution and reporting)
- Verification tasks can run in parallel where noted

### Parallel Opportunities

#### Phase 1: Setup
- T003, T004, T005, T006 can run in parallel (different files, no dependencies)

#### Phase 2: Foundational
- T007, T008, T009, T010 can run in parallel (different helper files)
- T011, T012 can run in parallel (different fixture files)
- T013, T014, T015, T016 can run in parallel (different Excel fixtures)

#### Phase 3: User Story 1
Within each module, tests can be written in parallel:
- **TimeUtils tests**: T017-T021 (T018-T021 can be parallelized after T017 creates file)
- **Task tests**: T022-T027 (T023-T027 can be parallelized after T022 creates file)
- **TaskCalculator tests**: T028-T033 (T029-T033 can be parallelized after T028 creates file)
- **StorageService tests**: T034-T042 (T036-T042 can be parallelized after T034-T035 setup)
- **ExcelImporter tests**: T043-T048 (T044-T048 can be parallelized after T043 creates file)
- **ResetButton tests**: T049-T055 (T051-T055 can be parallelized after T049-T050 setup)

Different modules can be worked on in parallel (T017, T022, T028, T034, T043, T049 all marked [P])

#### Phase 4: User Story 2
- T056, T062, T067, T072 can run in parallel (creating different integration test files)
- Within each workflow, test cases can be written in parallel after file creation

#### Phase 5: User Story 3
- Most verification tasks marked [P] can run in parallel (T078-T080, T081-T084, T085-T088, T089-T091, T093-T095)

#### Phase 6: Polish
- T097, T098, T099, T104 can run in parallel (different files)

---

## Parallel Example: User Story 1 - Unit Tests

```bash
# After Foundational phase complete, launch unit test creation in parallel:

# TimeUtils tests
Task: "Create unit test file at tests/unit/utils/TimeUtils.test.js"

# Task model tests (parallel with TimeUtils)
Task: "Create unit test file at tests/unit/models/Task.test.js"

# TaskCalculator tests (parallel with above)
Task: "Create unit test file at tests/unit/services/TaskCalculator.test.js"

# StorageService tests (parallel with above)
Task: "Create unit test file at tests/unit/services/StorageService.test.js"

# ExcelImporter tests (parallel with above)
Task: "Create unit test file at tests/unit/services/ExcelImporter.test.js"

# ResetButton tests (parallel with above)
Task: "Create unit test file at tests/unit/components/ResetButton.test.js"

# All 6 modules can have their test files created and initial tests written in parallel
```

---

## Parallel Example: User Story 2 - Integration Tests

```bash
# After User Story 1 complete, launch integration test creation in parallel:

Task: "Create integration test file at tests/integration/import-workflow.test.js"
Task: "Create integration test file at tests/integration/reorder-workflow.test.js"
Task: "Create integration test file at tests/integration/time-update-workflow.test.js"
Task: "Create integration test file at tests/integration/reset-workflow.test.js"

# All 4 workflow tests can be created and written in parallel
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (6 tasks) - ~15 minutes
2. Complete Phase 2: Foundational (10 tasks) - ~1-2 hours
3. Complete Phase 3: User Story 1 (39 tasks) - ~4-6 hours
4. **STOP and VALIDATE**:
   - Run `npm test tests/unit/`
   - Verify all 6 modules have passing unit tests
   - Check coverage with `npm run coverage`
5. **MVP READY**: Unit test infrastructure complete and functional

### Incremental Delivery

1. **Foundation**: Setup + Foundational (~2 hours) → Test infrastructure ready
2. **MVP**: Add User Story 1 (~4-6 hours) → Unit tests working, independently testable
3. **Enhanced**: Add User Story 2 (~3-4 hours) → Integration tests working, workflows validated
4. **Complete**: Add User Story 3 (~2-3 hours) → Full automation, CI-ready, reporting
5. **Polished**: Phase 6 (~1-2 hours) → Documentation complete, validated

**Total Estimated Time**: 12-17 hours for complete test suite implementation

### Parallel Team Strategy

With 2-3 developers after Foundational phase:

1. **Team completes Setup + Foundational together** (~2 hours)
2. **Once Foundational is done**:
   - Developer A: TimeUtils + Task + TaskCalculator unit tests (T017-T033)
   - Developer B: StorageService + ExcelImporter unit tests (T034-T048)
   - Developer C: ResetButton unit tests + Integration tests setup (T049-T055, T056-T061)
3. **After US1 complete**:
   - Developer A: Import + Reorder integration tests (T056-T066)
   - Developer B: Time Update + Reset integration tests (T067-T077)
   - Developer C: Test infrastructure verification (T078-T096)
4. **Final polish together** (T097-T105)

**Parallel Team Estimate**: 6-8 hours total with 3 developers

---

## Task Summary

**Total Tasks**: 105
- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 10 tasks
- **Phase 3 (User Story 1 - Unit Tests)**: 39 tasks
- **Phase 4 (User Story 2 - Integration Tests)**: 22 tasks
- **Phase 5 (User Story 3 - Infrastructure)**: 19 tasks
- **Phase 6 (Polish)**: 9 tasks

**Parallelizable Tasks**: 47 tasks marked with [P]

**User Story Breakdown**:
- US1 (P1 - Unit Tests): 39 tasks - 6 modules × ~6-7 tests each
- US2 (P2 - Integration Tests): 22 tasks - 4 workflows × ~5-6 tests each
- US3 (P3 - Infrastructure): 19 tasks - Verification and automation

**Independent Test Criteria Met**:
- ✅ US1: Can run `npm test tests/unit/` independently
- ✅ US2: Can run `npm test tests/integration/` independently (requires US1 components)
- ✅ US3: Can run `npm test` and `npm run coverage` independently (requires US1 & US2 tests)

**Success Criteria Coverage**:
- SC-001: Test execution time verified in T103 (<10 seconds)
- SC-002: 80% coverage threshold verified in T083, T101
- SC-003: Single command execution verified in T078-T080
- SC-004: All workflows tested in US2 (T056-T077)
- SC-005: Error messages verified in T093-T095
- SC-006: CI support verified in T089-T091
- SC-007: Regression detection enabled by all tests
- SC-008: Infrastructure extensibility verified in T092

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [US1], [US2], [US3] labels map tasks to specific user stories for traceability
- Each user story is independently testable at its checkpoint
- Setup and Foundational phases MUST complete before user story work begins
- Test files follow naming convention: `*.test.js`
- Use AAA pattern (Arrange-Act-Assert) in all tests
- Each test should validate one behavior
- Use beforeEach/afterEach hooks to ensure test isolation
- Commit after completing each module's tests or logical test group
- Stop at checkpoints to validate story independently before proceeding

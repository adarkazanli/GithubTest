# Implementation Plan: Set Time to Now Button

**Branch**: `002-set-time-now` | **Date**: 2025-11-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-set-time-now/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Add a "Set to Now" button next to the existing "Update Times" button that captures the current system time and sets it as the estimated start time, triggering immediate recalculation of all task times. The button integrates with existing time management and state tracking in the task scheduler application.

**Technical Approach**: Extend existing time management UI in `index.html` with new button element. Add event handler in `src/main.js` that captures current time using JavaScript Date object, formats it to HH:MM, updates the time input field, and calls existing `handleStartTimeChange()` function. Button state management will hook into existing import operation tracking to disable during file imports.

## Technical Context

**Language/Version**: JavaScript ES6+ (matching existing codebase)
**Primary Dependencies**: None (vanilla JavaScript, SheetJS already in use for Excel)
**Storage**: localStorage for start time persistence (existing StorageService)
**Testing**: Vitest (existing test framework) with jsdom for DOM testing
**Target Platform**: Modern browsers (Chrome, Firefox, Safari - desktop and mobile)
**Project Type**: Single-page web application (static HTML/CSS/JavaScript)
**Performance Goals**:
  - Button click response: < 100ms
  - Time recalculation: < 500ms (per success criteria SC-002)
  - No UI blocking during operation
**Constraints**:
  - Static-only architecture (no backend)
  - Browser-native APIs only
  - Must work offline
  - Mobile-responsive (touch-friendly button)
**Scale/Scope**: Single feature addition (~100 LOC, 1 new button, 1 event handler, minimal CSS)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Static-Only Architecture
✅ **PASS** - Feature adds client-side button and JavaScript event handler. No server-side processing required. Uses browser's native Date API.

### Principle II: Browser Storage Mandatory
✅ **PASS** - Uses existing StorageService with localStorage to persist start time. No external storage services.

### Principle III: Excel Compatibility
✅ **PASS** - Feature does not affect Excel import/export. Integrates with existing import operation state to disable button during imports.

### Principle IV: Responsive Mobile-First Design
✅ **PASS** - Button will follow existing button styling and be touch-friendly. Will be tested on mobile viewports (320px minimum).

### Principle V: Zero External Dependencies
✅ **PASS** - Uses only browser native Date API. No new dependencies required. Works offline.

**Constitution Compliance**: ✅ ALL GATES PASSED - No violations, proceed to Phase 0

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ResetButton.js          # Existing component (reference for button patterns)
├── models/
│   └── Task.js                 # Existing - task entity
├── services/
│   ├── StorageService.js       # Existing - localStorage management
│   ├── ExcelImporter.js        # Existing - Excel import (state tracking)
│   └── TaskCalculator.js       # Existing - time calculations
├── utils/
│   └── TimeUtils.js            # Existing - time formatting/parsing utilities
└── main.js                     # PRIMARY MODIFICATION - add "Set to Now" button handler

index.html                      # PRIMARY MODIFICATION - add button element
styles/
└── main.css                    # MODIFICATION - add button styles

tests/
├── helpers/
│   └── dom-setup.js            # Existing test helpers
└── [new test files for this feature]
```

**Structure Decision**: Single-page application structure. All modifications integrate with existing codebase. Primary changes in `index.html` (add button), `src/main.js` (add event handler), and `styles/main.css` (button styling). No new modules required - leverages existing TimeUtils, StorageService, and TaskCalculator.

## Complexity Tracking

**No violations** - This section is not applicable as all constitution checks passed.

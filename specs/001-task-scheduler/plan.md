# Implementation Plan: Task Scheduler

**Branch**: `001-task-scheduler` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/001-task-scheduler/spec.md`

## Summary

Build a static single-page application that allows users to import Excel spreadsheets containing task data (order ID, task name, estimated duration in HH:MM format), view tasks with calculated start and end times, reorder tasks via drag-and-drop, and adjust the estimated start time with automatic recalculation. All data persists in browser storage and the application works completely offline.

## Technical Context

**Language/Version**: JavaScript (ES6+), HTML5, CSS3  - look and feel should be like Stripe.com
**Primary Dependencies**: SheetJS (xlsx library) for Excel processing, native browser APIs for drag-and-drop and storage  
**Storage**: IndexedDB for task data (large datasets), localStorage for schedule settings  
**Testing**: Manual testing in Chrome, Firefox, Safari (desktop + mobile)  
**Target Platform**: Web browser (cross-platform: Windows, macOS, Linux, iOS, Android)  
**Project Type**: Single-page web application (static SPA)  
**Performance Goals**: 
- Initial page load < 3 seconds on 3G
- Import 20 tasks < 5 seconds
- Support 100+ tasks with smooth scrolling
- Time recalculation < 1 second after drag-drop or start time change

**Constraints**: 
- Must work offline (no server, no API calls)
- Must deploy as static files only (index.html + JS/CSS/assets)
- Must use browser-native storage (no external databases)
- File size optimized for CDN delivery
- Must support mobile devices (320px minimum)

**Scale/Scope**: 
- 10-100 tasks per schedule
- Single user per browser instance
- Excel files up to 1MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

✅ **I. Static-Only Architecture**: Application will be built as pure static HTML/CSS/JavaScript with no server components  
✅ **II. Browser Storage Mandatory**: Using IndexedDB for task data and localStorage for settings per constitution  
✅ **III. Excel Compatibility**: Using SheetJS (xlsx) client-side library for Excel import/export  
✅ **IV. Responsive Mobile-First Design**: Mobile-first CSS with responsive breakpoints, touch-friendly drag-drop  
✅ **V. Zero External Dependencies**: Bundle all dependencies (SheetJS, CSS) with application

No violations detected. Plan aligns with all constitutional principles.

## Project Structure

### Documentation (this feature)

```text
specs/001-task-scheduler/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
index.html              # Main application entry point
src/
├── models/
│   └── Task.js         # Task data model with duration parsing
├── services/
│   ├── ExcelImporter.js    # Excel file parsing and validation
│   ├── TaskCalculator.js   # Start/end time calculations
│   └── StorageService.js   # IndexedDB and localStorage management
├── ui/
│   ├── TaskList.js         # Task list rendering and drag-drop UI
│   ├── ImportPanel.js      # Excel file upload UI
│   ├── ScheduleControls.js # Start time input and controls
│   └── ImportSummary.js    # Display import validation results
└── utils/
    ├── TimeUtils.js        # HH:MM time parsing and manipulation
    └── DragDropUtils.js    # Drag-and-drop helper functions

assets/
└── lib/
    └── xlsx.full.min.js    # SheetJS library (bundled)

styles/
└── main.css               # Mobile-first responsive CSS

dist/                      # Built output for deployment
└── [bundled static files]
```

**Structure Decision**: Single-page application structure with modular JavaScript organized by responsibility (models, services, UI components, utilities). This structure supports static bundling while maintaining code organization and facilitating offline operation. All files are browser-compatible with no Node.js-specific APIs.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all complexity is justified by constitutional requirements.


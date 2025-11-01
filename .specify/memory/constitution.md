<!--
  Sync Impact Report:

  Version Change: 1.0.0 → 1.1.0 (test automation introduction)

  Modified Sections:
  - Technical Constraints: Added Test Automation stack requirements
  - Testing Requirements: Replaced manual-only with automated + manual strategy

  Rationale:
  Introducing automated testing to improve code quality, catch regressions early,
  and enable confident refactoring while maintaining static-only architecture.

  Templates requiring updates:
  - ✅ Updated: plan-template.md alignment maintained
  - ✅ Updated: spec-template.md alignment maintained
  - ✅ Updated: tasks-template.md alignment maintained

  Follow-up TODOs:
  - Set up Vitest configuration
  - Set up Playwright configuration
  - Add ESLint configuration
  - Create initial test examples
-->

# DataSheet Pro Constitution

## Core Principles

### I. Static-Only Architecture (NON-NEGOTIABLE)
All application logic MUST be delivered as static HTML/CSS/JavaScript files. No server-side processing, database connections, or backend APIs. The application must function completely offline without internet connectivity. Rationale: Enables CDN hosting and guarantees zero infrastructure requirements.

### II. Browser Storage Mandatory
All application data MUST be persisted using browser-native storage APIs (localStorage, sessionStorage, or IndexedDB). No external data persistence services, cloud databases, or remote file storage. Data MUST remain local to the user's browser. Rationale: Preserves user privacy and enables true offline operation.

### III. Excel Compatibility (NON-NEGOTIABLE)
The application MUST support importing Excel spreadsheets (.xlsx format) and exporting data to Excel-compatible files. Implementation MUST use client-side JavaScript libraries (e.g., SheetJS, ExcelJS) to process Excel files entirely in the browser. No server-side file processing. Rationale: Core user requirement for data import/export workflows.

### IV. Responsive Mobile-First Design
All user interfaces MUST be responsive and fully functional on mobile devices (320px minimum width). Desktop views MUST gracefully enhance from mobile-first layouts. Touch interactions MUST be supported alongside mouse interactions. Rationale: User explicitly requires phone compatibility and CDN deployment strategy targets mobile users.

### V. Zero External Dependencies at Runtime
All JavaScript libraries, CSS frameworks, and fonts MUST either be bundled with the application or loaded from CDN in offline-capable manner. Avoid reliance on internet connectivity for core functionality. The application MUST be self-contained in a single folder structure. Rationale: Enables deployment to any static hosting (Google Drive, Dropbox, GitHub Pages) without configuration.

## Technical Constraints

### Stack Requirements
- **Frontend Only**: Pure HTML5 + JavaScript (ES6+) + CSS3
- **Build Tools**: Must support static bundling (e.g., Vite, Webpack, or rollup)
- **Excel Processing**: Client-side library (SheetJS xlsx recommended)
- **Storage**: IndexedDB preferred for large datasets, localStorage for configuration
- **No Frameworks**: Vanilla JS or light framework (Vue/React) that bundles completely
- **Test Automation**: Vitest for unit/integration tests, Playwright for E2E tests
- **Code Quality**: ESLint for linting, must pass all tests before commits

### Deployment Constraints
- MUST deploy as static files (index.html + assets/)
- File size MUST be optimized for CDN delivery
- MUST work from any file:// protocol or HTTP(S)
- No requirements for server configuration, rewrites, or routing

### Performance Requirements
- Initial page load: < 3 seconds on 3G connection
- Excel import (10K rows): < 5 seconds in browser
- Excel export (10K rows): < 5 seconds in browser
- No network requests after initial load

## Development Workflow

### Code Organization
- Single-page application structure (single HTML file with embedded or linked JS)
- Or multi-file structure (HTML, JS modules, CSS) bundled into static build
- All code MUST be browser-compatible (no Node.js-only APIs in runtime)

### Testing Requirements

#### Automated Testing (REQUIRED)

All code changes MUST include appropriate automated tests:

**Unit Tests** (Vitest):
- Test utility functions (TimeUtils, validators, formatters)
- Test model classes (Task) and their methods
- Test calculation logic in isolation
- Minimum 80% code coverage for utilities and models
- Run in jsdom/happy-dom environment (no real browser needed)

**Integration Tests** (Vitest + Browser APIs):
- Test StorageService with IndexedDB and localStorage
- Test ExcelService with real .xlsx file parsing
- Test data persistence and reconstruction
- Mock browser APIs where necessary

**End-to-End Tests** (Playwright):
- Test complete user workflows (import, reorder, adjust times)
- Test drag-and-drop interactions on desktop
- Test mobile touch interactions
- Test database reset flow with confirmation
- Run on Chrome, Firefox, and Safari (WebKit)
- Include visual regression tests for critical UI components

**Code Quality** (ESLint):
- Enforce consistent code style
- Catch common errors and anti-patterns
- Ensure ES6+ best practices
- Must pass linting before commits

**Pre-commit Requirements**:
- All unit tests must pass
- All integration tests must pass
- ESLint must pass with no errors
- Code coverage must meet minimums
- E2E tests should pass (run in CI, not blocking for local commits)

#### Manual Testing (SUPPLEMENTAL)

Manual testing supplements automated tests for subjective qualities:

- Visual design review on Chrome, Firefox, Safari (desktop + mobile)
- Responsive layout verification at key breakpoints (320px, 768px, 1024px, 1920px)
- Offline functionality verification (disable network, test full workflow)
- Real Excel file imports from various sources (Excel, Google Sheets, LibreOffice)
- Accessibility review (keyboard navigation, screen reader compatibility)
- Performance profiling (page load, import speed, calculation speed)

### Documentation Consistency (REQUIRED)

Before every commit, ensure FUNCTIONAL-REQUIREMENTS.md is up to date and consistent with code changes:

- **New Features**: Add corresponding functional requirements sections
- **Modified Features**: Update existing requirements to reflect implementation changes
- **Bug Fixes**: Verify requirements accurately describe corrected behavior
- **Breaking Changes**: Update acceptance criteria and validation rules
- **UI Changes**: Update UI requirements and component styling specifications
- **Data Model Changes**: Update data entity definitions and validation rules

The FUNCTIONAL-REQUIREMENTS.md serves as the authoritative reference for all system capabilities. Code and documentation MUST remain synchronized at all times.

### Version Control
- Commit static output files (dist/ folder) to enable GitHub Pages hosting
- Or document CDN deployment process for non-Git workflows
- MUST include FUNCTIONAL-REQUIREMENTS.md updates in the same commit as related code changes

## Governance

This constitution defines non-negotiable principles for the DataSheet Pro application. All implementation decisions must align with these principles.

Amendments require version bump and documented rationale:
- MAJOR (X.0.0): Breaking principle changes
- MINOR (1.X.0): New principles or constraints
- PATCH (1.0.X): Clarifications or refinements

Compliance verification:
- Review each feature addition against all principles
- Reject PRs that violate NON-NEGOTIABLE principles
- Document justification for any principle-related complexity

**Version**: 1.1.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-11-01

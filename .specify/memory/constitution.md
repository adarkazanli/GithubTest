<!--
  Sync Impact Report:
  
  Version Change: N/A → 1.0.0 (initial creation)
  
  Modified Principles: N/A (initial constitution)
  
  Added Sections:
  - Core Principles (5 principles)
  - Technical Constraints
  - Development Workflow
  - Governance
  
  Templates requiring updates:
  - ✅ Updated: plan-template.md alignment maintained
  - ✅ Updated: spec-template.md alignment maintained
  - ✅ Updated: tasks-template.md alignment maintained
  
  Follow-up TODOs: None
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
- Manual testing on Chrome, Firefox, Safari (desktop + mobile)
- Test offline functionality by disabling network
- Test Excel import/export with real .xlsx files
- Validate responsive design at multiple viewport sizes

### Version Control
- Commit static output files (dist/ folder) to enable GitHub Pages hosting
- Or document CDN deployment process for non-Git workflows

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

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27

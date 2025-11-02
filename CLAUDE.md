# GithubSpecTest Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-26

## Active Technologies
- JavaScript ES6+ (matching existing codebase) (001-test-suite)
- Browser APIs (localStorage mocking required for Node.js test environment) (001-test-suite)
- JavaScript ES6+ (matching existing codebase) + None (vanilla JavaScript, SheetJS already in use for Excel) (002-set-time-now)
- localStorage for start time persistence (existing StorageService) (002-set-time-now)

- Vanilla JavaScript (ES6+), HTML5, CSS3 + None (vanilla JS), SheetJS (xlsx.js) for existing Excel functionality (001-database-reset-button)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

Vanilla JavaScript (ES6+), HTML5, CSS3: Follow standard conventions

## Recent Changes
- 002-set-time-now: Added JavaScript ES6+ (matching existing codebase) + None (vanilla JavaScript, SheetJS already in use for Excel)
- 001-test-suite: Added JavaScript ES6+ (matching existing codebase)

- 001-database-reset-button: Added Vanilla JavaScript (ES6+), HTML5, CSS3 + None (vanilla JS), SheetJS (xlsx.js) for existing Excel functionality

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

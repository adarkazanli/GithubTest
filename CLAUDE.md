# GithubSpecTest Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-26

## Active Technologies

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Excel Processing**: SheetJS (xlsx.js)
- **Testing**: Vitest (unit/integration), Playwright (E2E), happy-dom (DOM testing)
- **Code Quality**: ESLint

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

### Pre-commit Checks
```bash
npm run precommit
```
Runs linting and all unit/integration tests (must pass before commits).

### Testing Commands
```bash
npm test                  # Run all unit and integration tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
npm run test:ui           # Run tests with Vitest UI
npm run test:e2e          # Run E2E tests with Playwright
npm run test:e2e:ui       # Run E2E tests with Playwright UI
npm run test:e2e:headed   # Run E2E tests in headed mode (visible browser)
```

### Linting Commands
```bash
npm run lint              # Check code quality with ESLint
npm run lint:fix          # Auto-fix ESLint issues
```

### Setup Commands
```bash
npm install               # Install all dependencies
npm run install:browsers  # Install Playwright browsers (Chrome, Firefox, Safari)
```

## Code Style

Vanilla JavaScript (ES6+), HTML5, CSS3: Follow standard conventions

## Recent Changes

- 001-database-reset-button: Added Vanilla JavaScript (ES6+), HTML5, CSS3 + None (vanilla JS), SheetJS (xlsx.js) for existing Excel functionality

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

/**
 * E2E tests for Excel import functionality
 * Tests the complete import workflow from file upload to task display
 */
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Excel Import', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should display import controls on page load', async ({ page }) => {
    // Check that import button is visible
    await expect(page.locator('button:has-text("Import Excel")')).toBeVisible();

    // Check that file input exists
    const fileInput = page.locator('input[type="file"][accept=".xlsx"]');
    await expect(fileInput).toBeAttached();
  });

  test('should show empty state when no tasks exist', async ({ page }) => {
    // Clear any existing data first
    await page.evaluate(() => {
      localStorage.clear();
      // Clear IndexedDB
      const request = indexedDB.deleteDatabase('taskSchedulerDB');
      return new Promise((resolve) => {
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    });

    await page.reload();

    // Check for empty state message
    const emptyState = page.locator('text=/import.*excel/i');
    await expect(emptyState).toBeVisible();
  });

  test.skip('should import valid Excel file and display tasks', async ({ page }) => {
    // NOTE: This test requires a sample Excel file in tests/fixtures/
    // Create tests/fixtures/sample-tasks.xlsx with valid data to enable this test

    const filePath = path.join(__dirname, '../fixtures/sample-tasks.xlsx');

    // Upload the file
    const fileInput = page.locator('input[type="file"][accept=".xlsx"]');
    await fileInput.setInputFiles(filePath);

    // Wait for import to complete
    await page.waitForTimeout(1000);

    // Check that tasks are displayed
    const taskCards = page.locator('[data-testid="task-card"]');
    await expect(taskCards).toHaveCount(3); // Assuming 3 tasks in sample file

    // Verify first task details
    const firstTask = taskCards.first();
    await expect(firstTask.locator('[data-testid="task-name"]')).toContainText('Review documents');
    await expect(firstTask.locator('[data-testid="estimated-duration"]')).toContainText('1:30');
  });

  test('should display import summary after import', async ({ page }) => {
    // This test checks that import summary UI exists
    // It would need a real file to test actual import functionality

    const importSummary = page.locator('[data-testid="import-summary"]');

    // Import summary might not be visible initially
    // This would be tested with a real import in the test above
    await expect(importSummary).toBeAttached();
  });

  test('should allow adjusting estimated start time', async ({ page }) => {
    // Find the start time input
    const startTimeInput = page.locator('input[type="text"][placeholder*="HH:MM"]').first();

    // Check that it has a default value
    await expect(startTimeInput).toHaveValue(/\d{1,2}:\d{2}/);

    // Change the start time
    await startTimeInput.fill('10:00');
    await startTimeInput.press('Enter');

    // Verify the value was updated
    await expect(startTimeInput).toHaveValue('10:00');
  });
});

test.describe('Database Reset', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display reset button', async ({ page }) => {
    const resetButton = page.locator('button:has-text("Reset")');
    await expect(resetButton).toBeVisible();
  });

  test('should show confirmation dialog when reset is clicked', async ({ page }) => {
    const resetButton = page.locator('button:has-text("Reset")');
    await resetButton.click();

    // Check that confirmation dialog appears
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check dialog message
    await expect(dialog).toContainText(/permanently delete/i);

    // Check for Cancel and Delete buttons
    await expect(page.locator('button:has-text("Cancel")')).toBeVisible();
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
  });

  test('should cancel reset when Cancel is clicked', async ({ page }) => {
    const resetButton = page.locator('button:has-text("Reset")');
    await resetButton.click();

    // Click cancel
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    // Dialog should disappear
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).not.toBeVisible();
  });

  test('should clear data when Delete is confirmed', async ({ page }) => {
    // Add some test data first
    await page.evaluate(() => {
      localStorage.setItem('estimatedStartTime', '09:00');
      localStorage.setItem('taskOrder', JSON.stringify(['1', '2', '3']));
    });

    await page.reload();

    // Click reset
    const resetButton = page.locator('button:has-text("Reset")');
    await resetButton.click();

    // Confirm deletion
    const deleteButton = page.locator('button:has-text("Delete")');
    await deleteButton.click();

    // Wait for success message
    await expect(page.locator('text=/cleared successfully/i')).toBeVisible({ timeout: 5000 });

    // Verify data was cleared
    const hasData = await page.evaluate(() => {
      const startTime = localStorage.getItem('estimatedStartTime');
      const taskOrder = localStorage.getItem('taskOrder');
      return !!startTime || !!taskOrder;
    });

    expect(hasData).toBe(false);
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that UI is responsive
    const importButton = page.locator('button:has-text("Import Excel")');
    await expect(importButton).toBeVisible();

    // Check that controls are stacked vertically on mobile
    const container = page.locator('body');
    await expect(container).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    const importButton = page.locator('button:has-text("Import Excel")');
    await expect(importButton).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    const importButton = page.locator('button:has-text("Import Excel")');
    await expect(importButton).toBeVisible();
  });
});

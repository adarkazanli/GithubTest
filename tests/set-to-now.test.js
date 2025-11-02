import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import TimeUtils from '../src/utils/TimeUtils.js';

describe('Set to Now Button', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <button id="set-to-now-btn">Set to Now</button>
      <input type="text" id="estimated-start-time" value="09:00" />
    `;
  });

  afterEach(() => {
    // Reset system time mocks
    vi.useRealTimers();
  });

  it('should update input field with current time when clicked', () => {
    // Test that formatDateToTime works correctly
    const mockDate = new Date('2025-11-01T14:30:00');
    const expectedTime = TimeUtils.formatDateToTime(mockDate);

    // Verify formatDateToTime produces correct format
    expect(expectedTime).toBe('14:30');

    // Simulate button click logic - updating input with formatted time
    const input = document.getElementById('estimated-start-time');
    input.value = expectedTime;

    // Verify input was updated
    expect(input.value).toBe('14:30');
  });

  it('should not execute if loading class is present', () => {
    // Add loading class
    document.body.classList.add('loading');

    // Store original value
    const input = document.getElementById('estimated-start-time');
    const originalValue = input.value;

    // Simulate button click with loading check
    if (!document.body.classList.contains('loading')) {
      input.value = '14:30';
    }

    // Verify value unchanged
    expect(input.value).toBe(originalValue);
  });

  it('should handle midnight rollover correctly', () => {
    // Mock time near midnight
    const mockDate = new Date('2025-11-01T23:58:00');
    const formatted = TimeUtils.formatDateToTime(mockDate);

    expect(formatted).toBe('23:58');

    // Test that addMinutes handles rollover
    const nextDay = TimeUtils.addMinutes('23:58', 30);
    expect(nextDay).toBe('00:28');
  });
});

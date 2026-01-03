/**
 * Common scraper utilities
 * Shared functions and constants used across multiple scrapers
 */

import type { Page } from 'playwright-core';

// ============================================================================
// Constants & Configuration
// ============================================================================

/**
 * Default delay times in milliseconds
 */
export const DEFAULT_SCROLL_WAIT = 1500;
export const MAX_SCROLL_ATTEMPTS = 20;
export const HUMAN_DELAY_MIN = 500;
export const HUMAN_DELAY_MAX = 1500;
export const DEFAULT_TIMEOUT = 10000;

/**
 * Scroll configuration
 */
export const SCROLL_CONFIG = {
  defaultDelay: 1500,
  maxAttempts: 3,
  defaultMaxAttempts: 20
} as const;

/**
 * Wait configuration
 */
export const WAIT_CONFIG = {
  defaultTimeout: 10000,
  navigationTimeout: 30000
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Human-like delay between actions to avoid rate limiting.
 * Adds random variance to make delays appear more natural.
 *
 * @param min - Minimum delay in milliseconds (default: 500ms)
 * @param max - Maximum delay in milliseconds (default: 1500ms)
 * @returns Promise that resolves after the delay
 *
 * @example
 * await humanDelay(); // Random delay between 500-1500ms
 * await humanDelay(1000, 2000); // Random delay between 1000-2000ms
 */
export async function humanDelay(
  min: number = HUMAN_DELAY_MIN,
  max: number = HUMAN_DELAY_MAX
): Promise<void> {
  const delay = min + Math.random() * (max - min);
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Scroll page to load more content via infinite scroll.
 * Returns true if new content was loaded.
 *
 * @param page - Playwright page instance
 * @param maxAttempts - Maximum scroll attempts without new content (default: 3)
 * @param scrollDelay - Delay in milliseconds to wait after scrolling (default: 1500ms)
 * @returns True if new content was loaded, false if reached end of content
 *
 * @example
 * const hasMore = await scrollForMore(page);
 * if (!hasMore) {
 *   console.log('Reached end of content');
 * }
 *
 * // LinkedIn example with longer delay
 * const hasMore = await scrollForMore(page, 3, 2000);
 */
export async function scrollForMore(
  page: Page,
  maxAttempts: number = SCROLL_CONFIG.maxAttempts,
  scrollDelay: number = DEFAULT_SCROLL_WAIT
): Promise<boolean> {
  let attempts = 0;
  let previousHeight = await page.evaluate(() => document.body.scrollHeight);

  while (attempts < maxAttempts) {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for content to load
    await page.waitForTimeout(scrollDelay);

    // Check if height changed
    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (newHeight > previousHeight) {
      previousHeight = newHeight; // Update for next iteration
      attempts = 0; // Reset attempts counter on success
      return true;
    }

    attempts++;
  }

  return false;
}

/**
 * Wait for element with timeout.
 * More convenient than direct waitForSelector as it returns boolean.
 *
 * @param page - Playwright page instance
 * @param selector - CSS selector to wait for
 * @param timeout - Timeout in milliseconds (default: 10000ms)
 * @returns True if element was found, false if timeout occurred
 *
 * @example
 * const found = await waitForElement(page, '.my-selector');
 * if (!found) {
 *   throw new Error('Element not found');
 * }
 */
export async function waitForElement(
  page: Page,
  selector: string,
  timeout: number = DEFAULT_TIMEOUT
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

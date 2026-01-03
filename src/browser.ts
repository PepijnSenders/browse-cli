// src/browser.ts
import { chromium, Browser, Page } from 'playwright-core';

let browser: Browser | null = null;
let currentPageIndex = 0;

const PLAYWRITER_HOST = process.env.PLAYWRITER_HOST || '127.0.0.1';
const PLAYWRITER_PORT = process.env.PLAYWRITER_PORT || '19988';
const CONNECTION_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 100; // ms

/**
 * Helper function to retry an async operation with exponential backoff
 * @param fn The async function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param initialDelay Initial delay in milliseconds (doubles each retry)
 * @param shouldRetry Optional function to determine if error is retryable
 * @returns The result of the function call
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES,
  initialDelay: number = INITIAL_RETRY_DELAY,
  shouldRetry?: (error: Error) => boolean
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry this error
      if (shouldRetry && !shouldRetry(lastError)) {
        throw lastError;
      }

      // If this is the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Calculate exponential backoff delay
      const delay = initialDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Determines if an error is a connection refused error that should be retried
 */
function isConnectionRefusedError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return message.includes('econnrefused') ||
         message.includes('connection refused') ||
         message.includes('connect econnrefused');
}

/**
 * Determines if an error is a timeout error
 */
function isTimeoutError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return message.includes('timeout') || message.includes('timed out');
}

/**
 * Wraps a promise with a timeout
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string
): Promise<T> {
  let timeoutId: Timer | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  }
}

export async function connect(): Promise<Browser> {
  if (browser?.isConnected()) {
    return browser;
  }

  const wsEndpoint = `ws://${PLAYWRITER_HOST}:${PLAYWRITER_PORT}`;

  try {
    // Try to connect with timeout and retry logic
    browser = await withRetry(
      async () => {
        return await withTimeout(
          chromium.connectOverCDP(wsEndpoint),
          CONNECTION_TIMEOUT,
          `Connection timeout after ${CONNECTION_TIMEOUT}ms. The Playwriter extension may not be responding.`
        );
      },
      MAX_RETRIES,
      INITIAL_RETRY_DELAY,
      isConnectionRefusedError
    );

    return browser;
  } catch (error) {
    if (error instanceof Error) {
      // Connection refused after retries
      if (isConnectionRefusedError(error)) {
        throw new Error(
          'Extension not connected. Click the Playwriter extension icon in Chrome to enable browser control.\n' +
          `Tried to connect ${MAX_RETRIES} times to ${wsEndpoint}.`
        );
      }

      // Timeout error
      if (isTimeoutError(error)) {
        throw new Error(
          `Connection timeout after ${CONNECTION_TIMEOUT}ms. The Playwriter extension may not be responding.\n` +
          'Make sure Chrome is running and the Playwriter extension is active.'
        );
      }
    }

    // Re-throw other errors as-is
    throw error;
  }
}

export async function getPages(): Promise<Page[]> {
  const b = await connect();
  const contexts = b.contexts();

  if (contexts.length === 0) {
    throw new Error('No pages available. Click the Playwriter extension icon on a Chrome tab.');
  }

  return contexts[0].pages();
}

export async function getPage(): Promise<Page> {
  const pages = await getPages();

  if (pages.length === 0) {
    throw new Error('No pages available');
  }

  // Clamp index to valid range
  currentPageIndex = Math.max(0, Math.min(currentPageIndex, pages.length - 1));

  return pages[currentPageIndex];
}

export async function switchPage(index: number): Promise<Page> {
  const pages = await getPages();

  if (index < 0 || index >= pages.length) {
    throw new Error(`Invalid page index: ${index}. Available: 0-${pages.length - 1}`);
  }

  currentPageIndex = index;
  return pages[index];
}

export async function disconnect(): Promise<void> {
  if (browser) {
    await browser.close();
    browser = null;
  }
}

export function isConnected(): boolean {
  return browser?.isConnected() ?? false;
}

export function detectConnectionError(error: Error): { code: number; message: string; hint: string } {
  const msg = error.message.toLowerCase();

  if (msg.includes('econnrefused') || msg.includes('connect')) {
    return {
      code: 2,
      message: 'Extension not connected',
      hint: 'Make sure Chrome has the Playwriter extension installed. Click the extension icon on a tab to enable control.'
    };
  }

  if (msg.includes('no pages')) {
    return {
      code: 3,
      message: 'No pages available',
      hint: 'Click the Playwriter extension icon on a Chrome tab to enable control.'
    };
  }

  return {
    code: 1,
    message: error.message,
    hint: 'An unexpected error occurred.'
  };
}

export async function listPages(): Promise<Array<{ index: number; url: string; title: string }>> {
  const pages = await getPages();

  return Promise.all(
    pages.map(async (page, index) => ({
      index,
      url: page.url(),
      title: await page.title()
    }))
  );
}

export async function getPageInfo(): Promise<{ url: string; title: string }> {
  const page = await getPage();
  return {
    url: page.url(),
    title: await page.title()
  };
}

export async function ensureConnection(): Promise<Browser> {
  if (browser && !browser.isConnected()) {
    browser = null;
  }
  return connect();
}

export async function runCommand(command: () => Promise<void>): Promise<void> {
  try {
    await connect();
    await command();
  } finally {
    await disconnect();
  }
}

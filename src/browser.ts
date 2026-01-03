import { chromium, type Browser, type Page } from 'playwright-core';

// State management
let browser: Browser | null = null;
let currentPageIndex = 0;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let isConnecting = false;

// Configuration from environment
const PLAYWRITER_HOST = process.env.PLAYWRITER_HOST || '127.0.0.1';
const PLAYWRITER_PORT = parseInt(process.env.PLAYWRITER_PORT || '19988', 10);
const RECONNECT_DELAY = 5000; // 5 seconds

/**
 * Connects to the Playwriter relay server and returns a browser instance.
 * If already connected, returns the existing connection.
 */
async function connectBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) {
    return browser;
  }

  if (isConnecting) {
    // Wait for ongoing connection attempt
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (browser && browser.isConnected()) {
      return browser;
    }
  }

  isConnecting = true;

  try {
    const wsEndpoint = `ws://${PLAYWRITER_HOST}:${PLAYWRITER_PORT}`;
    browser = await chromium.connectOverCDP(wsEndpoint);

    // Set up disconnect handler for auto-reconnect
    browser.on('disconnected', handleDisconnect);

    currentPageIndex = 0;
    isConnecting = false;

    return browser;
  } catch (error) {
    isConnecting = false;
    throw new Error(
      `Failed to connect to Playwriter relay at ${PLAYWRITER_HOST}:${PLAYWRITER_PORT}. ` +
        `Make sure the Playwriter extension is installed and active on a Chrome tab. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Handle browser disconnection and schedule reconnection
 */
function handleDisconnect(): void {
  browser = null;

  // Clear any existing timer
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }

  // Schedule reconnection attempt
  reconnectTimer = setTimeout(async () => {
    try {
      await connectBrowser();
    } catch (_error) {
      // Connection failed, will retry on next call
    }
  }, RECONNECT_DELAY);
}

/**
 * Returns the connected browser instance.
 * Throws if not connected.
 */
export async function getBrowser(): Promise<Browser> {
  if (browser && browser.isConnected()) {
    return browser;
  }

  return await connectBrowser();
}

/**
 * Returns the current active page (tab).
 * Throws if no pages are available.
 */
export async function getPage(): Promise<Page> {
  const pages = await getPages();

  if (pages.length === 0) {
    throw new Error(
      'No pages available. Click the Playwriter extension icon on a Chrome tab to enable control.'
    );
  }

  if (currentPageIndex >= pages.length) {
    currentPageIndex = 0;
  }

  return pages[currentPageIndex];
}

/**
 * Returns all available pages (tabs) controlled by Playwriter.
 */
export async function getPages(): Promise<Page[]> {
  const browserInstance = await getBrowser();
  const contexts = browserInstance.contexts();

  if (contexts.length === 0) {
    return [];
  }

  // Playwriter typically uses a single context with multiple pages
  const pages: Page[] = [];
  for (const context of contexts) {
    pages.push(...context.pages());
  }

  return pages;
}

/**
 * Switch to a different tab by index.
 * @param index - Zero-based index of the tab to switch to
 */
export async function switchPage(index: number): Promise<Page> {
  const pages = await getPages();

  if (pages.length === 0) {
    throw new Error(
      'No pages available. Click the Playwriter extension icon on a Chrome tab to enable control.'
    );
  }

  if (index < 0 || index >= pages.length) {
    throw new Error(
      `Invalid page index ${index}. Available pages: 0-${pages.length - 1}`
    );
  }

  currentPageIndex = index;
  return pages[currentPageIndex];
}

/**
 * Check if browser is currently connected.
 */
export function isConnected(): boolean {
  return browser !== null && browser.isConnected();
}

/**
 * Disconnect and cleanup.
 * Useful for testing or graceful shutdown.
 */
export async function disconnect(): Promise<void> {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (browser) {
    try {
      await browser.close();
    } catch (_error) {
      // Ignore errors during close
    }
    browser = null;
  }

  currentPageIndex = 0;
  isConnecting = false;
}

// Export types for convenience
export type { Browser, Page } from 'playwright-core';

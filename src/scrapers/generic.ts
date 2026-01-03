/**
 * Generic Web Scraper
 *
 * Site-agnostic page scraping capabilities for extracting text, links, images,
 * and structured data from any web page.
 */

import type { Page } from 'playwright-core';

/**
 * Result from scraping a page
 */
export interface PageContent {
  /** Current page URL */
  url: string;
  /** Page title */
  title: string;
  /** CSS selector used (if scoped extraction) */
  selector?: string;
  /** Extracted text content */
  text: string;
  /** HTML content (only when selector provided) */
  html?: string;
  /** Links found on the page */
  links: Array<{
    text: string;
    href: string;
  }>;
  /** Images found on the page */
  images: Array<{
    alt: string;
    src: string;
  }>;
}

/**
 * Result from navigation
 */
export interface NavigateResult {
  success: boolean;
  url: string;
  title: string;
}

// Size limits to prevent overwhelming the MCP client
const MAX_TEXT_LENGTH = 100_000; // 100k characters
const MAX_HTML_LENGTH = 50_000; // 50k characters
const MAX_LINKS = 100;
const MAX_IMAGES = 50;
const MAX_SCRIPT_RESULT_SIZE = 1_000_000; // 1MB

/**
 * Extract content from the current page.
 *
 * @param page - Playwright page instance
 * @param selector - Optional CSS selector to scope extraction to a specific element
 * @returns Extracted page content
 */
export async function scrapePage(
  page: Page,
  selector?: string
): Promise<PageContent> {
  if (selector) {
    return await scrapePageScoped(page, selector);
  }

  return await page.evaluate(
    ({ maxText, maxLinks, maxImages }) => {
      // Helper to get text from an element, skipping hidden/script/style
      const getText = (el: Element): string => {
        // Skip hidden elements
        const style = window.getComputedStyle(el);
        if (style.display === 'none' || style.visibility === 'hidden') {
          return '';
        }

        // Skip script/style/noscript
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) {
          return '';
        }

        return el.textContent || '';
      };

      // Find main content area (prioritize semantic HTML)
      const mainContent =
        document.querySelector('main') ||
        document.querySelector('article') ||
        document.querySelector('[role="main"]') ||
        document.body;

      // Extract links
      const links = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => ({
          text: (a.textContent?.trim() || '').replace(/\s+/g, ' '),
          href: (a as HTMLAnchorElement).href,
        }))
        .filter((l) => l.href && l.href.startsWith('http'))
        // Deduplicate by href
        .filter(
          (l, i, arr) => arr.findIndex((x) => x.href === l.href) === i
        )
        .slice(0, maxLinks);

      // Extract images
      const images = Array.from(document.querySelectorAll('img[src]'))
        .map((img) => ({
          alt: img.getAttribute('alt') || '',
          src: (img as HTMLImageElement).src,
        }))
        .filter((i) => i.src && i.src.startsWith('http'))
        // Deduplicate by src
        .filter(
          (i, idx, arr) => arr.findIndex((x) => x.src === i.src) === idx
        )
        .slice(0, maxImages);

      // Get text and normalize whitespace
      const rawText = getText(mainContent);
      const normalizedText = rawText
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n');

      return {
        url: window.location.href,
        title: document.title,
        text: normalizedText.slice(0, maxText),
        links,
        images,
      };
    },
    {
      maxText: MAX_TEXT_LENGTH,
      maxLinks: MAX_LINKS,
      maxImages: MAX_IMAGES,
    }
  );
}

/**
 * Extract content from a specific element on the page.
 *
 * @param page - Playwright page instance
 * @param selector - CSS selector for the element to extract
 * @returns Extracted content from the scoped element
 */
async function scrapePageScoped(
  page: Page,
  selector: string
): Promise<PageContent> {
  return await page.evaluate(
    ({ sel, maxText, maxHtml, maxLinks, maxImages }) => {
      const element = document.querySelector(sel);
      if (!element) {
        throw new Error(`Element not found: ${sel}`);
      }

      // Extract links within the element
      const links = Array.from(element.querySelectorAll('a[href]'))
        .map((a) => ({
          text: (a.textContent?.trim() || '').replace(/\s+/g, ' '),
          href: (a as HTMLAnchorElement).href,
        }))
        .filter((l) => l.href)
        // Deduplicate by href
        .filter(
          (l, i, arr) => arr.findIndex((x) => x.href === l.href) === i
        )
        .slice(0, maxLinks);

      // Extract images within the element
      const images = Array.from(element.querySelectorAll('img[src]'))
        .map((img) => ({
          alt: img.getAttribute('alt') || '',
          src: (img as HTMLImageElement).src,
        }))
        .filter((i) => i.src)
        // Deduplicate by src
        .filter(
          (i, idx, arr) => arr.findIndex((x) => x.src === i.src) === idx
        )
        .slice(0, maxImages);

      // Get text and normalize
      const rawText = element.textContent || '';
      const normalizedText = rawText
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\n{3,}/g, '\n\n');

      // Get HTML and sanitize
      let html = element.innerHTML;
      // Remove script tags
      html = html.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
      );
      // Remove event handlers
      html = html.replace(/\s+on\w+="[^"]*"/gi, '');
      // Remove iframes
      html = html.replace(
        /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
        ''
      );

      return {
        url: window.location.href,
        title: document.title,
        selector: sel,
        text: normalizedText.slice(0, maxText),
        html: html.slice(0, maxHtml),
        links,
        images,
      };
    },
    {
      sel: selector,
      maxText: MAX_TEXT_LENGTH,
      maxHtml: MAX_HTML_LENGTH,
      maxLinks: MAX_LINKS,
      maxImages: MAX_IMAGES,
    }
  );
}

/**
 * Execute arbitrary JavaScript on the page.
 *
 * Wraps the script in an async IIFE to support await.
 * Returns the result which must be JSON-serializable.
 *
 * @param page - Playwright page instance
 * @param script - JavaScript code to execute (function body)
 * @returns The result of the script execution
 */
export async function executeScript(
  page: Page,
  script: string
): Promise<unknown> {
  try {
    // Execute script wrapped in async IIFE
    const result = await page.evaluate((code) => {
      // Wrap in async IIFE to allow await
      const fn = new Function(
        `return (async () => { ${code} })()`
      ) as () => Promise<unknown>;
      return fn();
    }, script);

    // Check result size (approximate)
    const resultStr = JSON.stringify(result);
    if (resultStr.length > MAX_SCRIPT_RESULT_SIZE) {
      throw new Error(
        `Script result too large: ${resultStr.length} bytes (max ${MAX_SCRIPT_RESULT_SIZE})`
      );
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Script execution failed: ${error.message}`);
    }
    throw new Error(`Script execution failed: ${String(error)}`);
  }
}

/**
 * Navigate to a URL.
 *
 * @param page - Playwright page instance
 * @param url - URL to navigate to
 * @returns Navigation result
 */
export async function navigate(
  page: Page,
  url: string
): Promise<NavigateResult> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }

  try {
    // Navigate with timeout
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    return {
      success: true,
      url: page.url(),
      title: await page.title(),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Navigation failed: ${error.message}`);
    }
    throw new Error(`Navigation failed: ${String(error)}`);
  }
}

/**
 * Take a screenshot of the page.
 *
 * @param page - Playwright page instance
 * @param fullPage - Whether to capture the full scrollable page
 * @returns Screenshot as PNG buffer
 */
export async function takeScreenshot(
  page: Page,
  fullPage = false
): Promise<Buffer> {
  try {
    const screenshot = await page.screenshot({
      fullPage,
      type: 'png',
    });

    // Check size (5MB limit)
    const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;
    if (screenshot.length > MAX_SCREENSHOT_SIZE) {
      throw new Error(
        `Screenshot too large: ${screenshot.length} bytes (max ${MAX_SCREENSHOT_SIZE})`
      );
    }

    return screenshot;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Screenshot failed: ${error.message}`);
    }
    throw new Error(`Screenshot failed: ${String(error)}`);
  }
}

/**
 * Get basic page information.
 *
 * @param page - Playwright page instance
 * @returns Basic page info
 */
export async function getPageInfo(page: Page): Promise<{
  url: string;
  title: string;
}> {
  return {
    url: page.url(),
    title: await page.title(),
  };
}

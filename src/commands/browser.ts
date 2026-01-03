/**
 * Browser command handlers
 */

import * as browserModule from '../browser.js';
import type { GlobalOptions, ScreenshotOptions, NavigationResult, PageInfo, PagesList } from '../types.js';
import { writeFileSync } from 'node:fs';

/**
 * Navigate to a URL
 */
export async function navigate(
  url: string,
  options: GlobalOptions
): Promise<void> {
  const page = await browserModule.getPage();

  await page.goto(url, {
    timeout: options.timeout,
    waitUntil: 'domcontentloaded'
  });

  const result: NavigationResult = {
    success: true,
    url: page.url(),
    title: await page.title()
  };

  console.log(JSON.stringify(result, null, 2));
}

/**
 * Take a screenshot
 */
export async function screenshot(
  options: GlobalOptions & ScreenshotOptions
): Promise<void> {
  const page = await browserModule.getPage();

  const screenshotBuffer = await page.screenshot({
    fullPage: options.fullPage,
    type: 'png'
  });

  if (options.output) {
    // Save to file
    writeFileSync(options.output, screenshotBuffer);
    console.log(JSON.stringify({
      success: true,
      file: options.output,
      fullPage: options.fullPage
    }, null, 2));
  } else {
    // Output as base64 to stdout
    const base64Data = screenshotBuffer.toString('base64');
    console.log(JSON.stringify({
      data: base64Data,
      fullPage: options.fullPage
    }, null, 2));
  }
}

/**
 * Get current page info
 */
export async function info(
  _options: GlobalOptions
): Promise<void> {
  const pageInfo = await browserModule.getPageInfo();

  const result: PageInfo = {
    url: pageInfo.url,
    title: pageInfo.title
  };

  console.log(JSON.stringify(result, null, 2));
}

/**
 * List all controlled tabs
 */
export async function list(
  _options: GlobalOptions
): Promise<void> {
  const pages = await browserModule.listPages();

  // Find current page index by comparing with active page
  const currentPage = await browserModule.getPage();
  const currentUrl = currentPage.url();
  const currentIndex = pages.findIndex(p => p.url === currentUrl);

  const result: PagesList = {
    pages: pages,
    current: currentIndex !== -1 ? currentIndex : 0
  };

  console.log(JSON.stringify(result, null, 2));
}

/**
 * Switch to a different tab
 */
export async function switchTab(
  index: number,
  _options: GlobalOptions
): Promise<void> {
  const page = await browserModule.switchPage(index);

  const result: PageInfo = {
    url: page.url(),
    title: await page.title()
  };

  console.log(JSON.stringify(result, null, 2));
}

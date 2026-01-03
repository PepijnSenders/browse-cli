/**
 * Page command handlers
 */

import * as browserModule from '../browser.js';
import { scrapePage, executePageScript } from '../scrapers/generic.js';
import type { GlobalOptions, ScrapeOptions } from '../types.js';

/**
 * Scrape content from current page
 */
export async function scrape(
  options: GlobalOptions & ScrapeOptions
): Promise<void> {
  const page = await browserModule.getPage();

  // Use unified scrapePage function which handles both cases
  const content = await scrapePage(page, options.selector);

  // Output in requested format
  if (options.format === 'text') {
    console.log(`URL: ${content.url}`);
    console.log(`Title: ${content.title}`);
    console.log(`\n--- Content ---`);
    console.log(content.text);

    if (content.links.length > 0) {
      console.log(`\n--- Links (${content.links.length}) ---`);
      content.links.slice(0, 20).forEach((link, i) => {
        console.log(`${i + 1}. ${link.text || '(no text)'}`);
        console.log(`   ${link.href}`);
      });
      if (content.links.length > 20) {
        console.log(`   ... and ${content.links.length - 20} more`);
      }
    }

    if (content.images.length > 0) {
      console.log(`\n--- Images (${content.images.length}) ---`);
      content.images.slice(0, 10).forEach((img, i) => {
        console.log(`${i + 1}. ${img.alt || '(no alt text)'}`);
        console.log(`   ${img.src}`);
      });
      if (content.images.length > 10) {
        console.log(`   ... and ${content.images.length - 10} more`);
      }
    }
  } else {
    // JSON format
    console.log(JSON.stringify(content, null, 2));
  }
}

/**
 * Execute JavaScript on the page
 */
export async function script(
  code: string,
  options: GlobalOptions
): Promise<void> {
  const page = await browserModule.getPage();

  // Use the properly validated executePageScript function
  const result = await executePageScript(page, code);

  // Output in requested format
  if (options.format === 'text') {
    console.log(`Script: ${result.script}`);
    console.log(`Size: ${result.size} bytes`);
    console.log(`\n--- Result ---`);

    // Pretty print the result
    if (typeof result.result === 'object' && result.result !== null) {
      console.log(JSON.stringify(result.result, null, 2));
    } else {
      console.log(result.result);
    }
  } else {
    // JSON format
    console.log(JSON.stringify(result, null, 2));
  }
}

/**
 * Browser Tools
 *
 * Tools for browser navigation and page management.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getPage, getPages, switchPage } from '../browser.js';
import {
  navigate,
  getPageInfo,
  takeScreenshot,
} from '../scrapers/generic.js';

/**
 * Register browser tools with the MCP server
 */
export function registerBrowserTools(server: McpServer) {
  // Navigate to URL
  server.registerTool('navigate', {
    description: 'Navigate the active page to a URL',
    inputSchema: {
      url: z.string().describe('URL to navigate to'),
    },
  }, async (args) => {
    const page = await getPage();
    const result = await navigate(page, args.url);

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  });

  // Get page info
  server.registerTool('get_page_info', {
    description: 'Get information about the current page',
    inputSchema: {},
  }, async () => {
    const page = await getPage();
    const info = await getPageInfo(page);

    return {
      content: [{ type: 'text', text: JSON.stringify(info, null, 2) }],
    };
  });

  // List pages
  server.registerTool('list_pages', {
    description: 'List all pages (tabs) available for control',
    inputSchema: {},
  }, async () => {
    const pages = await getPages();

    const pageList = await Promise.all(
      pages.map(async (page, index) => ({
        index,
        url: page.url(),
        title: await page.title(),
      }))
    );

    return {
      content: [{ type: 'text', text: JSON.stringify({ pages: pageList }, null, 2) }],
    };
  });

  // Switch page
  server.registerTool('switch_page', {
    description: 'Switch to a different page (tab) by index',
    inputSchema: {
      index: z.number().describe('Page index from list_pages'),
    },
  }, async (args) => {
    const page = await switchPage(args.index);
    const info = await getPageInfo(page);

    return {
      content: [{ type: 'text', text: JSON.stringify({ success: true, ...info }, null, 2) }],
    };
  });

  // Take screenshot
  server.registerTool('take_screenshot', {
    description: 'Take a screenshot of the current page',
    inputSchema: {
      fullPage: z.boolean().optional().describe('Capture full page or just viewport (default: false)'),
    },
  }, async (args) => {
    const page = await getPage();
    const screenshot = await takeScreenshot(page, args.fullPage ?? false);

    return {
      content: [{
        type: 'image',
        data: screenshot.toString('base64'),
        mimeType: 'image/png',
      }],
    };
  });
}

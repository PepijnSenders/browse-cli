/**
 * Generic Scraping Tools
 *
 * Tools for general page scraping and script execution.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getPage } from '../browser.js';
import { scrapePage, executeScript } from '../scrapers/generic.js';

/**
 * Register generic scraping tools with the MCP server
 */
export function registerGenericTools(server: McpServer) {
  // Scrape page content
  server.registerTool('scrape_page', {
    description: 'Extract text content and links from the current page',
    inputSchema: {
      selector: z.string().optional().describe('CSS selector to scope extraction (optional)'),
    },
  }, async (args) => {
    const page = await getPage();
    const content = await scrapePage(page, args.selector);

    return {
      content: [{ type: 'text', text: JSON.stringify(content, null, 2) }],
    };
  });

  // Execute custom script
  server.registerTool('execute_script', {
    description: 'Execute custom JavaScript on the page',
    inputSchema: {
      script: z.string().describe('JavaScript code to execute (must return JSON-serializable value)'),
    },
  }, async (args) => {
    const page = await getPage();
    const result = await executeScript(page, args.script);

    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
    };
  });
}

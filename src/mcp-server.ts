/**
 * MCP Server implementation for session-scraper
 * Provides MCP tools that wrap the CLI scrapers for use in AI agents
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  navigateToProfile as navigateToTwitterProfile,
  extractProfile as extractTwitterProfile,
  collectTimelineTweets,
  navigateToTweet,
  extractPost as extractTwitterPost,
  extractSearchResults as extractTwitterSearchResults,
  navigateToList,
  extractListTimeline
} from './scrapers/twitter.js';
import {
  navigateToProfile as navigateToLinkedInProfile,
  extractProfile as extractLinkedInProfile,
  navigateToPostsPage,
  extractPosts as extractLinkedInPosts,
  navigateToSearch as navigateToLinkedInSearch,
  extractSearchResults as extractLinkedInSearchResults,
  humanDelay as linkedInHumanDelay
} from './scrapers/linkedin.js';
import {
  extractPageContent,
  executePageScript
} from './scrapers/generic.js';
import { getPage, connect } from './browser.js';
import {
  formatError as formatErrorUtil,
  checkTwitterErrors,
  checkLinkedInErrors,
  type StructuredError
} from './utils/errors.js';

// Server metadata
const SERVER_NAME = 'session-scraper';
const SERVER_VERSION = '0.1.0';

/**
 * Format error for MCP response
 */
function formatError(error: unknown): { content: Array<{ type: 'text'; text: string }>; isError: true } {
  const structured: StructuredError = formatErrorUtil(error);

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({
        error: structured.error,
        code: structured.code,
        hint: structured.hint
      }, null, 2)
    }],
    isError: true
  };
}

/**
 * Format successful result for MCP response
 */
function formatResult(data: unknown): { content: Array<{ type: 'text'; text: string }> } {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(data, null, 2)
    }]
  };
}

/**
 * Ensure browser connection and execute scraper function with proper cleanup
 *
 * @param fn - The function to execute with browser connection
 * @returns Result from the function
 * @throws Re-throws any errors after cleanup
 */
async function withBrowser<T>(fn: () => Promise<T>): Promise<T> {
  try {
    await connect();
    return await fn();
  } catch (error) {
    // Error will be handled by the tool handler
    // We don't disconnect here as the connection can be reused
    throw error;
  }
}

/**
 * Main server initialization and setup
 */
async function main() {
  // Create MCP server
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION
  }, {
    capabilities: {
      tools: {}
    }
  });

  // ========================================
  // TWITTER TOOLS
  // ========================================

  server.registerTool('scrape_twitter_profile', {
    description: 'Get Twitter user profile information including bio, follower counts, and verification status',
    inputSchema: {
      username: z.string().describe('Twitter username (without @)')
    }
  }, async ({ username }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // Navigate to profile
        await navigateToTwitterProfile(page, username, 30000);
        await page.waitForTimeout(1000);

        // Check for errors
        const content = await page.content();
        const error = checkTwitterErrors(content);
        if (error) {
          throw new Error(`Profile error: ${error}`);
        }

        // Extract profile
        return await extractTwitterProfile(page);
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('scrape_twitter_timeline', {
    description: 'Get tweets from a user\'s timeline or home feed with pagination',
    inputSchema: {
      username: z.string().optional().describe('Username to scrape (omit for home timeline)'),
      count: z.number().min(1).max(100).default(20).describe('Number of tweets to fetch (default: 20, max: 100)')
    }
  }, async ({ username, count = 20 }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // Navigate to timeline
        const url = username ? `https://x.com/${username}` : 'https://x.com/home';
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Check for errors
        const content = await page.content();
        const error = checkTwitterErrors(content);
        if (error) {
          throw new Error(`Timeline error: ${error}`);
        }

        // Collect tweets
        const timeline = await collectTimelineTweets(page, count);

        return {
          tweets: timeline.tweets,
          count: timeline.tweets.length,
          hasMore: timeline.hasMore
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('scrape_twitter_post', {
    description: 'Get a single tweet with thread context and replies',
    inputSchema: {
      url: z.string().url().describe('Full tweet URL (e.g., https://x.com/user/status/123)')
    }
  }, async ({ url }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // Navigate to tweet
        await navigateToTweet(page, url, 30000);
        await page.waitForTimeout(2000);

        // Check for errors
        const content = await page.content();
        const error = checkTwitterErrors(content);
        if (error) {
          throw new Error(`Tweet error: ${error}`);
        }

        // Extract post
        return await extractTwitterPost(page);
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('scrape_twitter_search', {
    description: 'Search Twitter for tweets matching a query. Supports Twitter search operators like from:, to:, filter:media, since:, until:, min_retweets:',
    inputSchema: {
      query: z.string().describe('Search query (supports Twitter operators)'),
      count: z.number().min(1).max(100).default(20).describe('Number of results (default: 20, max: 100)')
    }
  }, async ({ query, count = 20 }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // Navigate to search
        const encodedQuery = encodeURIComponent(query);
        const url = `https://x.com/search?q=${encodedQuery}&f=live`;
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(2000);

        // Check for errors
        const content = await page.content();
        const error = checkTwitterErrors(content);
        if (error) {
          throw new Error(`Search error: ${error}`);
        }

        // Extract search results
        const searchResults = await extractTwitterSearchResults(page, query, count);

        return {
          query,
          tweets: searchResults.tweets,
          count: searchResults.tweets.length,
          hasMore: searchResults.hasMore
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('scrape_twitter_list', {
    description: 'Get Twitter List information and tweets from list members. Lists are curated collections of Twitter accounts.',
    inputSchema: {
      listId: z.string().describe('Twitter List ID (from URL: x.com/i/lists/{id})'),
      count: z.number().optional().describe('Number of tweets to fetch (default: 20, max: 100)')
    }
  }, async ({ listId, count = 20 }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // Navigate to list
        await navigateToList(page, listId);
        await page.waitForTimeout(2000);

        // Check for errors
        const content = await page.content();
        const error = checkTwitterErrors(content);

        if (error) {
          switch (error) {
            case 'not_found':
              throw new Error(`Twitter List ${listId} not found`);
            case 'private_account':
              throw new Error('This list is private');
            case 'login_required':
              throw new Error('Login to Twitter required to view this list');
            case 'rate_limited':
              throw new Error('Rate limited by Twitter. Please wait before trying again.');
            default:
              throw new Error(`Twitter error: ${error}`);
          }
        }

        // Extract list timeline
        const timeline = await extractListTimeline(page, count);

        return {
          list: timeline.list,
          tweets: timeline.tweets,
          count: timeline.tweets.length,
          hasMore: timeline.hasMore
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  // ========================================
  // LINKEDIN TOOLS
  // ========================================

  server.registerTool('scrape_linkedin_profile', {
    description: 'Get LinkedIn profile information including experience, education, and skills',
    inputSchema: {
      url: z.string().url().describe('Full LinkedIn profile URL')
    }
  }, async ({ url }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // Navigate to profile
        await navigateToLinkedInProfile(page, url, 30000);
        await linkedInHumanDelay(2000, 3000);

        // Check for errors
        const content = await page.content();
        const error = checkLinkedInErrors(content);
        if (error) {
          throw new Error(`Profile error: ${error}`);
        }

        // Extract profile
        return await extractLinkedInProfile(page);
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('scrape_linkedin_posts', {
    description: 'Get posts from a LinkedIn user\'s activity feed',
    inputSchema: {
      url: z.string().url().describe('LinkedIn profile URL'),
      count: z.number().min(1).max(50).default(10).describe('Number of posts (default: 10, max: 50)')
    }
  }, async ({ url, count = 10 }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // Navigate to posts page
        await navigateToPostsPage(page, url, 30000);
        await linkedInHumanDelay(2000, 3000);

        // Check for errors
        const content = await page.content();
        const error = checkLinkedInErrors(content);
        if (error) {
          throw new Error(`Posts error: ${error}`);
        }

        // Extract posts
        const posts = await extractLinkedInPosts(page, count);

        return {
          url,
          posts,
          count: posts.length
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('scrape_linkedin_search', {
    description: 'Search LinkedIn for people, companies, or posts',
    inputSchema: {
      query: z.string().describe('Search query'),
      type: z.enum(['people', 'companies', 'posts']).default('people').describe('Search type (default: people)'),
      count: z.number().min(1).max(50).default(10).describe('Number of results (default: 10, max: 50)')
    }
  }, async ({ query, type = 'people', count = 10 }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // Navigate to search
        await navigateToLinkedInSearch(page, query, type, 30000);
        await linkedInHumanDelay(2000, 3000);

        // Check for errors
        const content = await page.content();
        const error = checkLinkedInErrors(content);
        if (error) {
          throw new Error(`Search error: ${error}`);
        }

        // Extract search results
        const searchResults = await extractLinkedInSearchResults(page, type, count);

        // Extract results based on type
        const results = searchResults.type === 'people'
          ? searchResults.results
          : searchResults.type === 'companies'
          ? searchResults.results
          : searchResults.results;

        return {
          query,
          type,
          results,
          count: results.length
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  // ========================================
  // BROWSER TOOLS
  // ========================================

  server.registerTool('navigate', {
    description: 'Navigate the active browser tab to a URL',
    inputSchema: {
      url: z.string().url().describe('URL to navigate to')
    }
  }, async ({ url }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });
        return {
          success: true,
          url: page.url(),
          title: await page.title()
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('take_screenshot', {
    description: 'Capture a screenshot of the current page',
    inputSchema: {
      fullPage: z.boolean().default(false).describe('Capture full page (default: false)')
    }
  }, async ({ fullPage = false }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();
        const screenshot = await page.screenshot({
          fullPage,
          type: 'png'
        });
        return {
          success: true,
          screenshot: screenshot.toString('base64'),
          fullPage
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('get_page_info', {
    description: 'Get information about the current page (URL and title)',
    inputSchema: {}
  }, async () => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();
        return {
          url: page.url(),
          title: await page.title()
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('list_pages', {
    description: 'List all controlled browser tabs',
    inputSchema: {}
  }, async () => {
    try {
      const result = await withBrowser(async () => {
        const browser = await connect();
        const contexts = browser.contexts();

        if (contexts.length === 0) {
          throw new Error('No pages available');
        }

        const pages = contexts[0].pages();
        return {
          pages: await Promise.all(pages.map(async (page, index) => ({
            index,
            url: page.url(),
            title: await page.title()
          }))),
          current: 0
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('switch_page', {
    description: 'Switch to a different browser tab by index',
    inputSchema: {
      index: z.number().min(0).describe('Page index from list_pages')
    }
  }, async ({ index }) => {
    try {
      const result = await withBrowser(async () => {
        const browser = await connect();
        const contexts = browser.contexts();

        if (contexts.length === 0) {
          throw new Error('No pages available');
        }

        const pages = contexts[0].pages();
        if (index < 0 || index >= pages.length) {
          throw new Error(`Invalid page index: ${index}. Available: 0-${pages.length - 1}`);
        }

        const page = pages[index];
        await page.bringToFront();

        return {
          success: true,
          index,
          url: page.url(),
          title: await page.title()
        };
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  // ========================================
  // PAGE TOOLS
  // ========================================

  server.registerTool('scrape_page', {
    description: 'Extract text content, links, and images from the current page',
    inputSchema: {
      selector: z.string().optional().describe('CSS selector to scope extraction (optional)')
    }
  }, async ({ selector }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();

        // If selector is provided, scope the extraction to that element
        if (selector) {
          const url = page.url();
          const title = await page.title();

          const extracted = await page.evaluate((sel) => {
            const element = document.querySelector(sel);
            if (!element) {
              throw new Error(`Element not found: ${sel}`);
            }

            // Extract text (max 100,000 chars)
            const text = (element.textContent || '').trim().slice(0, 100000);

            // Extract links (max 100)
            const linkElements = element.querySelectorAll('a[href]');
            const links: Array<{ text: string; href: string }> = [];
            for (let i = 0; i < Math.min(linkElements.length, 100); i++) {
              const anchor = linkElements[i] as HTMLAnchorElement;
              links.push({
                text: (anchor.textContent || '').trim(),
                href: anchor.href
              });
            }

            // Extract images (max 50)
            const imgElements = element.querySelectorAll('img[src]');
            const images: Array<{ alt: string; src: string }> = [];
            for (let i = 0; i < Math.min(imgElements.length, 50); i++) {
              const img = imgElements[i] as HTMLImageElement;
              images.push({
                alt: img.alt || '',
                src: img.src
              });
            }

            return { text, links, images };
          }, selector);

          return {
            url,
            title,
            text: extracted.text,
            links: extracted.links,
            images: extracted.images
          };
        } else {
          // Use the generic extractor for full page
          return await extractPageContent(page);
        }
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  server.registerTool('execute_script', {
    description: 'Run custom JavaScript code on the current page and return the result',
    inputSchema: {
      script: z.string().describe('JavaScript code to execute (can use return statement)')
    }
  }, async ({ script }) => {
    try {
      const result = await withBrowser(async () => {
        const page = await getPage();
        return await executePageScript(page, script);
      });
      return formatResult(result);
    } catch (error) {
      return formatError(error);
    }
  });

  // ========================================
  // START SERVER
  // ========================================

  // Create stdio transport and connect
  const transport = new StdioServerTransport();

  // Error handling
  transport.onerror = (error: Error) => {
    console.error('Transport error:', error);
  };

  transport.onclose = () => {
    console.error('Transport closed');
  };

  // Connect and start
  await server.connect(transport);

  // Handle shutdown gracefully
  process.on('SIGINT', async () => {
    await transport.close();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await transport.close();
    process.exit(0);
  });
}

// Start the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

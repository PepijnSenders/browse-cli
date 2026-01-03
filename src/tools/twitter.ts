/**
 * Twitter/X Scraping Tools
 *
 * Tools for scraping Twitter profiles, timelines, posts, and search.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getPage } from '../browser.js';
import { debugLog, waitForRateLimit } from '../errors.js';
import {
  scrapeTwitterProfile,
  scrapeTwitterTimeline,
  scrapeTwitterPost,
  scrapeTwitterSearch,
} from '../scrapers/twitter.js';

/**
 * Register Twitter tools with the MCP server
 */
export function registerTwitterTools(server: McpServer) {
  // Scrape Twitter profile
  server.registerTool('scrape_twitter_profile', {
    description: "Scrape a Twitter user's profile information",
    inputSchema: {
      username: z.string().describe('Twitter username (without @)'),
    },
  }, async (args) => {
    debugLog('scrape_twitter_profile', args.username);
    await waitForRateLimit('twitter');
    const page = await getPage();
    const profile = await scrapeTwitterProfile(page, args.username);

    return {
      content: [{ type: 'text', text: JSON.stringify(profile, null, 2) }],
    };
  });

  // Scrape Twitter timeline
  server.registerTool('scrape_twitter_timeline', {
    description: "Scrape tweets from a user's timeline or home feed",
    inputSchema: {
      username: z.string().optional().describe('Username to scrape (omit for home timeline)'),
      count: z.number().optional().describe('Number of tweets to fetch (default: 20, max: 100)'),
    },
  }, async (args) => {
    debugLog('scrape_twitter_timeline', args.username, args.count);
    await waitForRateLimit('twitter');
    const page = await getPage();
    const tweets = await scrapeTwitterTimeline(page, args.username, args.count);

    return {
      content: [{ type: 'text', text: JSON.stringify({ tweets, count: tweets.length }, null, 2) }],
    };
  });

  // Scrape single tweet/post
  server.registerTool('scrape_twitter_post', {
    description: 'Scrape a single tweet and its thread context',
    inputSchema: {
      url: z.string().describe('Full URL of the tweet (e.g., https://x.com/user/status/123)'),
    },
  }, async (args) => {
    debugLog('scrape_twitter_post', args.url);
    await waitForRateLimit('twitter');
    const page = await getPage();
    const tweet = await scrapeTwitterPost(page, args.url);

    return {
      content: [{ type: 'text', text: JSON.stringify(tweet, null, 2) }],
    };
  });

  // Search Twitter
  server.registerTool('scrape_twitter_search', {
    description: 'Search Twitter for tweets matching a query',
    inputSchema: {
      query: z.string().describe('Search query (supports Twitter search operators)'),
      count: z.number().optional().describe('Number of results (default: 20, max: 100)'),
    },
  }, async (args) => {
    debugLog('scrape_twitter_search', args.query, args.count);
    await waitForRateLimit('twitter');
    const page = await getPage();
    const results = await scrapeTwitterSearch(page, args.query, args.count);

    return {
      content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
    };
  });
}

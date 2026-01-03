/**
 * Twitter/X Scraper
 *
 * Extracts data from x.com using Playwright browser automation.
 * Requires user to be logged into Twitter in their browser.
 */

import type { Page } from 'playwright-core';

// ============================================================================
// Type Definitions
// ============================================================================

export interface TwitterProfile {
  username: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  joinDate: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  verified: boolean;
  profileImageUrl: string | null;
  bannerImageUrl: string | null;
}

export interface TwitterAuthor {
  username: string;
  displayName: string;
  profileImageUrl: string | null;
  verified: boolean;
}

export interface TwitterMetrics {
  replies: number;
  retweets: number;
  likes: number;
  views: number;
}

export interface TwitterMedia {
  type: 'image' | 'video' | 'gif';
  url: string;
  thumbnailUrl?: string;
}

export interface TwitterTweet {
  id: string;
  url: string;
  text: string;
  author: TwitterAuthor;
  createdAt: string;
  metrics: TwitterMetrics;
  media: TwitterMedia[];
  type: 'tweet' | 'retweet' | 'reply';
  quotedTweet: TwitterTweet | null;
  inReplyTo: string | null;
}

export interface TwitterTweetWithContext extends TwitterTweet {
  thread: TwitterTweet[];
  replies: TwitterTweet[];
}

export interface TwitterSearchResults {
  tweets: TwitterTweet[];
  hasMore: boolean;
}

// ============================================================================
// Scraper Functions
// ============================================================================

/**
 * Scrape a Twitter profile by username
 *
 * @param page - Playwright page instance
 * @param username - Twitter username (without @)
 * @returns Profile object with user information
 *
 * @example
 * const profile = await scrapeTwitterProfile(page, 'elonmusk');
 * console.log(profile.displayName); // "Elon Musk"
 * console.log(profile.followersCount); // 170500000
 */
export async function scrapeTwitterProfile(
  _page: Page,
  _username: string
): Promise<TwitterProfile> {
  throw new Error('Twitter scraper not implemented yet');
}

/**
 * Scrape tweets from a timeline (user timeline or home timeline)
 *
 * @param page - Playwright page instance
 * @param username - Twitter username (without @). If omitted, scrapes home timeline
 * @param count - Maximum number of tweets to retrieve (default: 20)
 * @returns Array of tweets
 *
 * @example
 * // Scrape user timeline
 * const tweets = await scrapeTwitterTimeline(page, 'elonmusk', 10);
 *
 * // Scrape home timeline
 * const homeTweets = await scrapeTwitterTimeline(page, undefined, 20);
 */
export async function scrapeTwitterTimeline(
  _page: Page,
  _username?: string,
  _count: number = 20
): Promise<TwitterTweet[]> {
  throw new Error('Twitter scraper not implemented yet');
}

/**
 * Scrape a specific tweet by URL, including thread context and replies
 *
 * @param page - Playwright page instance
 * @param url - Full URL to the tweet
 * @returns Tweet with thread context and top replies
 *
 * @example
 * const tweet = await scrapeTwitterPost(page, 'https://x.com/elonmusk/status/1747654321098765432');
 * console.log(tweet.text);
 * console.log(tweet.thread.length); // Parent tweets in thread
 * console.log(tweet.replies.length); // Top replies
 */
export async function scrapeTwitterPost(
  _page: Page,
  _url: string
): Promise<TwitterTweetWithContext> {
  throw new Error('Twitter scraper not implemented yet');
}

/**
 * Search Twitter for tweets matching a query
 *
 * @param page - Playwright page instance
 * @param query - Search query (supports Twitter search operators)
 * @param count - Maximum number of results to retrieve (default: 20)
 * @returns Search results with tweets
 *
 * @example
 * // Basic search
 * const results = await scrapeTwitterSearch(page, 'AI', 10);
 *
 * // Advanced search with operators
 * const filtered = await scrapeTwitterSearch(page, 'AI -crypto from:elonmusk', 5);
 */
export async function scrapeTwitterSearch(
  _page: Page,
  _query: string,
  _count: number = 20
): Promise<TwitterSearchResults> {
  throw new Error('Twitter scraper not implemented yet');
}

// ============================================================================
// Utility Functions (for future implementation)
// ============================================================================

/**
 * Parse Twitter's compact number format (1.2K, 5.3M, etc.)
 */
export function parseTwitterNumber(text: string): number {
  if (!text || text.trim() === '') return 0;
  const cleaned = text.replace(/,/g, '').trim();
  if (cleaned.endsWith('K')) {
    return Math.round(parseFloat(cleaned) * 1000);
  }
  if (cleaned.endsWith('M')) {
    return Math.round(parseFloat(cleaned) * 1000000);
  }
  return parseInt(cleaned, 10) || 0;
}

/**
 * Parse Twitter date from time element
 */
export function parseTwitterDate(timeElement: Element): string {
  const datetime = timeElement.getAttribute('datetime');
  if (datetime) return datetime;

  // Fall back to parsing text (relative times)
  // TODO: Implement relative time parsing
  return new Date().toISOString();
}

/**
 * Detect tweet type from article element
 */
export function detectTweetType(article: Element): 'tweet' | 'retweet' | 'reply' {
  // Check for retweet indicator
  const socialContext = article.querySelector('[data-testid="socialContext"]');
  if (socialContext?.textContent?.includes('reposted')) {
    return 'retweet';
  }

  // Check if replying to someone
  const replyContext = article.querySelector('[data-testid="tweet"] > div:first-child');
  if (replyContext?.textContent?.includes('Replying to')) {
    return 'reply';
  }

  return 'tweet';
}

/**
 * Load more tweets by scrolling
 */
export async function loadMoreTweets(page: Page): Promise<boolean> {
  const previousHeight = await page.evaluate(() => document.body.scrollHeight);

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Wait for content to load
  await page.waitForTimeout(1500);

  const newHeight = await page.evaluate(() => document.body.scrollHeight);

  // If height didn't change, no more content
  return newHeight > previousHeight;
}

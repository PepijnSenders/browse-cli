/**
 * Reddit Scraper
 *
 * Extracts data from reddit.com using Playwright browser automation.
 * Works with both old.reddit.com and new reddit.
 */

import type { Page } from 'playwright-core';

// ============================================================================
// Type Definitions
// ============================================================================

export interface RedditUser {
  username: string;
  karma: number;
  postKarma: number;
  commentKarma: number;
  cakeDay: string | null;
  about: string | null;
  avatarUrl: string | null;
}

export interface RedditPost {
  id: string;
  title: string;
  url: string;
  author: string;
  subreddit: string;
  score: number;
  upvoteRatio: number | null;
  commentsCount: number;
  createdAt: string | null;
  content: string | null;
  contentType: 'text' | 'link' | 'image' | 'video';
  thumbnailUrl: string | null;
  isNsfw: boolean;
  isPinned: boolean;
}

export interface RedditComment {
  id: string;
  author: string;
  content: string;
  score: number;
  createdAt: string | null;
  depth: number;
  replies: RedditComment[];
}

export interface RedditSubreddit {
  name: string;
  title: string;
  description: string | null;
  subscribers: number;
  activeUsers: number | null;
  createdAt: string | null;
  isNsfw: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const REDDIT_BASE_URL = 'https://www.reddit.com';
const DEFAULT_TIMEOUT = 30000;
const SCROLL_DELAY = 1500;
const MAX_SCROLL_ATTEMPTS = 10;

// ============================================================================
// Utility Functions
// ============================================================================

function parseRedditNumber(text: string): number {
  if (!text || text.trim() === '') return 0;
  const cleaned = text.replace(/,/g, '').trim().toLowerCase();
  if (cleaned.endsWith('k')) {
    return Math.round(parseFloat(cleaned) * 1000);
  }
  if (cleaned.endsWith('m')) {
    return Math.round(parseFloat(cleaned) * 1000000);
  }
  return parseInt(cleaned, 10) || 0;
}

async function humanDelay(min = 500, max = 1500): Promise<void> {
  const delay = min + Math.random() * (max - min);
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function loadMoreContent(page: Page): Promise<boolean> {
  const previousHeight = await page.evaluate(() => document.body.scrollHeight);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(SCROLL_DELAY);
  const newHeight = await page.evaluate(() => document.body.scrollHeight);
  return newHeight > previousHeight;
}

// ============================================================================
// User Scraper
// ============================================================================

/**
 * Scrape a Reddit user profile
 */
export async function scrapeRedditUser(
  page: Page,
  username: string
): Promise<RedditUser> {
  const userUrl = `${REDDIT_BASE_URL}/user/${username}/`;
  await page.goto(userUrl, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });

  await humanDelay();

  // Check for error states
  const pageContent = await page.content();
  if (pageContent.includes("Sorry, nobody on Reddit goes by that name") ||
      pageContent.includes("page not found")) {
    throw new Error(`User not found: u/${username}`);
  }

  const user = await page.evaluate((uname) => {
    const parseNumber = (text: string): number => {
      if (!text) return 0;
      const cleaned = text.replace(/,/g, '').trim().toLowerCase();
      if (cleaned.endsWith('k')) return Math.round(parseFloat(cleaned) * 1000);
      if (cleaned.endsWith('m')) return Math.round(parseFloat(cleaned) * 1000000);
      return parseInt(cleaned, 10) || 0;
    };

    // Try new Reddit first
    const karmaEl = document.querySelector('[id*="karma"] span, [class*="karma"]');
    const karma = parseNumber(karmaEl?.textContent || '0');

    // Cake day
    const cakeDayEl = document.querySelector('[id*="cake"], time');
    const cakeDay = cakeDayEl?.getAttribute('datetime') || cakeDayEl?.textContent || null;

    // About/bio
    const aboutEl = document.querySelector('[class*="about"], [class*="bio"]');
    const about = aboutEl?.textContent?.trim() || null;

    // Avatar
    const avatarEl = document.querySelector('img[alt*="avatar"], img[src*="avatar"]');
    const avatarUrl = avatarEl?.getAttribute('src') || null;

    return {
      username: uname,
      karma,
      postKarma: 0,
      commentKarma: 0,
      cakeDay,
      about,
      avatarUrl,
    };
  }, username);

  return user;
}

// ============================================================================
// Subreddit Scraper
// ============================================================================

/**
 * Scrape posts from a subreddit
 */
export async function scrapeRedditSubreddit(
  page: Page,
  subreddit: string,
  count: number = 25,
  sort: 'hot' | 'new' | 'top' = 'hot'
): Promise<RedditPost[]> {
  const maxCount = Math.min(count, 100);
  const subredditUrl = `${REDDIT_BASE_URL}/r/${subreddit}/${sort}/`;

  await page.goto(subredditUrl, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });

  // Check for private/banned subreddit
  const pageContent = await page.content();
  if (pageContent.includes("This community has been banned") ||
      pageContent.includes("This community is private")) {
    throw new Error(`Subreddit not accessible: r/${subreddit}`);
  }

  await humanDelay();

  const posts: RedditPost[] = [];
  const seenIds = new Set<string>();
  let scrollAttempts = 0;

  while (posts.length < maxCount && scrollAttempts < MAX_SCROLL_ATTEMPTS) {
    const newPosts = await page.evaluate((sub) => {
      const parseNumber = (text: string): number => {
        if (!text) return 0;
        const cleaned = text.replace(/,/g, '').trim().toLowerCase();
        if (cleaned.endsWith('k')) return Math.round(parseFloat(cleaned) * 1000);
        if (cleaned.endsWith('m')) return Math.round(parseFloat(cleaned) * 1000000);
        return parseInt(cleaned, 10) || 0;
      };

      // Find post containers (works with new Reddit)
      const postElements = document.querySelectorAll('article, [data-testid="post-container"], shreddit-post');
      const results: RedditPost[] = [];

      postElements.forEach((post) => {
        try {
          // Get post link and ID
          const linkEl = post.querySelector('a[href*="/comments/"]') ||
                        post.querySelector('[data-click-id="body"]');
          const href = linkEl?.getAttribute('href') || '';
          const idMatch = href.match(/\/comments\/([a-z0-9]+)/i);
          if (!idMatch) return;

          const id = idMatch[1];
          const url = href.startsWith('http') ? href : `https://www.reddit.com${href}`;

          // Title
          const titleEl = post.querySelector('h3, [slot="title"], a[data-click-id="body"]');
          const title = titleEl?.textContent?.trim() || '';

          // Author
          const authorEl = post.querySelector('a[href*="/user/"]');
          const authorMatch = authorEl?.getAttribute('href')?.match(/\/user\/([^/]+)/);
          const author = authorMatch ? authorMatch[1] : '[deleted]';

          // Score
          const scoreEl = post.querySelector('[id*="vote-arrows"] span, [class*="score"], faceplate-number');
          const score = parseNumber(scoreEl?.textContent || '0');

          // Comments count
          const commentsEl = post.querySelector('a[href*="/comments/"] span, [data-click-id="comments"]');
          const commentsText = commentsEl?.textContent || '0';
          const commentsCount = parseNumber(commentsText.replace(/comments?/i, ''));

          // Time
          const timeEl = post.querySelector('time, [data-click-id="timestamp"]');
          const createdAt = timeEl?.getAttribute('datetime') || timeEl?.textContent || null;

          // Content type
          const hasImage = !!post.querySelector('img[src*="i.redd.it"], img[src*="preview.redd.it"]');
          const hasVideo = !!post.querySelector('video, [data-click-id="media"]');
          const hasExternalLink = !!post.querySelector('a[data-click-id="outbound"]');
          let contentType: 'text' | 'link' | 'image' | 'video' = 'text';
          if (hasVideo) contentType = 'video';
          else if (hasImage) contentType = 'image';
          else if (hasExternalLink) contentType = 'link';

          // Thumbnail
          const thumbEl = post.querySelector('img[src*="thumb"], img[alt="Post image"]');
          const thumbnailUrl = thumbEl?.getAttribute('src') || null;

          // NSFW
          const isNsfw = !!post.querySelector('[class*="nsfw"], [aria-label*="NSFW"]');

          // Pinned
          const isPinned = !!post.querySelector('[class*="pinned"], [class*="stickied"]');

          results.push({
            id,
            title,
            url,
            author,
            subreddit: sub,
            score,
            upvoteRatio: null,
            commentsCount,
            createdAt,
            content: null,
            contentType,
            thumbnailUrl,
            isNsfw,
            isPinned,
          });
        } catch {
          // Skip malformed posts
        }
      });

      return results;
    }, subreddit);

    for (const post of newPosts) {
      if (!seenIds.has(post.id) && posts.length < maxCount) {
        seenIds.add(post.id);
        posts.push(post);
      }
    }

    if (posts.length >= maxCount) break;

    const hasMore = await loadMoreContent(page);
    if (!hasMore) {
      scrollAttempts++;
    } else {
      scrollAttempts = 0;
    }

    await humanDelay(800, 1200);
  }

  return posts.slice(0, maxCount);
}

// ============================================================================
// Post Scraper
// ============================================================================

/**
 * Scrape a single Reddit post with comments
 */
export async function scrapeRedditPost(
  page: Page,
  url: string,
  maxComments: number = 20
): Promise<{ post: RedditPost; comments: RedditComment[] }> {
  // Validate URL
  if (!url.includes('/comments/')) {
    throw new Error('Invalid Reddit post URL. Expected format: https://reddit.com/r/subreddit/comments/id/title');
  }

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });
  await humanDelay();

  const result = await page.evaluate((maxCmts) => {
    const parseNumber = (text: string): number => {
      if (!text) return 0;
      const cleaned = text.replace(/,/g, '').trim().toLowerCase();
      if (cleaned.endsWith('k')) return Math.round(parseFloat(cleaned) * 1000);
      if (cleaned.endsWith('m')) return Math.round(parseFloat(cleaned) * 1000000);
      return parseInt(cleaned, 10) || 0;
    };

    // Extract post info
    const titleEl = document.querySelector('h1, [slot="title"]');
    const title = titleEl?.textContent?.trim() || '';

    const urlMatch = window.location.href.match(/\/comments\/([a-z0-9]+)/i);
    const id = urlMatch ? urlMatch[1] : '';

    const subredditMatch = window.location.href.match(/\/r\/([^/]+)/);
    const subreddit = subredditMatch ? subredditMatch[1] : '';

    const authorEl = document.querySelector('[data-testid="post-header"] a[href*="/user/"], a[class*="author"]');
    const authorMatch = authorEl?.getAttribute('href')?.match(/\/user\/([^/]+)/);
    const author = authorMatch ? authorMatch[1] : '[deleted]';

    const scoreEl = document.querySelector('[id*="vote"] span, [class*="score"], shreddit-post faceplate-number');
    const score = parseNumber(scoreEl?.textContent || '0');

    const contentEl = document.querySelector('[data-testid="post-content"], [slot="text-body"]');
    const content = contentEl?.textContent?.trim() || null;

    // Comments
    const commentElements = document.querySelectorAll('[data-testid="comment"], shreddit-comment');
    const comments: RedditComment[] = [];

    commentElements.forEach((comment, index) => {
      if (index >= maxCmts) return;

      const commentAuthorEl = comment.querySelector('a[href*="/user/"]');
      const commentAuthor = commentAuthorEl?.textContent?.trim()?.replace('u/', '') || '[deleted]';

      const commentContentEl = comment.querySelector('[data-testid="comment"] p, [slot="comment"]');
      const commentContent = commentContentEl?.textContent?.trim() || '';

      const commentScoreEl = comment.querySelector('[class*="score"], faceplate-number');
      const commentScore = parseNumber(commentScoreEl?.textContent || '0');

      const commentTimeEl = comment.querySelector('time');
      const commentCreatedAt = commentTimeEl?.getAttribute('datetime') || null;

      const idMatch = comment.getAttribute('id')?.match(/comment-([a-z0-9]+)/i) ||
                     comment.getAttribute('thingid')?.match(/t1_([a-z0-9]+)/i);

      comments.push({
        id: idMatch ? idMatch[1] : `comment-${index}`,
        author: commentAuthor,
        content: commentContent,
        score: commentScore,
        createdAt: commentCreatedAt,
        depth: 0,
        replies: [],
      });
    });

    return {
      post: {
        id,
        title,
        url: window.location.href,
        author,
        subreddit,
        score,
        upvoteRatio: null,
        commentsCount: comments.length,
        createdAt: null,
        content,
        contentType: 'text' as const,
        thumbnailUrl: null,
        isNsfw: false,
        isPinned: false,
      },
      comments,
    };
  }, maxComments);

  return result;
}

// ============================================================================
// Exports
// ============================================================================

export { parseRedditNumber };

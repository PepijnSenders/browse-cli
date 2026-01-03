/**
 * Instagram Scraper
 *
 * Extracts data from instagram.com using Playwright browser automation.
 * Requires user to be logged into Instagram in their browser.
 */

import type { Page } from 'playwright-core';

// ============================================================================
// Type Definitions
// ============================================================================

export interface InstagramProfile {
  username: string;
  displayName: string;
  bio: string | null;
  website: string | null;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  verified: boolean;
  profileImageUrl: string | null;
  isPrivate: boolean;
}

export interface InstagramPost {
  id: string;
  url: string;
  type: 'image' | 'video' | 'carousel';
  caption: string | null;
  likesCount: number;
  commentsCount: number;
  timestamp: string | null;
  thumbnailUrl: string | null;
}

export interface InstagramStory {
  id: string;
  type: 'image' | 'video';
  url: string;
  timestamp: string | null;
}

// ============================================================================
// Constants
// ============================================================================

const INSTAGRAM_BASE_URL = 'https://www.instagram.com';
const DEFAULT_TIMEOUT = 30000;
const SCROLL_DELAY = 1500;
const MAX_SCROLL_ATTEMPTS = 10;

// ============================================================================
// Utility Functions
// ============================================================================

function parseInstagramNumber(text: string): number {
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
// Profile Scraper
// ============================================================================

/**
 * Scrape an Instagram profile by username
 */
export async function scrapeInstagramProfile(
  page: Page,
  username: string
): Promise<InstagramProfile> {
  const profileUrl = `${INSTAGRAM_BASE_URL}/${username}/`;
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });

  // Wait for profile to load
  try {
    await page.waitForSelector('header section', { timeout: DEFAULT_TIMEOUT });
  } catch {
    const pageContent = await page.content();
    if (pageContent.includes("Sorry, this page isn't available")) {
      throw new Error(`Profile not found: @${username}`);
    }
    if (pageContent.includes('Log in') || pageContent.includes('Sign up')) {
      throw new Error('Not logged in. Please log into Instagram in your browser.');
    }
    throw new Error('Failed to load profile');
  }

  await humanDelay();

  const profile = await page.evaluate((uname) => {
    const parseNumber = (text: string): number => {
      if (!text || text.trim() === '') return 0;
      const cleaned = text.replace(/,/g, '').trim();
      if (cleaned.endsWith('K')) return Math.round(parseFloat(cleaned) * 1000);
      if (cleaned.endsWith('M')) return Math.round(parseFloat(cleaned) * 1000000);
      return parseInt(cleaned, 10) || 0;
    };

    // Profile header section
    const header = document.querySelector('header section');
    if (!header) throw new Error('Profile header not found');

    // Username and display name
    const displayNameEl = header.querySelector('span[class*="x1lliihq"]') ||
                          header.querySelector('h2') ||
                          header.querySelector('span');
    const displayName = displayNameEl?.textContent?.trim() || uname;

    // Bio
    const bioEl = document.querySelector('header section span[class*="x1lliihq"]:not(:first-child)') ||
                  document.querySelector('header section div[class*="-vDXg"]');
    const bio = bioEl?.textContent?.trim() || null;

    // Website
    const websiteEl = document.querySelector('header section a[href*="l.instagram.com"]');
    const website = websiteEl?.textContent?.trim() || null;

    // Stats (followers, following, posts)
    const statsSection = document.querySelector('header section ul');
    const statItems = statsSection?.querySelectorAll('li') || [];

    let postsCount = 0;
    let followersCount = 0;
    let followingCount = 0;

    statItems.forEach((item, index) => {
      const text = item.textContent || '';
      const numMatch = text.match(/([\d,.]+[KM]?)/);
      const num = numMatch ? parseNumber(numMatch[1]) : 0;

      if (index === 0 || text.toLowerCase().includes('post')) {
        postsCount = num;
      } else if (index === 1 || text.toLowerCase().includes('follower')) {
        followersCount = num;
      } else if (index === 2 || text.toLowerCase().includes('following')) {
        followingCount = num;
      }
    });

    // Profile image
    const profileImg = document.querySelector('header img[alt*="profile picture"]') ||
                       document.querySelector('header canvas + img');
    const profileImageUrl = profileImg?.getAttribute('src') || null;

    // Verified badge
    const verifiedBadge = document.querySelector('header svg[aria-label="Verified"]');
    const verified = !!verifiedBadge;

    // Private account
    const privateIndicator = document.querySelector('h2[class*="private"]') ||
                            document.body.textContent?.includes('This account is private');
    const isPrivate = !!privateIndicator;

    return {
      username: uname,
      displayName,
      bio,
      website,
      followersCount,
      followingCount,
      postsCount,
      verified,
      profileImageUrl,
      isPrivate,
    };
  }, username);

  return profile;
}

// ============================================================================
// Posts Scraper
// ============================================================================

/**
 * Scrape posts from an Instagram profile
 */
export async function scrapeInstagramPosts(
  page: Page,
  username: string,
  count: number = 12
): Promise<InstagramPost[]> {
  const maxCount = Math.min(count, 50);
  const profileUrl = `${INSTAGRAM_BASE_URL}/${username}/`;

  await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });

  try {
    await page.waitForSelector('article a[href*="/p/"], article a[href*="/reel/"]', { timeout: DEFAULT_TIMEOUT });
  } catch {
    return []; // No posts or private account
  }

  await humanDelay();

  const posts: InstagramPost[] = [];
  const seenIds = new Set<string>();
  let scrollAttempts = 0;

  while (posts.length < maxCount && scrollAttempts < MAX_SCROLL_ATTEMPTS) {
    const newPosts = await page.evaluate(() => {
      const postLinks = document.querySelectorAll('article a[href*="/p/"], article a[href*="/reel/"]');
      const results: InstagramPost[] = [];

      postLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        const idMatch = href.match(/\/(?:p|reel)\/([^/]+)/);
        if (!idMatch) return;

        const id = idMatch[1];
        const url = `https://www.instagram.com${href}`;

        // Try to get thumbnail
        const img = link.querySelector('img');
        const thumbnailUrl = img?.getAttribute('src') || null;

        // Determine type
        const hasVideo = !!link.querySelector('svg[aria-label*="Video"], svg[aria-label*="Reel"]');
        const hasCarousel = !!link.querySelector('svg[aria-label*="Carousel"]');
        const type: 'image' | 'video' | 'carousel' = hasVideo ? 'video' : hasCarousel ? 'carousel' : 'image';

        results.push({
          id,
          url,
          type,
          caption: null,
          likesCount: 0,
          commentsCount: 0,
          timestamp: null,
          thumbnailUrl,
        });
      });

      return results;
    });

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
// Stories Scraper (Limited - requires being logged in and following)
// ============================================================================

/**
 * Check if stories are available (requires following the user)
 */
export async function scrapeInstagramStories(
  page: Page,
  username: string
): Promise<InstagramStory[]> {
  const profileUrl = `${INSTAGRAM_BASE_URL}/${username}/`;
  await page.goto(profileUrl, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });

  await humanDelay();

  // Check for story ring
  const hasStories = await page.evaluate(() => {
    const storyRing = document.querySelector('header canvas[class*="story"], header div[role="button"] canvas');
    return !!storyRing;
  });

  if (!hasStories) {
    return [];
  }

  // Note: Actually viewing stories requires clicking and is more complex
  // For now, just indicate stories are available
  return [{
    id: 'stories-available',
    type: 'image',
    url: `${INSTAGRAM_BASE_URL}/stories/${username}/`,
    timestamp: null,
  }];
}

// ============================================================================
// Exports
// ============================================================================

export { parseInstagramNumber };

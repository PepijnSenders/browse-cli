/**
 * LinkedIn Scraper
 *
 * Extracts professional data from linkedin.com using Playwright browser automation.
 * Requires user to be logged into LinkedIn in their browser.
 */

import type { Page } from 'playwright-core';

// ============================================================================
// Type Definitions
// ============================================================================

export interface LinkedInExperience {
  title: string;
  company: string;
  companyUrl: string | null;
  duration: string;
  location: string | null;
  description: string | null;
}

export interface LinkedInEducation {
  school: string;
  degree: string | null;
  years: string | null;
}

export interface LinkedInProfile {
  name: string;
  headline: string;
  location: string | null;
  about: string | null;
  profileImageUrl: string | null;
  connectionCount: string;
  experience: LinkedInExperience[];
  education: LinkedInEducation[];
  skills: string[];
}

export interface LinkedInPostAuthor {
  name: string;
  headline: string;
  profileUrl: string | null;
  profileImageUrl: string | null;
}

export interface LinkedInPostMetrics {
  reactions: number;
  comments: number;
  reposts: number;
}

export interface LinkedInMedia {
  type: 'image' | 'video' | 'document' | 'link';
  url: string;
  thumbnailUrl?: string;
}

export interface LinkedInPost {
  id: string;
  author: LinkedInPostAuthor;
  text: string;
  createdAt: string;
  metrics: LinkedInPostMetrics;
  media: LinkedInMedia[];
}

export interface LinkedInPersonResult {
  name: string;
  headline: string;
  location: string | null;
  profileUrl: string;
  connectionDegree: string;
}

export interface LinkedInCompanyResult {
  name: string;
  industry: string | null;
  followers: string | null;
  companyUrl: string;
}

export interface LinkedInSearchResults {
  results: LinkedInPersonResult[] | LinkedInCompanyResult[];
  totalResults: number;
  hasMore: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const LINKEDIN_BASE_URL = 'https://www.linkedin.com';
const DEFAULT_TIMEOUT = 30000;
const SCROLL_DELAY = 2000; // LinkedIn requires slower interaction
const MAX_SCROLL_ATTEMPTS = 10;

// ============================================================================
// Selectors (from spec)
// ============================================================================

const PROFILE_SELECTORS = {
  profileCard: '.pv-top-card',
  name: '.pv-top-card h1',
  headline: '.pv-top-card .text-body-medium',
  location: '.pv-top-card .pb2 .text-body-small',
  profileImage: '.pv-top-card img.pv-top-card-profile-picture__image',
  aboutSection: '#about',
  aboutText: '#about + .display-flex .inline-show-more-text',
  connectionCount: '.pv-top-card .pv-top-card--list-bullet li:first-child span',
  experienceSection: '#experience',
  experienceItem: '#experience ~ .pvs-list__outer-container li.artdeco-list__item',
  educationSection: '#education',
  educationItem: '#education ~ .pvs-list__outer-container li.artdeco-list__item',
  skillsSection: '#skills',
  skillItem: '#skills ~ .pvs-list__outer-container .hoverable-link-text span[aria-hidden="true"]',
};

const POST_SELECTORS = {
  postContainer: '.feed-shared-update-v2',
  authorName: '.update-components-actor__name span[aria-hidden="true"]',
  authorHeadline: '.update-components-actor__description',
  authorImage: '.update-components-actor__image img',
  postText: '.feed-shared-update-v2__description .break-words',
  postImage: '.feed-shared-image__image',
  reactionCount: '.social-details-social-counts__reactions-count',
  commentCount: '.social-details-social-counts__comments',
  repostCount: '.social-details-social-counts__reposts',
  postTime: '.update-components-actor__sub-description span[aria-hidden="true"]',
};

const SEARCH_SELECTORS = {
  personResult: '.reusable-search__result-container',
  personName: '.entity-result__title-text a span[aria-hidden="true"]',
  personHeadline: '.entity-result__primary-subtitle',
  personLocation: '.entity-result__secondary-subtitle',
  personProfileLink: '.entity-result__title-text a',
  connectionDegree: '.entity-result__badge-text',
  companyName: '.entity-result__title-text a span[aria-hidden="true"]',
  companyIndustry: '.entity-result__primary-subtitle',
  companyFollowers: '.entity-result__secondary-subtitle',
  nextButton: 'button[aria-label="Next"]',
};

// ============================================================================
// Internal Utilities
// ============================================================================

async function waitAndScroll(page: Page): Promise<boolean> {
  const previousHeight = await page.evaluate(() => document.body.scrollHeight);

  await page.evaluate(() => {
    window.scrollBy({ top: 500, behavior: 'smooth' });
  });
  await page.waitForTimeout(SCROLL_DELAY);

  const newHeight = await page.evaluate(() => document.body.scrollHeight);
  return newHeight > previousHeight;
}

// ============================================================================
// Scraper Functions
// ============================================================================

/**
 * Scrape a LinkedIn profile by URL
 */
export async function scrapeLinkedInProfile(
  page: Page,
  url: string
): Promise<LinkedInProfile> {
  // Validate URL
  if (!url.includes('linkedin.com/in/')) {
    throw new Error('Invalid LinkedIn profile URL. Expected format: https://www.linkedin.com/in/username/');
  }

  // Navigate to profile
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });

  // Wait for profile card to load
  try {
    await page.waitForSelector(PROFILE_SELECTORS.profileCard, { timeout: DEFAULT_TIMEOUT });
  } catch {
    // Check for error states
    const pageContent = await page.content();
    if (pageContent.includes('Page not found') || pageContent.includes('profile is not available')) {
      throw new Error('Profile not found');
    }
    if (pageContent.includes('Sign in') || pageContent.includes('Join now')) {
      throw new Error('Not logged in. Please log into LinkedIn in your browser.');
    }
    throw new Error('Failed to load profile');
  }

  await humanDelay();

  // Scroll to load lazy sections
  for (let i = 0; i < 3; i++) {
    await smoothScroll(page, 500);
    await humanDelay();
  }

  // Extract profile data
  const profile = await page.evaluate((selectors) => {
    const getText = (selector: string): string | null => {
      const el = document.querySelector(selector);
      return el?.textContent?.trim() || null;
    };

    const getAttr = (selector: string, attr: string): string | null => {
      const el = document.querySelector(selector);
      return el?.getAttribute(attr) || null;
    };

    // Basic info
    const name = getText(selectors.name) || 'Unknown';
    const headline = getText(selectors.headline) || '';
    const location = getText(selectors.location);
    const profileImageUrl = getAttr(selectors.profileImage, 'src');

    // About section
    const aboutText = getText(selectors.aboutText);

    // Connection count
    const connectionText = getText(selectors.connectionCount);
    const connectionCount = connectionText?.match(/(\d+\+?|[\d,]+)/)?.[0] || '0';

    // Experience section
    const experience: LinkedInExperience[] = [];
    const expItems = document.querySelectorAll(selectors.experienceItem);
    expItems.forEach((item) => {
      const titleEl = item.querySelector('.mr1 .visually-hidden');
      const companyEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const durationEl = item.querySelector('.pvs-entity__caption-wrapper');
      const descEl = item.querySelector('.inline-show-more-text');
      const companyLink = item.querySelector('a[href*="/company/"]');

      if (titleEl || companyEl) {
        experience.push({
          title: titleEl?.textContent?.trim() || '',
          company: companyEl?.textContent?.trim() || '',
          companyUrl: companyLink?.getAttribute('href') || null,
          duration: durationEl?.textContent?.trim() || '',
          location: null,
          description: descEl?.textContent?.trim() || null,
        });
      }
    });

    // Education section
    const education: LinkedInEducation[] = [];
    const eduItems = document.querySelectorAll(selectors.educationItem);
    eduItems.forEach((item) => {
      const schoolEl = item.querySelector('.mr1 .visually-hidden');
      const degreeEl = item.querySelector('.t-14.t-normal span[aria-hidden="true"]');
      const yearsEl = item.querySelector('.pvs-entity__caption-wrapper');

      if (schoolEl) {
        education.push({
          school: schoolEl.textContent?.trim() || '',
          degree: degreeEl?.textContent?.trim() || null,
          years: yearsEl?.textContent?.trim() || null,
        });
      }
    });

    // Skills (first 10)
    const skills: string[] = [];
    const skillItems = document.querySelectorAll(selectors.skillItem);
    skillItems.forEach((item, index) => {
      if (index < 10 && item.textContent) {
        skills.push(item.textContent.trim());
      }
    });

    return {
      name,
      headline,
      location,
      about: aboutText,
      profileImageUrl,
      connectionCount,
      experience: experience.slice(0, 10),
      education: education.slice(0, 5),
      skills,
    };
  }, PROFILE_SELECTORS);

  return profile;
}

/**
 * Scrape posts from a LinkedIn profile
 */
export async function scrapeLinkedInPosts(
  page: Page,
  url: string,
  count: number = 10
): Promise<LinkedInPost[]> {
  const maxCount = Math.min(count, 50);

  // Construct activity URL
  let activityUrl = url;
  if (url.includes('/in/')) {
    activityUrl = url.endsWith('/') ? `${url}recent-activity/all/` : `${url}/recent-activity/all/`;
  }

  await page.goto(activityUrl, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });

  // Wait for posts to load
  try {
    await page.waitForSelector(POST_SELECTORS.postContainer, { timeout: DEFAULT_TIMEOUT });
  } catch {
    // No posts found
    return [];
  }

  await humanDelay();

  const posts: LinkedInPost[] = [];
  const seenIds = new Set<string>();
  let scrollAttempts = 0;

  while (posts.length < maxCount && scrollAttempts < MAX_SCROLL_ATTEMPTS) {
    // Extract posts from current view
    const newPosts = await page.evaluate((selectors) => {
      const parseMetricText = (text: string | null): number => {
        if (!text) return 0;
        const match = text.match(/([\d,.]+)([KM]?)/);
        if (!match) return 0;
        let num = parseFloat(match[1].replace(/,/g, ''));
        if (match[2] === 'K') num *= 1000;
        if (match[2] === 'M') num *= 1000000;
        return Math.round(num);
      };

      const containers = document.querySelectorAll(selectors.postContainer);
      const results: LinkedInPost[] = [];

      containers.forEach((container, index) => {
        try {
          // Generate a pseudo-ID from position
          const id = `post-${index}-${Date.now()}`;

          // Author info
          const authorNameEl = container.querySelector(selectors.authorName);
          const authorHeadlineEl = container.querySelector(selectors.authorHeadline);
          const authorImageEl = container.querySelector(selectors.authorImage);
          const authorLinkEl = container.querySelector('.update-components-actor__container-link');

          // Post text
          const textEl = container.querySelector(selectors.postText);
          const text = textEl?.textContent?.trim() || '';

          // Time
          const timeEl = container.querySelector(selectors.postTime);
          const createdAt = timeEl?.textContent?.trim() || '';

          // Metrics
          const reactionEl = container.querySelector(selectors.reactionCount);
          const commentEl = container.querySelector(selectors.commentCount);
          const repostEl = container.querySelector(selectors.repostCount);

          // Media
          const media: LinkedInMedia[] = [];
          const images = container.querySelectorAll(selectors.postImage);
          images.forEach((img) => {
            const src = img.getAttribute('src');
            if (src) media.push({ type: 'image', url: src });
          });

          if (text || media.length > 0) {
            results.push({
              id,
              author: {
                name: authorNameEl?.textContent?.trim() || '',
                headline: authorHeadlineEl?.textContent?.trim() || '',
                profileUrl: authorLinkEl?.getAttribute('href') || null,
                profileImageUrl: authorImageEl?.getAttribute('src') || null,
              },
              text,
              createdAt,
              metrics: {
                reactions: parseMetricText(reactionEl?.textContent ?? null),
                comments: parseMetricText(commentEl?.textContent ?? null),
                reposts: parseMetricText(repostEl?.textContent ?? null),
              },
              media,
            });
          }
        } catch {
          // Skip malformed posts
        }
      });

      return results;
    }, POST_SELECTORS);

    // Add new posts (avoiding duplicates based on text)
    for (const post of newPosts) {
      const postKey = post.text.slice(0, 100);
      if (!seenIds.has(postKey) && posts.length < maxCount) {
        seenIds.add(postKey);
        posts.push(post);
      }
    }

    if (posts.length >= maxCount) break;

    // Try to load more
    const hasMore = await waitAndScroll(page);
    if (!hasMore) {
      scrollAttempts++;
    } else {
      scrollAttempts = 0;
    }

    await humanDelay();
  }

  return posts.slice(0, maxCount);
}

/**
 * Search LinkedIn for people, companies, or posts
 */
export async function scrapeLinkedInSearch(
  page: Page,
  query: string,
  type: 'people' | 'companies' | 'posts' = 'people',
  count: number = 20
): Promise<LinkedInSearchResults> {
  const maxCount = Math.min(count, 50);

  // Construct search URL based on type
  const searchPaths: Record<string, string> = {
    people: 'people',
    companies: 'companies',
    posts: 'content',
  };
  const searchPath = searchPaths[type];
  const searchUrl = `${LINKEDIN_BASE_URL}/search/results/${searchPath}/?keywords=${encodeURIComponent(query)}`;

  await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: DEFAULT_TIMEOUT });

  // Wait for results
  try {
    await page.waitForSelector(SEARCH_SELECTORS.personResult, { timeout: DEFAULT_TIMEOUT });
  } catch {
    // No results
    return { results: [], totalResults: 0, hasMore: false };
  }

  await humanDelay();

  const results: (LinkedInPersonResult | LinkedInCompanyResult)[] = [];
  const seenUrls = new Set<string>();
  let scrollAttempts = 0;

  while (results.length < maxCount && scrollAttempts < MAX_SCROLL_ATTEMPTS) {
    // Extract results based on type
    if (type === 'people') {
      const newResults = await page.evaluate((selectors) => {
        const containers = document.querySelectorAll(selectors.personResult);
        const items: LinkedInPersonResult[] = [];

        containers.forEach((container) => {
          try {
            const nameEl = container.querySelector(selectors.personName);
            const headlineEl = container.querySelector(selectors.personHeadline);
            const locationEl = container.querySelector(selectors.personLocation);
            const linkEl = container.querySelector(selectors.personProfileLink);
            const degreeEl = container.querySelector(selectors.connectionDegree);

            const profileUrl = linkEl?.getAttribute('href')?.split('?')[0] || '';
            if (!profileUrl || !nameEl) return;

            items.push({
              name: nameEl.textContent?.trim() || '',
              headline: headlineEl?.textContent?.trim() || '',
              location: locationEl?.textContent?.trim() || null,
              profileUrl: `https://www.linkedin.com${profileUrl.startsWith('/') ? profileUrl : '/' + profileUrl}`,
              connectionDegree: degreeEl?.textContent?.trim() || 'Unknown',
            });
          } catch {
            // Skip malformed results
          }
        });

        return items;
      }, SEARCH_SELECTORS);

      for (const result of newResults) {
        if (!seenUrls.has(result.profileUrl) && results.length < maxCount) {
          seenUrls.add(result.profileUrl);
          results.push(result);
        }
      }
    } else if (type === 'companies') {
      const newResults = await page.evaluate((selectors) => {
        const containers = document.querySelectorAll(selectors.personResult);
        const items: LinkedInCompanyResult[] = [];

        containers.forEach((container) => {
          try {
            const nameEl = container.querySelector(selectors.companyName);
            const industryEl = container.querySelector(selectors.companyIndustry);
            const followersEl = container.querySelector(selectors.companyFollowers);
            const linkEl = container.querySelector('.entity-result__title-text a');

            const companyUrl = linkEl?.getAttribute('href')?.split('?')[0] || '';
            if (!companyUrl || !nameEl) return;

            items.push({
              name: nameEl.textContent?.trim() || '',
              industry: industryEl?.textContent?.trim() || null,
              followers: followersEl?.textContent?.trim() || null,
              companyUrl: `https://www.linkedin.com${companyUrl.startsWith('/') ? companyUrl : '/' + companyUrl}`,
            });
          } catch {
            // Skip malformed results
          }
        });

        return items;
      }, SEARCH_SELECTORS);

      for (const result of newResults) {
        if (!seenUrls.has(result.companyUrl) && results.length < maxCount) {
          seenUrls.add(result.companyUrl);
          results.push(result);
        }
      }
    } else {
      // Posts search - returns similar structure to posts scraping
      const newPosts = await page.evaluate(() => {
        const containers = document.querySelectorAll('.reusable-search__result-container');
        const items: LinkedInPersonResult[] = [];

        containers.forEach((container, index) => {
          try {
            const textEl = container.querySelector('.update-components-text');
            const authorEl = container.querySelector('.update-components-actor__name');
            const linkEl = container.querySelector('a[href*="/feed/update/"]');

            const postUrl = linkEl?.getAttribute('href') || `post-${index}`;

            items.push({
              name: authorEl?.textContent?.trim() || 'Unknown',
              headline: textEl?.textContent?.trim()?.slice(0, 200) || '',
              location: null,
              profileUrl: postUrl,
              connectionDegree: '',
            });
          } catch {
            // Skip
          }
        });

        return items;
      });

      for (const result of newPosts) {
        if (!seenUrls.has(result.profileUrl) && results.length < maxCount) {
          seenUrls.add(result.profileUrl);
          results.push(result);
        }
      }
    }

    if (results.length >= maxCount) break;

    // Try pagination or scroll
    const nextButton = await page.$(SEARCH_SELECTORS.nextButton);
    if (nextButton) {
      await nextButton.click();
      await page.waitForTimeout(SCROLL_DELAY);
      await humanDelay();
    } else {
      const hasMore = await waitAndScroll(page);
      if (!hasMore) {
        scrollAttempts++;
      } else {
        scrollAttempts = 0;
      }
    }

    await humanDelay();
  }

  return {
    results: results.slice(0, maxCount) as LinkedInPersonResult[] | LinkedInCompanyResult[],
    totalResults: results.length,
    hasMore: scrollAttempts < MAX_SCROLL_ATTEMPTS,
  };
}

// ============================================================================
// Utility Functions (for future implementation)
// ============================================================================

/**
 * Parse LinkedIn connection degree
 */
export function parseConnectionDegree(text: string): string {
  if (text.includes('1st')) return '1st';
  if (text.includes('2nd')) return '2nd';
  if (text.includes('3rd')) return '3rd';
  return 'Out of Network';
}

/**
 * Parse LinkedIn duration string
 */
export function parseDuration(text: string): { start: string; end: string; total: string } {
  const parts = text.split('·').map(p => p.trim());
  const dateRange = parts[0]; // "Jan 2020 - Present"
  const total = parts[1] || ''; // "4 yrs 2 mos"

  const [start, end] = dateRange.split(' - ').map(d => d.trim());

  return { start, end: end || 'Present', total };
}

/**
 * Parse LinkedIn follower count
 */
export function parseFollowerCount(text: string): number {
  // "1,234 followers" or "1.2M followers"
  const match = text.match(/([\d,.]+)([KM]?)/);
  if (!match) return 0;

  let num = parseFloat(match[1].replace(/,/g, ''));
  if (match[2] === 'K') num *= 1000;
  if (match[2] === 'M') num *= 1000000;

  return Math.round(num);
}

/**
 * Add human-like delay to avoid detection
 */
export async function humanDelay() {
  const delay = 500 + Math.random() * 1000; // 500-1500ms
  await new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Smooth scroll to avoid detection
 */
export async function smoothScroll(page: Page, distance: number): Promise<void> {
  await page.evaluate((d) => {
    window.scrollBy({ top: d, behavior: 'smooth' });
  }, distance);
}

/**
 * Expand truncated content by clicking "see more"
 */
export async function expandContent(page: Page, selector: string): Promise<void> {
  const button = await page.$(selector + ' .inline-show-more-text__button');
  if (button) {
    await button.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Handle LinkedIn login wall
 */
export async function handleLoginWall(page: Page): Promise<void> {
  const loginModal = await page.$('.login-form');
  if (loginModal) {
    // Close modal and retry
    await page.keyboard.press('Escape');
    await page.reload();
  }
}

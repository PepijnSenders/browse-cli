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
// Scraper Functions
// ============================================================================

/**
 * Scrape a LinkedIn profile by URL
 *
 * @param page - Playwright page instance
 * @param url - Full LinkedIn profile URL (e.g., https://www.linkedin.com/in/username/)
 * @returns Profile object with user information
 *
 * @example
 * const profile = await scrapeLinkedInProfile(page, 'https://www.linkedin.com/in/satyanadella/');
 * console.log(profile.name); // "Satya Nadella"
 * console.log(profile.headline); // "Chairman and CEO at Microsoft"
 * console.log(profile.experience.length); // Number of experiences
 */
export async function scrapeLinkedInProfile(
  _page: Page,
  _url: string
): Promise<LinkedInProfile> {
  throw new Error('LinkedIn scraper not implemented yet');
}

/**
 * Scrape posts from a LinkedIn profile
 *
 * @param page - Playwright page instance
 * @param url - Full LinkedIn profile URL
 * @param count - Maximum number of posts to retrieve (default: 10)
 * @returns Array of posts
 *
 * @example
 * const posts = await scrapeLinkedInPosts(
 *   page,
 *   'https://www.linkedin.com/in/satyanadella/',
 *   5
 * );
 * console.log(posts[0].text);
 * console.log(posts[0].metrics.reactions);
 */
export async function scrapeLinkedInPosts(
  _page: Page,
  _url: string,
  _count: number = 10
): Promise<LinkedInPost[]> {
  throw new Error('LinkedIn scraper not implemented yet');
}

/**
 * Search LinkedIn for people, companies, or posts
 *
 * @param page - Playwright page instance
 * @param query - Search query
 * @param type - Search type: 'people', 'companies', or 'posts' (default: 'people')
 * @param count - Maximum number of results to retrieve (default: 20)
 * @returns Search results
 *
 * @example
 * // Search for people
 * const people = await scrapeLinkedInSearch(page, 'software engineer', 'people', 10);
 *
 * // Search for companies
 * const companies = await scrapeLinkedInSearch(page, 'AI startup', 'companies', 5);
 *
 * // Search for posts
 * const posts = await scrapeLinkedInSearch(page, 'machine learning', 'posts', 15);
 */
export async function scrapeLinkedInSearch(
  _page: Page,
  _query: string,
  _type: 'people' | 'companies' | 'posts' = 'people',
  _count: number = 20
): Promise<LinkedInSearchResults> {
  throw new Error('LinkedIn scraper not implemented yet');
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

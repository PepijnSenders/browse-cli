# LinkedIn Scraper Specification

## Overview

The LinkedIn scraper extracts professional data from linkedin.com using the user's logged-in browser session. LinkedIn has aggressive anti-scraping measures, so this leverages the user's legitimate session.

## Prerequisites

- User must be logged into LinkedIn in their browser
- Playwriter extension must be enabled on the LinkedIn tab
- LinkedIn Premium may provide access to additional data

## URL Patterns

| Page Type | URL Pattern |
|-----------|-------------|
| Profile | `https://www.linkedin.com/in/{slug}/` |
| Company | `https://www.linkedin.com/company/{slug}/` |
| Feed | `https://www.linkedin.com/feed/` |
| Search People | `https://www.linkedin.com/search/results/people/?keywords={query}` |
| Search Companies | `https://www.linkedin.com/search/results/companies/?keywords={query}` |
| Search Posts | `https://www.linkedin.com/search/results/content/?keywords={query}` |
| User Posts | `https://www.linkedin.com/in/{slug}/recent-activity/all/` |

## DOM Selectors

> **Note:** LinkedIn uses BEM-style class names that are more stable than Twitter's, but still change. Use semantic selectors where possible.

### Profile Page Selectors

```typescript
const PROFILE_SELECTORS = {
  // Main profile card
  profileCard: '.pv-top-card',
  name: '.pv-top-card h1',
  headline: '.pv-top-card .text-body-medium',
  location: '.pv-top-card .pb2 .text-body-small',
  profileImage: '.pv-top-card img.pv-top-card-profile-picture__image',

  // About section
  aboutSection: '#about',
  aboutText: '#about + .display-flex .inline-show-more-text',

  // Connection count
  connectionCount: '.pv-top-card .pv-top-card--list-bullet li:first-child span',

  // Experience section
  experienceSection: '#experience',
  experienceItem: '#experience ~ .pvs-list__outer-container li.artdeco-list__item',

  // Within experience item
  expTitle: '.display-flex .mr1 .visually-hidden',
  expCompany: '.t-14.t-normal span[aria-hidden="true"]',
  expDuration: '.pvs-entity__caption-wrapper',
  expDescription: '.pvs-list__outer-container .inline-show-more-text',

  // Education section
  educationSection: '#education',
  educationItem: '#education ~ .pvs-list__outer-container li.artdeco-list__item',

  // Skills section
  skillsSection: '#skills',
  skillItem: '#skills ~ .pvs-list__outer-container .hoverable-link-text span[aria-hidden="true"]',
}
```

### Post Selectors

```typescript
const POST_SELECTORS = {
  // Post container
  postContainer: '.feed-shared-update-v2',

  // Author info
  authorName: '.update-components-actor__name span[aria-hidden="true"]',
  authorHeadline: '.update-components-actor__description',
  authorImage: '.update-components-actor__image img',

  // Post content
  postText: '.feed-shared-update-v2__description .break-words',
  postImage: '.feed-shared-image__image',
  postVideo: '.feed-shared-external-video__meta',

  // Metrics
  reactionCount: '.social-details-social-counts__reactions-count',
  commentCount: '.social-details-social-counts__comments',
  repostCount: '.social-details-social-counts__reposts',

  // Timestamp
  postTime: '.update-components-actor__sub-description span[aria-hidden="true"]',
}
```

### Search Results Selectors

```typescript
const SEARCH_SELECTORS = {
  // People search
  personResult: '.reusable-search__result-container',
  personName: '.entity-result__title-text a span[aria-hidden="true"]',
  personHeadline: '.entity-result__primary-subtitle',
  personLocation: '.entity-result__secondary-subtitle',
  personProfileLink: '.entity-result__title-text a',
  connectionDegree: '.entity-result__badge-text',

  // Company search
  companyResult: '.reusable-search__result-container',
  companyName: '.entity-result__title-text a span[aria-hidden="true"]',
  companyIndustry: '.entity-result__primary-subtitle',
  companyFollowers: '.entity-result__secondary-subtitle',

  // Pagination
  nextButton: 'button[aria-label="Next"]',
  paginationText: '.artdeco-pagination__page-state',
}
```

## Extraction Logic

### `scrapeProfile(page, url)`

```
1. Navigate to profile URL
2. Wait for profile card to load (.pv-top-card)
3. Check for error states:
   - "Page not found" → throw ProfileNotFound
   - "Sign in" prompt → throw NotLoggedIn
4. Extract basic info (name, headline, location)
5. Scroll to load lazy sections
6. Extract experience section:
   a. Click "Show all experiences" if present
   b. Parse each experience item
7. Extract education section
8. Extract skills (first 10)
9. Return structured profile object
```

### `scrapePosts(page, url, count)`

```
1. Navigate to user's activity page: {url}recent-activity/all/
2. Wait for first post to load
3. Initialize posts array
4. While posts.length < count:
   a. Find all post containers on page
   b. For each new post:
      - Extract author info
      - Extract post text (expand if truncated)
      - Extract media (images, videos)
      - Extract metrics
   c. If need more:
      - Scroll down
      - Wait for new content
      - If no new content after 3 attempts, break
5. Return posts array
```

### `scrapeSearch(page, query, type, count)`

```
1. Construct search URL based on type:
   - people: /search/results/people/?keywords={query}
   - companies: /search/results/companies/?keywords={query}
   - posts: /search/results/content/?keywords={query}
2. Navigate to search URL
3. Wait for results to load
4. Initialize results array
5. While results.length < count:
   a. Extract results from current page
   b. If more results needed:
      - Click "Next" button if available
      - Or scroll for infinite scroll sections
      - Wait for new results
6. Return results array
```

## Data Parsing Utilities

### Connection Degree Parsing

```typescript
function parseConnectionDegree(text: string): string {
  if (text.includes('1st')) return '1st';
  if (text.includes('2nd')) return '2nd';
  if (text.includes('3rd')) return '3rd';
  return 'Out of Network';
}
```

### Duration Parsing

LinkedIn shows durations like "Jan 2020 - Present · 4 yrs 2 mos"

```typescript
function parseDuration(text: string): { start: string; end: string; total: string } {
  const parts = text.split('·').map(p => p.trim());
  const dateRange = parts[0]; // "Jan 2020 - Present"
  const total = parts[1] || ''; // "4 yrs 2 mos"

  const [start, end] = dateRange.split(' - ').map(d => d.trim());

  return { start, end: end || 'Present', total };
}
```

### Follower Count Parsing

```typescript
function parseFollowerCount(text: string): number {
  // "1,234 followers" or "1.2M followers"
  const match = text.match(/([\d,.]+)([KM]?)/);
  if (!match) return 0;

  let num = parseFloat(match[1].replace(/,/g, ''));
  if (match[2] === 'K') num *= 1000;
  if (match[2] === 'M') num *= 1000000;

  return Math.round(num);
}
```

## Handling LinkedIn's Anti-Scraping

LinkedIn is aggressive about detecting automation. Mitigations:

### 1. Human-like Behavior

```typescript
// Random delays between actions
async function humanDelay() {
  const delay = 500 + Math.random() * 1000; // 500-1500ms
  await page.waitForTimeout(delay);
}

// Smooth scrolling
async function smoothScroll(page: Page, distance: number) {
  await page.evaluate((d) => {
    window.scrollBy({ top: d, behavior: 'smooth' });
  }, distance);
}
```

### 2. Click Expansion Buttons

LinkedIn truncates content. Must click "see more" to get full text:

```typescript
async function expandContent(page: Page, container: Element) {
  const seeMore = container.querySelector('.inline-show-more-text__button');
  if (seeMore) {
    await seeMore.click();
    await page.waitForTimeout(300);
  }
}
```

### 3. Handle Login Walls

Some pages show login prompts even when logged in:

```typescript
async function handleLoginWall(page: Page) {
  const loginModal = await page.$('.login-form');
  if (loginModal) {
    // Close modal and retry
    await page.keyboard.press('Escape');
    await page.reload();
  }
}
```

## Rate Limiting Considerations

LinkedIn is stricter than Twitter. Recommendations:

1. **Minimum 2 second delays** between page navigations
2. **Maximum 50 profile views per hour** (approximately)
3. **Avoid rapid scrolling** - scroll like a human
4. **Mix up activity** - don't just scrape, use LinkedIn normally too
5. **Watch for warnings** - LinkedIn shows "unusual activity" warnings

## Error Handling

| Error State | Detection | Response |
|-------------|-----------|----------|
| Not logged in | Sign in modal | Ask user to log in |
| Profile not found | 404 page | Throw `ProfileNotFound` |
| Premium required | "See who viewed" lock | Return available data |
| Rate limited | "Unusual activity" | Wait 10 min, retry |
| CAPTCHA | Challenge page | Ask user to solve |

## Example Outputs

### Profile

```json
{
  "name": "Satya Nadella",
  "headline": "Chairman and CEO at Microsoft",
  "location": "Greater Seattle Area",
  "about": "As chairman and CEO of Microsoft, I help our global customers and partners...",
  "profileImageUrl": "https://media.licdn.com/...",
  "connectionCount": "500+",
  "experience": [
    {
      "title": "Chairman and CEO",
      "company": "Microsoft",
      "companyUrl": "https://linkedin.com/company/microsoft",
      "duration": "Feb 2014 - Present · 10 yrs",
      "location": "Redmond, Washington",
      "description": "Leading Microsoft's transformation..."
    },
    {
      "title": "Executive Vice President, Cloud and Enterprise",
      "company": "Microsoft",
      "companyUrl": "https://linkedin.com/company/microsoft",
      "duration": "2011 - 2014 · 3 yrs",
      "location": null,
      "description": null
    }
  ],
  "education": [
    {
      "school": "University of Wisconsin-Milwaukee",
      "degree": "MS, Computer Science",
      "years": "1988 - 1990"
    },
    {
      "school": "Manipal Institute of Technology",
      "degree": "B.E., Electrical Engineering",
      "years": "1984 - 1988"
    }
  ],
  "skills": ["Leadership", "Cloud Computing", "Business Strategy", "Product Development"]
}
```

### Post

```json
{
  "id": "urn:li:activity:7147654321098765432",
  "author": {
    "name": "Satya Nadella",
    "headline": "Chairman and CEO at Microsoft",
    "profileUrl": "https://linkedin.com/in/satyanadella",
    "profileImageUrl": "https://..."
  },
  "text": "Excited to announce our latest AI developments...",
  "createdAt": "2024-01-15",
  "metrics": {
    "reactions": 25000,
    "comments": 500,
    "reposts": 1200
  },
  "media": [
    {
      "type": "image",
      "url": "https://media.licdn.com/..."
    }
  ]
}
```

### Search Result (People)

```json
{
  "results": [
    {
      "name": "John Smith",
      "headline": "Software Engineer at Google",
      "location": "San Francisco Bay Area",
      "profileUrl": "https://linkedin.com/in/johnsmith",
      "connectionDegree": "2nd"
    }
  ],
  "totalResults": 1500,
  "hasMore": true
}
```

## Testing Strategy

1. **Use test accounts** - Create LinkedIn accounts for testing
2. **Rate limit aware** - Space out test runs
3. **Monitor for breakage** - LinkedIn changes frequently
4. **Manual verification** - Compare scraped data to UI
5. **Partial success handling** - Tests should handle missing fields gracefully

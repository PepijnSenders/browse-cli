# Twitter/X Scraper Specification

## Overview

The Twitter scraper extracts data from x.com (formerly twitter.com) using the user's logged-in browser session. It navigates to pages and parses the DOM to extract structured data.

## Prerequisites

- User must be logged into Twitter/X in their browser
- Playwriter extension must be enabled on the Twitter tab
- Some features may require Twitter Premium for full access

## URL Patterns

| Page Type | URL Pattern |
|-----------|-------------|
| Profile | `https://x.com/{username}` |
| Tweet | `https://x.com/{username}/status/{tweet_id}` |
| Home Timeline | `https://x.com/home` |
| Search | `https://x.com/search?q={query}` |
| User Timeline | `https://x.com/{username}` |
| Followers | `https://x.com/{username}/followers` |
| Following | `https://x.com/{username}/following` |

## DOM Selectors

> **Note:** Twitter uses dynamic class names that change frequently. Selectors should use data attributes and ARIA labels where possible.

### Profile Page Selectors

```typescript
const PROFILE_SELECTORS = {
  // Profile header section
  displayName: '[data-testid="UserName"] span:first-child',
  username: '[data-testid="UserName"] span:contains("@")',
  bio: '[data-testid="UserDescription"]',
  location: '[data-testid="UserLocation"]',
  website: '[data-testid="UserUrl"] a',
  joinDate: '[data-testid="UserJoinDate"]',

  // Stats
  followersCount: 'a[href$="/verified_followers"] span, a[href$="/followers"] span',
  followingCount: 'a[href$="/following"] span',

  // Images
  profileImage: '[data-testid="UserAvatar-Container"] img',
  bannerImage: '[data-testid="UserProfileHeader_Items"] img',

  // Verification
  verifiedBadge: '[data-testid="UserName"] svg[aria-label*="Verified"]',
}
```

### Tweet Selectors

```typescript
const TWEET_SELECTORS = {
  // Tweet container
  tweetArticle: 'article[data-testid="tweet"]',

  // Author info (within tweet)
  authorName: '[data-testid="User-Name"] a span:first-child',
  authorUsername: '[data-testid="User-Name"] a[tabindex="-1"]',
  authorAvatar: '[data-testid="Tweet-User-Avatar"] img',

  // Tweet content
  tweetText: '[data-testid="tweetText"]',
  tweetTime: 'time',
  tweetLink: 'a[href*="/status/"] time',

  // Media
  tweetImage: '[data-testid="tweetPhoto"] img',
  tweetVideo: '[data-testid="videoPlayer"]',

  // Metrics (within tweet)
  replyCount: '[data-testid="reply"] span',
  retweetCount: '[data-testid="retweet"] span',
  likeCount: '[data-testid="like"] span',
  viewCount: 'a[href$="/analytics"] span',

  // Tweet types
  quotedTweet: '[data-testid="tweet"] [data-testid="tweet"]',
  retweetIndicator: '[data-testid="socialContext"]',
}
```

### Search Page Selectors

```typescript
const SEARCH_SELECTORS = {
  searchInput: '[data-testid="SearchBox_Search_Input"]',
  searchResults: '[data-testid="cellInnerDiv"]',
  tabLatest: 'a[href*="f=live"]',
  tabPeople: 'a[href*="f=user"]',
  tabMedia: 'a[href*="f=media"]',
}
```

## Extraction Logic

### `scrapeProfile(page, username)`

```
1. Navigate to https://x.com/{username}
2. Wait for profile header to load (data-testid="UserName")
3. Check for error states:
   - "This account doesn't exist" → throw UserNotFound
   - "Account suspended" → throw AccountSuspended
4. Extract profile data using PROFILE_SELECTORS
5. Parse follower/following counts (handle K, M suffixes)
6. Return structured profile object
```

### `scrapeTimeline(page, username?, count)`

```
1. If username provided:
   - Navigate to https://x.com/{username}
   Else:
   - Navigate to https://x.com/home
2. Wait for first tweet to load
3. Initialize tweets array
4. While tweets.length < count:
   a. Find all tweet articles on page
   b. For each new tweet:
      - Extract tweet data using TWEET_SELECTORS
      - Parse metrics (handle K, M suffixes)
      - Detect tweet type (original, retweet, reply)
      - Add to tweets array
   c. If need more tweets:
      - Scroll down to trigger infinite scroll
      - Wait for new content
      - If no new content after 3 attempts, break
5. Return tweets array (limited to count)
```

### `scrapePost(page, url)`

```
1. Navigate to tweet URL
2. Wait for main tweet to load
3. Extract main tweet data
4. If tweet is a reply:
   - Scroll up to find thread parent
   - Extract thread context
5. Extract top replies (first 5-10)
6. Return tweet with thread and replies
```

### `scrapeSearch(page, query, count)`

```
1. Navigate to https://x.com/search?q={encodeURIComponent(query)}
2. Click "Latest" tab for chronological results
3. Wait for results to load
4. Follow same pagination logic as scrapeTimeline
5. Return tweets array
```

## Data Parsing Utilities

### Number Parsing

Twitter displays numbers in compact format. Parser must handle:
- Plain numbers: `1,234` → `1234`
- Thousands: `12.5K` → `12500`
- Millions: `1.2M` → `1200000`
- Blank/missing: `` → `0`

```typescript
function parseTwitterNumber(text: string): number {
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
```

### Date Parsing

Twitter shows relative times ("2h", "Mar 15") and absolute times on hover.

```typescript
function parseTwitterDate(timeElement: Element): string {
  // Prefer datetime attribute (ISO format)
  const datetime = timeElement.getAttribute('datetime');
  if (datetime) return datetime;

  // Fall back to parsing text
  const text = timeElement.textContent;
  // ... handle relative times
}
```

### Tweet Type Detection

```typescript
function detectTweetType(article: Element): 'tweet' | 'retweet' | 'reply' {
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
```

## Pagination Strategy

Twitter uses infinite scroll. To load more content:

```typescript
async function loadMoreTweets(page: Page, currentCount: number): Promise<boolean> {
  const previousHeight = await page.evaluate(() => document.body.scrollHeight);

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Wait for content to load
  await page.waitForTimeout(1500);

  const newHeight = await page.evaluate(() => document.body.scrollHeight);

  // If height didn't change, no more content
  return newHeight > previousHeight;
}
```

## Rate Limiting Considerations

Twitter may rate limit aggressive scraping. Mitigations:

1. **Add delays between requests** - 1-2 seconds between page navigations
2. **Limit scroll speed** - Don't scroll too fast
3. **Respect rate limit errors** - If blocked, wait before retrying
4. **Use reasonable counts** - Don't request 1000 tweets at once

## Error Handling

| Error State | Detection | Response |
|-------------|-----------|----------|
| Not logged in | Login prompt visible | Ask user to log in |
| User not found | "doesn't exist" text | Throw `UserNotFound` |
| Account suspended | "suspended" text | Throw `AccountSuspended` |
| Private account | "protected" indicator | Return limited data |
| Rate limited | "limit" error | Wait 60s and retry |
| Page changed | Selectors fail | Log warning, return partial |

## Example Outputs

### Profile

```json
{
  "username": "elonmusk",
  "displayName": "Elon Musk",
  "bio": "Mars & Cars, Chips & Dips",
  "location": "Austin, Texas",
  "website": "https://tesla.com",
  "joinDate": "June 2009",
  "followersCount": 170500000,
  "followingCount": 512,
  "postsCount": 42000,
  "verified": true,
  "profileImageUrl": "https://pbs.twimg.com/profile_images/...",
  "bannerImageUrl": "https://pbs.twimg.com/profile_banners/..."
}
```

### Tweet

```json
{
  "id": "1747654321098765432",
  "url": "https://x.com/elonmusk/status/1747654321098765432",
  "text": "The thing about AI is that it's going to change everything.",
  "author": {
    "username": "elonmusk",
    "displayName": "Elon Musk",
    "profileImageUrl": "https://...",
    "verified": true
  },
  "createdAt": "2024-01-17T15:30:00.000Z",
  "metrics": {
    "replies": 25000,
    "retweets": 45000,
    "likes": 350000,
    "views": 15000000
  },
  "media": [],
  "type": "tweet",
  "quotedTweet": null,
  "inReplyTo": null
}
```

## Testing Strategy

1. **Manual verification** - Compare scraped data to visible page
2. **Snapshot tests** - Save known-good outputs, compare
3. **Selector validation** - Periodically check selectors still work
4. **Edge cases** - Test suspended accounts, private accounts, deleted tweets

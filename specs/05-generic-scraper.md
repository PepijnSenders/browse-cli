# Generic Scraper Specification

## Overview

The generic scraper provides site-agnostic page scraping capabilities. It extracts text, links, images, and structured data from any web page the user has access to.

## Use Cases

1. **Paywalled content** - News sites, research papers (user must be subscribed)
2. **Logged-in pages** - Dashboards, account pages, internal tools
3. **Any website** - General-purpose web scraping
4. **Page inspection** - Check what's on a page before using specialized scrapers

## Tools

### `scrape_page`

Extract content from the current page.

### `execute_script`

Run custom JavaScript for complex extractions.

### `navigate`

Navigate to a URL.

### `take_screenshot`

Visual capture of the page.

## `scrape_page` Implementation

### Default Extraction (no selector)

When called without a selector, extract the full page:

```typescript
async function scrapePage(page: Page): Promise<PageContent> {
  return await page.evaluate(() => {
    // Get main content text
    const getText = (el: Element): string => {
      // Skip hidden elements
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return '';
      }

      // Skip script/style
      if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) {
        return '';
      }

      return el.textContent || '';
    };

    // Find main content area
    const mainContent =
      document.querySelector('main') ||
      document.querySelector('article') ||
      document.querySelector('[role="main"]') ||
      document.body;

    // Extract links
    const links = Array.from(document.querySelectorAll('a[href]'))
      .map((a) => ({
        text: a.textContent?.trim() || '',
        href: (a as HTMLAnchorElement).href,
      }))
      .filter((l) => l.href && l.href.startsWith('http'));

    // Extract images
    const images = Array.from(document.querySelectorAll('img[src]'))
      .map((img) => ({
        alt: img.getAttribute('alt') || '',
        src: (img as HTMLImageElement).src,
      }))
      .filter((i) => i.src && i.src.startsWith('http'));

    return {
      url: window.location.href,
      title: document.title,
      text: getText(mainContent).trim().replace(/\s+/g, ' '),
      links: links.slice(0, 100), // Limit to 100 links
      images: images.slice(0, 50), // Limit to 50 images
    };
  });
}
```

### Scoped Extraction (with selector)

When a CSS selector is provided, extract only from that element:

```typescript
async function scrapePageScoped(page: Page, selector: string): Promise<PageContent> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) {
      throw new Error(`Element not found: ${sel}`);
    }

    const links = Array.from(element.querySelectorAll('a[href]'))
      .map((a) => ({
        text: a.textContent?.trim() || '',
        href: (a as HTMLAnchorElement).href,
      }))
      .filter((l) => l.href);

    const images = Array.from(element.querySelectorAll('img[src]'))
      .map((img) => ({
        alt: img.getAttribute('alt') || '',
        src: (img as HTMLImageElement).src,
      }))
      .filter((i) => i.src);

    return {
      url: window.location.href,
      title: document.title,
      selector: sel,
      text: element.textContent?.trim().replace(/\s+/g, ' ') || '',
      html: element.innerHTML.slice(0, 50000), // Limit HTML size
      links,
      images,
    };
  }, selector);
}
```

## `execute_script` Implementation

Allow arbitrary JavaScript execution for custom extractions:

```typescript
async function executeScript(page: Page, script: string): Promise<unknown> {
  // Script should be a function body that returns a value
  const result = await page.evaluate((code) => {
    // Wrap in async IIFE to allow await
    const fn = new Function(`return (async () => { ${code} })()`) as () => Promise<unknown>;
    return fn();
  }, script);

  return result;
}
```

### Example Scripts

**Extract all headings:**
```javascript
return Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
  level: h.tagName,
  text: h.textContent?.trim()
}));
```

**Get table data:**
```javascript
const table = document.querySelector('table');
const rows = Array.from(table.querySelectorAll('tr'));
return rows.map(row =>
  Array.from(row.querySelectorAll('td, th')).map(cell => cell.textContent?.trim())
);
```

**Extract JSON-LD structured data:**
```javascript
const scripts = document.querySelectorAll('script[type="application/ld+json"]');
return Array.from(scripts).map(s => JSON.parse(s.textContent));
```

**Wait and extract dynamic content:**
```javascript
await new Promise(r => setTimeout(r, 2000)); // Wait for loading
return document.querySelector('.dynamic-content')?.textContent;
```

## `navigate` Implementation

```typescript
async function navigate(page: Page, url: string): Promise<NavigateResult> {
  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL');
  }

  // Navigate with timeout
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  return {
    success: true,
    url: page.url(),
    title: await page.title(),
  };
}
```

## `take_screenshot` Implementation

```typescript
async function takeScreenshot(page: Page, fullPage: boolean): Promise<Buffer> {
  return await page.screenshot({
    fullPage,
    type: 'png',
  });
}
```

### Screenshot Considerations

1. **File size** - Full page screenshots can be very large
2. **Sensitive data** - May capture passwords, personal info
3. **Dynamic content** - May miss animations, video
4. **Viewport size** - Affects what's captured

## Output Formats

### `PageContent`

```typescript
interface PageContent {
  url: string;
  title: string;
  selector?: string;
  text: string;
  html?: string; // Only when selector provided
  links: Array<{
    text: string;
    href: string;
  }>;
  images: Array<{
    alt: string;
    src: string;
  }>;
}
```

### `NavigateResult`

```typescript
interface NavigateResult {
  success: boolean;
  url: string;
  title: string;
}
```

## Content Cleaning

### Text Normalization

```typescript
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ')           // Collapse whitespace
    .replace(/\n{3,}/g, '\n\n')     // Max 2 newlines
    .trim();
}
```

### Link Filtering

```typescript
function filterLinks(links: Link[]): Link[] {
  return links
    .filter(l => l.href.startsWith('http'))  // Only HTTP(S)
    .filter(l => !l.href.includes('javascript:'))  // No JS links
    .filter((l, i, arr) =>                   // Dedupe by href
      arr.findIndex(x => x.href === l.href) === i
    );
}
```

### HTML Sanitization

When returning HTML, remove potentially dangerous content:

```typescript
function sanitizeHtml(html: string): string {
  // Remove script tags
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers
  html = html.replace(/\s+on\w+="[^"]*"/gi, '');

  // Remove iframes
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

  return html;
}
```

## Error Handling

| Error | Cause | Response |
|-------|-------|----------|
| Invalid URL | Bad URL format | Return error message |
| Navigation timeout | Slow page / blocked | Increase timeout or fail |
| Element not found | Bad selector | Return error with selector |
| Script error | Bad JavaScript | Return error message |
| Page not accessible | 403/404/etc | Return error with status |

## Size Limits

To prevent overwhelming the MCP client:

| Content | Limit |
|---------|-------|
| Text | 100,000 characters |
| HTML | 50,000 characters |
| Links | 100 items |
| Images | 50 items |
| Screenshot | 5MB |
| Script result | 1MB |

## Example Outputs

### Full Page Scrape

```json
{
  "url": "https://news.ycombinator.com/",
  "title": "Hacker News",
  "text": "Hacker News new | past | comments | ask | show | jobs | submit 1. Show HN: I built...",
  "links": [
    { "text": "new", "href": "https://news.ycombinator.com/newest" },
    { "text": "past", "href": "https://news.ycombinator.com/front" },
    { "text": "Show HN: I built...", "href": "https://news.ycombinator.com/item?id=123" }
  ],
  "images": []
}
```

### Scoped Scrape

```json
{
  "url": "https://example.com/article",
  "title": "Article Title",
  "selector": "article.main-content",
  "text": "This is the main article content...",
  "html": "<p>This is the main article content...</p>",
  "links": [
    { "text": "Related Article", "href": "https://example.com/related" }
  ],
  "images": [
    { "alt": "Article hero image", "src": "https://example.com/hero.jpg" }
  ]
}
```

### Execute Script Result

```json
[
  { "level": "H1", "text": "Main Title" },
  { "level": "H2", "text": "Introduction" },
  { "level": "H2", "text": "Main Content" },
  { "level": "H3", "text": "Subsection 1" }
]
```

## Best Practices for Users

1. **Use specific selectors** when possible to reduce noise
2. **Navigate first** before scraping to ensure correct page
3. **Take screenshots** to verify what the scraper sees
4. **Use execute_script** for complex or dynamic content
5. **Respect rate limits** even on generic pages
6. **Check page state** with `get_page_info` before scraping

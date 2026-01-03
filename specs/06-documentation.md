# Documentation Specification

## Overview

Documentation for Session Scraper MCP, covering user guides, API reference, and examples.

## Documentation Structure

```
docs/
├── index.md                    # Landing page / overview
├── getting-started.md          # Quick start guide
├── installation.md             # Detailed installation
├── tools/
│   ├── twitter.md              # Twitter tools reference
│   ├── linkedin.md             # LinkedIn tools reference
│   ├── browser.md              # Browser tools reference
│   └── generic.md              # Generic scraping tools
├── guides/
│   ├── scraping-twitter.md     # Twitter use cases
│   ├── scraping-linkedin.md    # LinkedIn use cases
│   └── custom-scripts.md       # Advanced execute_script
├── troubleshooting.md          # Common issues
├── faq.md                      # Frequently asked questions
└── changelog.md                # Version history
```

## Document Templates

### index.md (Landing Page)

```markdown
# Session Scraper MCP

Scrape "uncrawlable" sites using your existing browser session.

## What It Does

- **Twitter/X**: Profiles, timelines, posts, search
- **LinkedIn**: Profiles, posts, people search
- **Any site**: Generic scraping with your logged-in session

## Why Use This?

| Traditional Scraping | Session Scraper |
|---------------------|-----------------|
| API costs ($100-5000/mo) | Free |
| Rate limited | Normal user limits |
| Bot detection | Uses your real session |
| Limited data | See everything you can see |

## Quick Start

1. Install [Playwriter extension](link)
2. Add to Claude Code config
3. Click extension on tabs you want to scrape
4. Ask Claude to scrape!

[Get Started →](getting-started.md)
```

### getting-started.md

```markdown
# Getting Started

Get up and running in 5 minutes.

## Prerequisites

- Chrome browser
- Claude Code (or any MCP client)

## Step 1: Install Playwriter Extension

[Install from Chrome Web Store](link)

After installing:
1. Pin the extension to your toolbar
2. Navigate to Twitter or LinkedIn
3. Click the extension icon (turns green when connected)

## Step 2: Configure Claude Code

Add to `~/.claude/settings.json`:

\`\`\`json
{
  "mcpServers": {
    "session-scraper": {
      "command": "npx",
      "args": ["@pepijnsenders/session-scraper-mcp"]
    }
  }
}
\`\`\`

Or install via plugin marketplace:
\`\`\`
/plugin marketplace add PepijnSenders/session-scraper-marketplace
/plugin install session-scraper
\`\`\`

## Step 3: Try It Out

\`\`\`
You: Get Elon Musk's Twitter profile

Claude: [Uses scrape_twitter_profile]
{
  "username": "elonmusk",
  "displayName": "Elon Musk",
  "followersCount": 170000000,
  ...
}
\`\`\`

## Next Steps

- [Twitter scraping guide](guides/scraping-twitter.md)
- [LinkedIn scraping guide](guides/scraping-linkedin.md)
- [All available tools](tools/)
```

### Tool Reference Template (tools/twitter.md)

```markdown
# Twitter Tools

## scrape_twitter_profile

Get a user's profile information.

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| username | string | Yes | Twitter username (without @) |

### Returns

\`\`\`typescript
{
  username: string;
  displayName: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  verified: boolean;
  profileImageUrl: string;
  bannerImageUrl: string;
}
\`\`\`

### Example

\`\`\`
Input: { "username": "elonmusk" }

Output:
{
  "username": "elonmusk",
  "displayName": "Elon Musk",
  "bio": "Mars & Cars, Chips & Dips",
  "followersCount": 170500000,
  ...
}
\`\`\`

### Errors

| Error | Cause | Solution |
|-------|-------|----------|
| User not found | Username doesn't exist | Check spelling |
| Account suspended | User is suspended | N/A |
| Not logged in | Not authenticated | Log into Twitter |

---

## scrape_twitter_timeline

[... same structure for each tool ...]
```

### Guide Template (guides/scraping-twitter.md)

```markdown
# Scraping Twitter

Comprehensive guide to extracting data from Twitter/X.

## Prerequisites

- Logged into Twitter in Chrome
- Playwriter extension enabled on Twitter tab

## Use Cases

### Get a User's Profile

\`\`\`
You: Get the profile info for @naval

Claude: [scrape_twitter_profile: naval]
```

### Get Someone's Recent Tweets

\`\`\`
You: Show me the last 10 tweets from @paulg

Claude: [scrape_twitter_timeline: paulg, count: 10]
\`\`\`

### Search for Tweets

\`\`\`
You: Find tweets about "AI safety" from the last week

Claude: [scrape_twitter_search: "AI safety since:2024-01-10"]
\`\`\`

### Get a Thread

\`\`\`
You: Get this thread: https://x.com/user/status/123456

Claude: [scrape_twitter_post: url]
\`\`\`

## Advanced Queries

Twitter search supports operators:

| Operator | Example | Description |
|----------|---------|-------------|
| from: | from:elonmusk | Tweets from user |
| to: | to:elonmusk | Replies to user |
| filter:media | filter:media | Only with images/video |
| since: | since:2024-01-01 | After date |
| until: | until:2024-01-15 | Before date |
| min_retweets: | min_retweets:100 | Minimum retweets |

## Tips

1. **Start on the right page**: Navigate to Twitter first
2. **Use reasonable counts**: 20-50 tweets per request
3. **Add delays for large scrapes**: Avoid rate limits
4. **Check login status**: Run get_page_info first

## Troubleshooting

**"No pages available"**
→ Click Playwriter extension on Twitter tab

**Empty results**
→ Make sure you're logged in and not rate limited

**Partial data**
→ Some fields may be missing for private/protected accounts
```

### troubleshooting.md

```markdown
# Troubleshooting

Common issues and solutions.

## Connection Issues

### "Extension not connected"

**Cause**: Playwriter extension isn't running or connected.

**Solution**:
1. Install [Playwriter extension](link)
2. Click the extension icon on a tab
3. Icon should turn green
4. Restart Claude Code

### "No pages available"

**Cause**: No browser tabs are enabled for control.

**Solution**:
1. Open a tab (e.g., twitter.com)
2. Click Playwriter extension icon
3. Icon turns green = connected

### "Navigation timeout"

**Cause**: Page is slow or blocked.

**Solutions**:
- Check your internet connection
- Try refreshing the page manually
- Check if the site is down

## Scraping Issues

### Empty or Missing Data

**Causes**:
- Not logged in to the site
- Account is private/protected
- Site structure changed

**Solutions**:
1. Log into the site manually
2. Verify you can see the data in browser
3. Report issue if site structure changed

### Rate Limited

**Symptoms**: Errors mentioning "rate limit" or empty results.

**Solutions**:
- Wait 5-10 minutes
- Reduce request frequency
- Don't scrape too many items at once

### Wrong Page

**Cause**: Scraper is on wrong tab.

**Solution**:
1. Use `list_pages` to see available tabs
2. Use `switch_page` to select correct tab
3. Use `navigate` to go to correct URL

## Site-Specific Issues

### Twitter

| Issue | Solution |
|-------|----------|
| "Must log in" | Log into Twitter in browser |
| Suspended account | Cannot scrape suspended accounts |
| Protected tweets | Only if you follow the account |

### LinkedIn

| Issue | Solution |
|-------|----------|
| "Sign in wall" | Log into LinkedIn, refresh |
| Premium features | Some data requires Premium |
| "Unusual activity" | Wait 10 min, reduce scraping |

## Debug Tips

1. **Take a screenshot**: See what the scraper sees
   ```
   Use take_screenshot
   ```

2. **Check page info**: Verify correct page
   ```
   Use get_page_info
   ```

3. **Manual navigation**: Go to page yourself first
   ```
   Use navigate to https://twitter.com/username
   ```

4. **Check browser**: Sometimes just refreshing helps
```

## Documentation Hosting

### Option 1: GitHub Pages + Markdown

```yaml
# .github/workflows/docs.yml
name: Deploy Docs
on:
  push:
    branches: [main]
    paths: ['docs/**']
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/jekyll-build-pages@v1
        with:
          source: ./docs
      - uses: actions/deploy-pages@v4
```

### Option 2: Docusaurus

```bash
npx create-docusaurus@latest docs classic
```

Then migrate markdown files to `docs/docs/`.

### Option 3: VitePress

```bash
npm add -D vitepress
```

Minimal config, great for technical docs.

## README Requirements

The root README.md should include:

1. **One-line description**: What it does
2. **How it works diagram**: Visual explanation
3. **Quick install**: 3 steps max
4. **Feature list**: Bullet points
5. **Tool reference table**: Quick overview
6. **Link to full docs**: For details

## Changelog Format

```markdown
# Changelog

## [0.2.0] - 2024-02-01

### Added
- LinkedIn company page scraping
- Batch scraping for multiple profiles

### Changed
- Improved Twitter selector stability

### Fixed
- Rate limit detection on LinkedIn

## [0.1.0] - 2024-01-15

### Added
- Initial release
- Twitter profile, timeline, post, search
- LinkedIn profile, posts, search
- Generic page scraping
- Screenshot support
```

## Writing Guidelines

1. **Be concise**: Users want answers, not essays
2. **Show examples**: Code/output examples > descriptions
3. **Use tables**: For parameters, errors, comparisons
4. **Link related docs**: Cross-reference when helpful
5. **Keep updated**: Docs should match current version

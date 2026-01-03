---
name: scrape
description: Scrape social media and web pages using your authenticated browser
---

# Scrape Skill

You can scrape content from Twitter, LinkedIn, and any webpage using the user's authenticated browser session via the `session-scraper` CLI tool.

## Prerequisites

Before using this skill, ensure:

1. **Playwriter extension** is installed in Chrome ([download here](https://github.com/anthropics/playwriter))
2. **Extension enabled** on at least one tab (click the extension icon)
3. **User logged in** to the target platform if scraping authenticated content

If commands fail with connection errors, remind the user to enable Playwriter on a browser tab.

## Available Commands

The `session-scraper` CLI tool provides commands for Twitter, LinkedIn, browser control, and generic page scraping.

### Twitter Commands

```bash
# Get user profile information
session-scraper twitter profile <username>

# Get tweets from a user's timeline (or home feed if username omitted)
session-scraper twitter timeline [username] [--count N]

# Get a single tweet with thread context and replies
session-scraper twitter post <url>

# Search tweets (supports Twitter search operators)
session-scraper twitter search <query> [--count N]
```

**Examples:**
```bash
session-scraper twitter profile elonmusk
session-scraper twitter timeline anthroploic --count 50
session-scraper twitter post "https://x.com/elonmusk/status/123456"
session-scraper twitter search "from:anthroploic AI agents" --count 20
```

### LinkedIn Commands

```bash
# Get profile information
session-scraper linkedin profile <url>

# Get posts from a profile
session-scraper linkedin posts <url> [--count N]

# Search LinkedIn
session-scraper linkedin search <query> [--type people|posts|companies] [--count N]
```

**Examples:**
```bash
session-scraper linkedin profile "https://linkedin.com/in/satyanadella"
session-scraper linkedin posts "https://linkedin.com/in/satyanadella" --count 10
session-scraper linkedin search "AI engineer" --type people --count 20
```

### Browser Control Commands

```bash
# Navigate to a URL
session-scraper browser navigate <url>

# Take a screenshot
session-scraper browser screenshot [--full-page] [--output file.png]

# Get current page info
session-scraper browser info

# List all controlled tabs
session-scraper browser list

# Switch to a different tab
session-scraper browser switch <index>
```

**Examples:**
```bash
session-scraper browser navigate "https://news.ycombinator.com"
session-scraper browser screenshot --full-page --output screenshot.png
session-scraper browser list
session-scraper browser switch 1
```

### Page Extraction Commands

```bash
# Extract content from current page
session-scraper page scrape [--selector <css>]

# Execute JavaScript on the page
session-scraper page script <javascript>
```

**Examples:**
```bash
session-scraper page scrape
session-scraper page scrape --selector "article.main"
session-scraper page script "return document.title"
session-scraper page script "return [...document.querySelectorAll('h2')].map(h => h.textContent)"
```

## Interpretation Guide

When the user makes scraping requests, interpret their intent and invoke the appropriate CLI command:

| User Request | Interpret As | CLI Command |
|--------------|--------------|-------------|
| "scrape @elonmusk" or "get elonmusk's twitter" | Twitter profile | `session-scraper twitter profile elonmusk` |
| "get elon's latest tweets" or "show recent tweets from @elonmusk" | Twitter timeline | `session-scraper twitter timeline elonmusk --count 20` |
| "search twitter for AI news" | Twitter search | `session-scraper twitter search "AI news"` |
| "get this tweet" + URL | Single tweet | `session-scraper twitter post "<url>"` |
| "scrape linkedin.com/in/someone" | LinkedIn profile | `session-scraper linkedin profile "https://linkedin.com/in/someone"` |
| "get posts from <LinkedIn URL>" | LinkedIn posts | `session-scraper linkedin posts "<url>"` |
| "search linkedin for engineers" | LinkedIn search | `session-scraper linkedin search "engineers" --type people` |
| "get this page" or "scrape current page" | Generic page scrape | `session-scraper page scrape` |
| "take a screenshot" | Screenshot | `session-scraper browser screenshot` |
| "go to example.com" | Navigate | `session-scraper browser navigate "https://example.com"` |
| "run this javascript: ..." | Execute script | `session-scraper page script "..."` |

### Handling Ambiguous Requests

If the user's request is ambiguous (e.g., just a name without platform), ask for clarification:

**Example:**
```
User: "scrape satyanadella"
You: "Would you like me to scrape Satya Nadella's Twitter profile or LinkedIn profile?"
```

### Twitter Username Normalization

- When users provide Twitter handles with `@`, remove it for the command
- Example: `@elonmusk` → `elonmusk`

### Count/Limit Handling

- Parse natural language counts: "last 50 tweets" → `--count 50`
- Default to reasonable counts if not specified (20 for Twitter, 10 for LinkedIn)
- Maximum limits: Twitter (100), LinkedIn (50)

### URL Handling

- For LinkedIn, always use the full URL provided by the user
- For Twitter posts, extract the full tweet URL
- Ensure URLs are properly quoted in commands

## Output Format

All commands output JSON to stdout by default. You can:
- Parse the JSON and present information to the user in a readable format
- Use `--format text` for human-readable output (though JSON is more reliable)
- Extract specific fields as needed for the user's request

## Error Handling

The CLI uses exit codes to indicate different error types:

| Exit Code | Meaning | What to Tell User |
|-----------|---------|-------------------|
| 0 | Success | N/A |
| 1 | General error | Check the error message in stderr |
| 2 | Connection error | "Make sure the Playwriter extension is running. Click the extension icon on a Chrome tab." |
| 3 | No pages available | "Open at least one tab in Chrome and enable Playwriter on it." |
| 4 | Navigation timeout | "The page took too long to load. Try again or increase timeout with --timeout." |
| 5 | Element not found | "Could not find expected content. The page structure may have changed." |
| 6 | Rate limited | "Rate limit exceeded. Wait a few minutes before trying again." |
| 7 | Login required | "You need to be logged in. Open the platform in your browser and log in first." |
| 8 | Profile/page not found | "The requested profile or page does not exist." |

Errors are output as JSON to stderr with this format:
```json
{
  "error": "Error message",
  "code": 2,
  "hint": "Helpful recovery suggestion"
}
```

When a command fails, check the exit code and provide appropriate guidance to the user.

## Global Options

All commands support these global options:

- `--format <json|text>` - Output format (default: json)
- `--quiet` - Suppress status messages
- `--timeout <ms>` - Navigation timeout in milliseconds (default: 30000)

## Best Practices

1. **Always check exit codes** - Use the exit code to provide helpful error messages
2. **Parse JSON output** - The JSON output is structured and reliable
3. **Handle rate limits gracefully** - If rate limited, inform the user to wait
4. **Validate URLs** - Ensure LinkedIn URLs are complete and Twitter post URLs are valid
5. **Respect platform limits** - Don't request more items than the platform allows
6. **Be patient with navigation** - Pages may take time to load, especially on slow connections
7. **Present data clearly** - Parse the JSON and present it in a user-friendly format

## Common Patterns

### Getting a Twitter Profile

```bash
session-scraper twitter profile elonmusk
```

Then parse the JSON and present key information:
- Display name and handle
- Bio
- Follower/following counts
- Join date
- Verification status

### Searching and Filtering

Use Twitter search operators for advanced queries:
```bash
session-scraper twitter search "from:anthroploic AI since:2024-01-01" --count 50
```

### Multi-Step Workflows

1. Navigate to a page
2. Wait for content to load
3. Scrape content or take screenshot
4. Switch to another tab if needed

### Custom Extraction

For pages without specific scrapers, use JavaScript execution:
```bash
session-scraper page script "return Array.from(document.querySelectorAll('.post')).map(p => ({
  title: p.querySelector('.title')?.textContent,
  author: p.querySelector('.author')?.textContent,
  link: p.querySelector('a')?.href
}))"
```

## Limitations

- **Authentication required** - User must be logged in to their browser
- **Single session** - Can only use one browser profile at a time
- **Rate limits** - Subject to platform rate limits
- **Dynamic content** - Some dynamically loaded content may require custom scripts
- **Local only** - Playwriter runs on localhost, not accessible remotely

## Security Notes

- All scraping happens locally through the user's browser
- No credentials are stored or transmitted
- User has full visibility into what's being scraped
- Chrome shows "controlled by automation" banner when Playwriter is active

## Examples in Context

### Example 1: Analyzing a Twitter Profile
```
User: "Can you get information about @paulg's Twitter account?"

You: I'll scrape Paul Graham's Twitter profile for you.
[Run: session-scraper twitter profile paulg]
[Parse JSON and present:]

Here's information about @paulg (Paul Graham):
- Display Name: Paul Graham
- Bio: Co-founder of Y Combinator. Wrote 'Hackers & Painters'
- Followers: 2.5M
- Following: 500
- Joined: March 2007
- Verified: Yes
```

### Example 2: Searching LinkedIn
```
User: "Find senior AI engineers on LinkedIn"

You: I'll search LinkedIn for senior AI engineers.
[Run: session-scraper linkedin search "senior AI engineer" --type people --count 20]
[Parse JSON and present top results with names, headlines, and profile URLs]
```

### Example 3: Scraping a Custom Page
```
User: "Get all the article titles from Hacker News"

You: I'll navigate to Hacker News and extract the article titles.
[Run: session-scraper browser navigate "https://news.ycombinator.com"]
[Run: session-scraper page script "return [...document.querySelectorAll('.titleline > a')].map(a => ({ title: a.textContent, url: a.href }))"]
[Parse JSON and present the articles]
```

## Troubleshooting

### "Extension not connected" error
- Tell user: "The Playwriter extension isn't running. Please click the Playwriter extension icon in Chrome to enable it on a tab."

### "No pages available" error
- Tell user: "No browser tabs are available. Please open a tab in Chrome and click the Playwriter extension icon."

### "Login required" error
- Tell user: "You need to be logged in to [platform]. Please open [platform] in your browser and log in, then try again."

### "Rate limited" error
- Tell user: "You've hit the rate limit. Please wait a few minutes before trying again."

### Timeout errors
- Tell user: "The page took too long to load. Try again, or I can increase the timeout using --timeout 60000 for a 60 second timeout."

## Installation Note

This skill requires the `session-scraper` CLI tool to be installed. If it's not available, the user should install it with:

```bash
npm install -g @pep/session-scraper
```

Or run it directly with:

```bash
npx @pep/session-scraper [command]
```

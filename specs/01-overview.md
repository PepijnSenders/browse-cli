# Session Scraper MCP - Overview

## Problem Statement

Many valuable websites are "uncrawlable" through traditional means:
- **Twitter/X**: Requires authentication, aggressive bot detection
- **LinkedIn**: Requires login, blocks scraping tools
- **Instagram**: Authentication walls, fingerprinting
- **Paywalled sites**: Subscription required

Existing solutions have limitations:
- **Official APIs**: Expensive ($100-5000/month), rate limited, incomplete data
- **Headless browsers**: Detected and blocked
- **Proxy services**: Expensive, unreliable

## Solution

Use the user's **existing browser session** to scrape data. The user is already logged in, has passed CAPTCHAs, and appears as a legitimate user.

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S CHROME                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Tab 1      │  │  Tab 2      │  │  Tab 3      │             │
│  │  (Twitter)  │  │  (LinkedIn) │  │  (Other)    │             │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘             │
│         │                │                                      │
│         └────────┬───────┘                                      │
│                  │                                              │
│         ┌───────▼────────┐                                     │
│         │   Playwriter   │  Chrome Extension                    │
│         │   Extension    │  (enables tab control)               │
│         └───────┬────────┘                                     │
└─────────────────┼───────────────────────────────────────────────┘
                  │ WebSocket (localhost:19988)
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│                 │          LOCAL MACHINE                        │
│         ┌───────▼────────┐                                     │
│         │   Playwriter   │  CDP Relay Server                    │
│         │   Relay        │  (bridges extension ↔ playwright)    │
│         └───────┬────────┘                                     │
│                 │                                               │
│         ┌───────▼────────┐                                     │
│         │  Session       │  MCP Server                          │
│         │  Scraper MCP   │  (this project)                      │
│         └───────┬────────┘                                     │
│                 │                                               │
└─────────────────┼───────────────────────────────────────────────┘
                  │ stdio (MCP protocol)
                  │
┌─────────────────┼───────────────────────────────────────────────┐
│         ┌───────▼────────┐                                     │
│         │  Claude Code   │  MCP Client                          │
│         │  / AI Agent    │                                      │
│         └────────────────┘                                     │
└─────────────────────────────────────────────────────────────────┘
```

## Key Benefits

1. **No API costs** - Uses your existing logins
2. **No rate limits** - You're a normal user
3. **No bot detection** - Real browser, real session
4. **Full data access** - See everything you can see in the browser
5. **Works anywhere** - Any site you're logged into

## Dependencies

### Required
- **playwriter** (npm) - Provides CDP relay server and browser connection
- **playwright-core** (npm) - Browser automation API
- **@modelcontextprotocol/sdk** (npm) - MCP server framework

### User Requirements
- Chrome browser with [Playwriter extension](https://chromewebstore.google.com/detail/playwriter-mcp/jfeammnjpkecdekppnclgkkffahnhfhe) installed
- Click extension icon on tabs you want to control (icon turns green)

## Project Structure

```
src/
├── index.ts              # MCP server entry point
├── browser.ts            # Browser connection management
├── tools/
│   └── index.ts          # Tool definitions (MCP schema)
└── scrapers/
    ├── twitter.ts        # Twitter/X extraction logic
    ├── linkedin.ts       # LinkedIn extraction logic
    └── generic.ts        # Generic page scraping
```

## Security Considerations

1. **Local only** - All communication is localhost, no remote access
2. **User-controlled** - Only tabs where user clicked extension are accessible
3. **Visible automation** - Chrome shows banner on controlled tabs
4. **No credential storage** - Uses existing browser sessions

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PLAYWRITER_HOST` | Relay server host | `127.0.0.1` |
| `PLAYWRITER_PORT` | Relay server port | `19988` |
| `PLAYWRITER_AUTO_ENABLE` | Auto-create tab on connect | `false` |

### MCP Client Configuration

```json
{
  "mcpServers": {
    "session-scraper": {
      "command": "npx",
      "args": ["@pepijnsenders/session-scraper-mcp"]
    }
  }
}
```

## Error Handling Strategy

| Error | Cause | Recovery |
|-------|-------|----------|
| "Extension not connected" | Playwriter extension not running | User: click extension icon |
| "No pages available" | No tabs enabled for control | User: click extension on a tab |
| "Element not found" | Page structure changed | Retry with updated selectors |
| "Navigation timeout" | Slow network / blocked | Increase timeout or manual nav |

## Future Extensions

1. **More scrapers**: Instagram, Reddit, Facebook, TikTok
2. **Action tools**: Post, like, follow (not just read)
3. **Batch operations**: Scrape multiple profiles in one call
4. **Caching**: Avoid re-scraping recently fetched data
5. **Export formats**: CSV, JSON, Markdown

# Session Scraper MCP

**MCP server for scraping "uncrawlable" sites using your existing browser session**

Scrape Twitter, LinkedIn, and other sites that block traditional scrapers - using your own logged-in browser session.

## How It Works

```
Your Chrome Browser (logged into Twitter, LinkedIn, etc.)
         │
         ▼
   Playwriter Extension (enables tab control)
         │
         ▼
   Session Scraper MCP (this project)
         │
         ▼
   Claude Code / AI Agent
```

No API keys. No rate limits. No bot detection. Just your normal browser session.

## Features

- **Twitter/X** - Profiles, timelines, posts, search
- **LinkedIn** - Profiles, posts, people search
- **Any site** - Generic scraping, screenshots, custom scripts
- **Your session** - Uses your existing logins, no credentials needed

## Installation

### 1. Install Playwriter Extension

[Install from Chrome Web Store](https://chromewebstore.google.com/detail/playwriter-mcp/jfeammnjpkecdekppnclgkkffahnhfhe)

### 2. Add to MCP Client

Add to your Claude Code or MCP client config:

```json
{
  "mcpServers": {
    "session-scraper": {
      "command": "npx",
      "args": ["@pep/session-scraper-mcp"]
    }
  }
}
```

### 3. Enable on Tabs

Click the Playwriter extension icon on tabs you want to control (icon turns green).

## Tools

### Twitter/X

| Tool | Description |
|------|-------------|
| `scrape_twitter_profile` | Get user profile info |
| `scrape_twitter_timeline` | Get tweets from user/home |
| `scrape_twitter_post` | Get single tweet + thread |
| `scrape_twitter_search` | Search tweets |

### LinkedIn

| Tool | Description |
|------|-------------|
| `scrape_linkedin_profile` | Get profile info |
| `scrape_linkedin_posts` | Get user's posts |
| `scrape_linkedin_search` | Search people/companies |

### Browser

| Tool | Description |
|------|-------------|
| `navigate` | Go to URL |
| `take_screenshot` | Screenshot page |
| `get_page_info` | Get current URL/title |
| `list_pages` | List controlled tabs |
| `switch_page` | Switch active tab |

### Generic

| Tool | Description |
|------|-------------|
| `scrape_page` | Extract text/links/images |
| `execute_script` | Run custom JavaScript |

## Example Usage

```
You: Scrape Elon Musk's Twitter profile

Claude: [Uses scrape_twitter_profile with username "elonmusk"]

Result:
{
  "username": "elonmusk",
  "displayName": "Elon Musk",
  "bio": "Mars & Cars, Chips & Dips",
  "followersCount": 170500000,
  "followingCount": 512,
  ...
}
```

## Requirements

- Chrome browser
- [Playwriter extension](https://chromewebstore.google.com/detail/playwriter-mcp/jfeammnjpkecdekppnclgkkffahnhfhe)
- Logged into the sites you want to scrape

## Specs

See `/specs` for detailed specifications:

- [Overview & Architecture](specs/01-overview.md)
- [MCP Tools](specs/02-mcp-tools.md)
- [Twitter Scraper](specs/03-twitter-scraper.md)
- [LinkedIn Scraper](specs/04-linkedin-scraper.md)
- [Generic Scraper](specs/05-generic-scraper.md)

## Development

```bash
bun install
bun run dev
```

## License

MIT

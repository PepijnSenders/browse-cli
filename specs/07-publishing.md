# Publishing Specification

## Overview

Distribution strategy for Session Scraper MCP via:
1. **npm** - For direct MCP client configuration
2. **Claude Code Plugin Marketplace** - For easy installation in Claude Code

## Distribution Channels

| Channel | Use Case | Command |
|---------|----------|---------|
| npm | Any MCP client | `npx @pepijnsenders/session-scraper-mcp` |
| Plugin Marketplace | Claude Code users | `/plugin install session-scraper` |
| GitHub Releases | Direct download | Download from releases page |

---

## npm Publishing

### Package Configuration

```json
{
  "name": "@pepijnsenders/session-scraper-mcp",
  "version": "0.1.0",
  "description": "MCP server for scraping sites using your existing browser session",
  "main": "dist/index.js",
  "bin": {
    "session-scraper-mcp": "./dist/index.js"
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "publishConfig": {
    "access": "public"
  }
}
```

### Build for npm

```bash
# Build for Node.js target
bun build src/index.ts --outdir dist --target node --minify

# Ensure shebang is present
echo '#!/usr/bin/env node' | cat - dist/index.js > temp && mv temp dist/index.js
```

### Publish Workflow

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - run: bun install
      - run: bun test
      - run: bun run build

      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Claude Code Plugin Marketplace

### Plugin Structure

```
session-scraper-plugin/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── .mcp.json                 # MCP server configuration
├── skills/
│   └── session-scraper.md    # Skill instructions
├── README.md
└── LICENSE
```

### Plugin Manifest

`.claude-plugin/plugin.json`:

```json
{
  "name": "session-scraper",
  "version": "0.1.0",
  "description": "Scrape Twitter, LinkedIn, and other sites using your browser session",
  "author": {
    "name": "PepijnSenders",
    "email": "pepijn@example.com"
  },
  "repository": "https://github.com/PepijnSenders/session-scraper-plugin",
  "homepage": "https://github.com/PepijnSenders/x-cli",
  "license": "MIT",
  "keywords": [
    "mcp",
    "scraper",
    "twitter",
    "linkedin",
    "browser",
    "playwright",
    "playwriter"
  ]
}
```

### MCP Configuration

`.mcp.json`:

```json
{
  "mcpServers": {
    "session-scraper": {
      "command": "npx",
      "args": ["@pepijnsenders/session-scraper-mcp"],
      "env": {
        "PLAYWRITER_AUTO_ENABLE": "${PLAYWRITER_AUTO_ENABLE:-}"
      }
    }
  }
}
```

### Skill Instructions

`skills/session-scraper.md`:

```markdown
---
name: session-scraper
description: Use this skill to scrape Twitter, LinkedIn, and other sites using the user's browser session
---

# Session Scraper

This skill provides tools for scraping websites that normally block automated access, by using the user's logged-in browser session via the Playwriter extension.

## Prerequisites

Before using these tools, the user must:
1. Have the Playwriter Chrome extension installed
2. Have clicked the extension icon on the tab they want to scrape (icon turns green)
3. Be logged into the site they want to scrape

## Available Tools

### Twitter/X
- `scrape_twitter_profile` - Get user profile (username required)
- `scrape_twitter_timeline` - Get tweets (optional username for user timeline, omit for home)
- `scrape_twitter_post` - Get single tweet + thread (url required)
- `scrape_twitter_search` - Search tweets (query required)

### LinkedIn
- `scrape_linkedin_profile` - Get profile (url required)
- `scrape_linkedin_posts` - Get user's posts (url required)
- `scrape_linkedin_search` - Search people/companies (query required, type optional)

### Browser Control
- `navigate` - Go to URL
- `take_screenshot` - Screenshot current page
- `get_page_info` - Get current URL and title
- `list_pages` - List all controlled tabs
- `switch_page` - Switch to different tab

### Generic Scraping
- `scrape_page` - Extract text/links/images (optional selector)
- `execute_script` - Run custom JavaScript

## Usage Tips

1. Always check if extension is connected first (use `get_page_info`)
2. Navigate to the correct page before scraping
3. Use reasonable counts (20-50 items) to avoid rate limits
4. Take screenshots to debug if data looks wrong

## Common Issues

- "No pages available" → User needs to click extension icon on a tab
- "Extension not connected" → Playwriter extension not running
- Empty data → User may not be logged in to the site
```

---

## Marketplace Repository

### Structure

Create a separate repository for the marketplace:

```
session-scraper-marketplace/
├── .claude-plugin/
│   └── marketplace.json      # Marketplace catalog
├── plugins/
│   └── session-scraper/      # The plugin (copy or submodule)
│       ├── .claude-plugin/
│       │   └── plugin.json
│       ├── .mcp.json
│       ├── skills/
│       │   └── session-scraper.md
│       └── README.md
└── README.md                 # Marketplace overview
```

### Marketplace Manifest

`.claude-plugin/marketplace.json`:

```json
{
  "name": "session-scraper-marketplace",
  "owner": {
    "name": "PepijnSenders",
    "email": "pepijn@example.com"
  },
  "plugins": [
    {
      "name": "session-scraper",
      "source": "./plugins/session-scraper",
      "description": "Scrape Twitter, LinkedIn, and other sites using your browser session",
      "version": "0.1.0",
      "author": {
        "name": "PepijnSenders"
      },
      "homepage": "https://github.com/PepijnSenders/x-cli",
      "repository": "https://github.com/PepijnSenders/session-scraper-plugin",
      "license": "MIT",
      "keywords": ["mcp", "scraper", "twitter", "linkedin", "browser"]
    }
  ]
}
```

---

## Installation Instructions for Users

### Option 1: Plugin Marketplace (Recommended)

```bash
# Add the marketplace
/plugin marketplace add PepijnSenders/session-scraper-marketplace

# Install the plugin
/plugin install session-scraper

# Restart Claude Code to load MCP server
```

### Option 2: Direct MCP Configuration

Add to `~/.claude/settings.json`:

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

### Option 3: Manual Plugin Install

```bash
# Clone plugin directly
/plugin install https://github.com/PepijnSenders/session-scraper-plugin
```

---

## Version Management

### Versioning Strategy

Use semantic versioning:
- **MAJOR**: Breaking changes to tool interfaces
- **MINOR**: New tools or features
- **PATCH**: Bug fixes, selector updates

### Release Checklist

1. Update version in:
   - `package.json`
   - `.claude-plugin/plugin.json`
   - `marketplace.json`

2. Update `CHANGELOG.md`

3. Run tests:
   ```bash
   bun test
   ```

4. Test plugin locally:
   ```bash
   claude --plugin-dir ./session-scraper-plugin
   ```

5. Create GitHub release:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

6. npm publishes automatically via GitHub Actions

7. Update marketplace repository:
   ```bash
   cd session-scraper-marketplace
   # Update plugin version
   git commit -am "Release v0.1.0"
   git push
   ```

---

## Repository Setup

### Main Repository (x-cli → session-scraper-mcp)

```
x-cli/
├── src/                      # MCP server source
├── specs/                    # Specifications
├── docs/                     # Documentation
├── package.json              # npm package
├── .github/
│   └── workflows/
│       ├── ci.yml            # Test on PR
│       └── publish.yml       # Publish to npm on release
└── README.md
```

### Plugin Repository (session-scraper-plugin)

```
session-scraper-plugin/
├── .claude-plugin/
│   └── plugin.json
├── .mcp.json
├── skills/
│   └── session-scraper.md
├── README.md
└── LICENSE
```

### Marketplace Repository (session-scraper-marketplace)

```
session-scraper-marketplace/
├── .claude-plugin/
│   └── marketplace.json
├── plugins/
│   └── session-scraper/      # Git submodule or copy
├── README.md
└── LICENSE
```

---

## GitHub Actions

### CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: bun run typecheck
      - run: bun test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2

      - run: bun install
      - run: bun run build

      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```

### Plugin Sync Workflow

For marketplace repository, sync plugin updates:

```yaml
# .github/workflows/sync-plugin.yml
name: Sync Plugin

on:
  repository_dispatch:
    types: [plugin-updated]
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive

      - name: Update submodule
        run: |
          cd plugins/session-scraper
          git pull origin main

      - name: Commit changes
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add -A
          git commit -m "Sync plugin to latest version" || exit 0
          git push
```

---

## Testing Before Publish

### Local Plugin Testing

```bash
# Test with Claude Code
claude --plugin-dir ./session-scraper-plugin

# Verify MCP server loads
# Check that tools appear in Claude's toolkit
```

### Marketplace Testing

```bash
# In Claude Code
/plugin marketplace add ./session-scraper-marketplace
/plugin install session-scraper@session-scraper-marketplace

# Verify installation
/plugin list
```

### Validation

```bash
# Validate plugin structure
claude plugin validate ./session-scraper-plugin

# Or in Claude Code
/plugin validate ./session-scraper-plugin
```

---

## Promotion Strategy

### 1. Claude Code Community

- Post in Claude Code Discord/forums
- Share on relevant subreddits (r/ClaudeAI, etc.)

### 2. Developer Communities

- Dev.to / Hashnode article: "Scraping Twitter Without API Keys"
- Hacker News: Show HN post
- Product Hunt launch

### 3. Social Media

- Twitter thread explaining the tool
- LinkedIn post for professional audience

### 4. Documentation SEO

- Host docs on custom domain or GitHub Pages
- Target keywords: "scrape twitter without api", "linkedin scraper mcp"

# Phase 10: README

## Objectives

- Clear, scannable documentation
- Quick start in < 30 seconds
- Visual appeal with badges and demos
- Complete command reference

## README Structure

```
README.md
├── Header (logo, badges, tagline)
├── Features (bullet list)
├── Demo (terminal GIF)
├── Installation
├── Quick Start
├── Commands (collapsible reference)
├── Configuration
├── Grok AI
├── Shell Completions
├── Contributing
└── License
```

## Header Section

```markdown
<div align="center">

# X CLI

**Fast, type-safe CLI for X (Twitter)**

[![CI](https://github.com/YOUR_USERNAME/x-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/x-cli/actions)
[![npm](https://img.shields.io/npm/v/x-cli)](https://www.npmjs.com/package/x-cli)
[![License](https://img.shields.io/github/license/YOUR_USERNAME/x-cli)](LICENSE)

[Installation](#installation) · [Quick Start](#quick-start) · [Commands](#commands) · [Website](https://YOUR_USERNAME.github.io/x-cli)

</div>
```

## Features Section

```markdown
## Features

- **Full X API v2** — Posts, timelines, users, lists, DMs, spaces
- **OAuth 2.0 PKCE** — Secure authentication, no API keys exposed
- **Grok AI** — Summarize threads, analyze content, draft replies
- **Type-safe** — Zod validation on all API responses
- **Beautiful output** — Pretty terminal formatting or JSON for pipes
- **Interactive mode** — REPL with history and tab completion
- **Shell completions** — Bash, Zsh, Fish support
```

## Demo Section

```markdown
## Demo

<img src="./docs/demo.gif" width="600" alt="x-cli demo">

<!-- Alternative: ASCII cinema embed -->
[![asciicast](https://asciinema.org/a/XXXXX.svg)](https://asciinema.org/a/XXXXX)
```

### Demo Recording Script

```bash
# Record with asciinema
asciinema rec demo.cast

# In recording:
x auth status
x timeline home --limit 3
x post create "Hello from x-cli!"
x grok "summarize @elonmusk's latest posts"

# Convert to GIF
agg demo.cast demo.gif --theme monokai --font-size 14
```

## Installation Section

```markdown
## Installation

### Homebrew (macOS/Linux)

```bash
brew tap YOUR_USERNAME/x-cli
brew install x-cli
```

### npm

```bash
npm install -g x-cli
```

### Binary Download

Download from [Releases](https://github.com/YOUR_USERNAME/x-cli/releases):

| Platform | Download |
|----------|----------|
| macOS (Apple Silicon) | [x-cli-darwin-arm64.tar.gz](https://github.com/YOUR_USERNAME/x-cli/releases/latest/download/x-cli-darwin-arm64.tar.gz) |
| macOS (Intel) | [x-cli-darwin-x64.tar.gz](https://github.com/YOUR_USERNAME/x-cli/releases/latest/download/x-cli-darwin-x64.tar.gz) |
| Linux | [x-cli-linux-x64.tar.gz](https://github.com/YOUR_USERNAME/x-cli/releases/latest/download/x-cli-linux-x64.tar.gz) |
| Windows | [x-cli-win-x64.zip](https://github.com/YOUR_USERNAME/x-cli/releases/latest/download/x-cli-win-x64.zip) |

### From Source

```bash
git clone https://github.com/YOUR_USERNAME/x-cli
cd x-cli
bun install
bun run build
```
```

## Quick Start Section

```markdown
## Quick Start

```bash
# Authenticate
x auth login

# Post something
x post create "Hello, X!"

# View your timeline
x timeline home

# Search posts
x search "from:elonmusk AI"

# Get user info
x user elonmusk

# Ask Grok
x grok "summarize the latest tech news"
```
```

## Commands Section

```markdown
## Commands

<details>
<summary><strong>Authentication</strong></summary>

```bash
x auth login          # Start OAuth flow
x auth logout         # Clear credentials
x auth status         # Show current user
```

</details>

<details>
<summary><strong>Posts</strong></summary>

```bash
x post create <text>           # Create a post
x post create -m image.jpg     # Post with media
x post get <id>                # Get post by ID
x post delete <id>             # Delete your post
x post reply <id> <text>       # Reply to a post
```

</details>

<details>
<summary><strong>Timelines</strong></summary>

```bash
x timeline home                # Home timeline
x timeline user <username>     # User's posts
x timeline mentions            # Your mentions
x timeline --limit 50          # Custom limit
```

</details>

<details>
<summary><strong>Search</strong></summary>

```bash
x search <query>               # Search posts
x search "from:user keyword"   # Advanced search
x search --recent              # Recent only
```

</details>

<details>
<summary><strong>Engagement</strong></summary>

```bash
x like <id>                    # Like a post
x unlike <id>                  # Unlike
x repost <id>                  # Repost
x bookmark <id>                # Bookmark
x bookmarks                    # View bookmarks
```

</details>

<details>
<summary><strong>Users</strong></summary>

```bash
x me                           # Your profile
x user <username>              # User lookup
x follow <username>            # Follow user
x unfollow <username>          # Unfollow
x followers [username]         # List followers
x following [username]         # List following
x block <username>             # Block user
x mute <username>              # Mute user
```

</details>

<details>
<summary><strong>Lists</strong></summary>

```bash
x list create <name>           # Create list
x list <id>                    # List info
x list timeline <id>           # List timeline
x list add <id> <username>     # Add member
x list remove <id> <username>  # Remove member
x list delete <id>             # Delete list
```

</details>

<details>
<summary><strong>Direct Messages</strong></summary>

```bash
x dm list                      # Conversations
x dm view <conv_id>            # View messages
x dm send <user> <text>        # Send DM
```

</details>

<details>
<summary><strong>Grok AI</strong></summary>

```bash
x grok <prompt>                # Ask anything
x grok summarize @user         # Summarize posts
x grok analyze <id>            # Analyze thread
x grok draft <topic>           # Draft a post
x grok reply <id>              # Suggest reply
```

</details>

<details>
<summary><strong>Other</strong></summary>

```bash
x space <id>                   # Space info
x media upload <file>          # Upload media
x config set <key> <value>     # Set config
x config list                  # Show config
x -i                           # Interactive mode
```

</details>
```

## Configuration Section

```markdown
## Configuration

```bash
# Set defaults
x config set default_output json
x config set default_limit 50

# View config
x config list
```

### Environment Variables

```bash
# Required for Grok features
export XAI_API_KEY=your_grok_api_key
```

### Config File

Located at `~/.config/x-cli/config.json`

```json
{
  "default_output": "pretty",
  "default_limit": 20
}
```
```

## Grok Section

```markdown
## Grok AI

Powered by [xAI's Grok](https://x.ai), the CLI includes AI features:

```bash
# Ask anything
x grok "What's happening in tech today?"

# Summarize a user's recent posts
x grok summarize @sama

# Analyze a conversation thread
x grok analyze 1234567890

# Draft a post about a topic
x grok draft "thoughts on AI safety"

# Get a suggested reply
x grok reply 1234567890
```

Requires `XAI_API_KEY` environment variable.
```

## Shell Completions Section

```markdown
## Shell Completions

### Bash

```bash
x completion bash > /etc/bash_completion.d/x
# or
echo 'eval "$(x completion bash)"' >> ~/.bashrc
```

### Zsh

```bash
x completion zsh > ~/.zsh/completions/_x
# or
echo 'eval "$(x completion zsh)"' >> ~/.zshrc
```

### Fish

```bash
x completion fish > ~/.config/fish/completions/x.fish
```
```

## Contributing Section

```markdown
## Contributing

Contributions welcome! Please read our [Contributing Guide](CONTRIBUTING.md).

```bash
# Setup
git clone https://github.com/YOUR_USERNAME/x-cli
cd x-cli
bun install

# Test
bun test

# Lint
bunx 0xc
```
```

## License Section

```markdown
## License

MIT - see [LICENSE](LICENSE)
```

## Supporting Files

### CONTRIBUTING.md

```markdown
# Contributing to X CLI

## Development Setup

1. Fork and clone the repo
2. Install dependencies: `bun install`
3. Run tests: `bun test`

## Pull Requests

1. Create a feature branch
2. Make your changes
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a PR

## Code Style

We use 0xc for linting. Run `bunx 0xc` before committing.

## Commit Messages

Follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation
- `chore:` Maintenance
```

### LICENSE

```
MIT License

Copyright (c) 2025 YOUR_NAME

Permission is hereby granted, free of charge...
```

## Verification Checklist

### Content
- [ ] All commands documented
- [ ] Examples are copy-pasteable
- [ ] Environment variables listed
- [ ] Installation methods complete

### Formatting
- [ ] Badges render correctly
- [ ] Collapsible sections work
- [ ] Code blocks have syntax highlighting
- [ ] Links are valid

### Assets
- [ ] Demo GIF/video created
- [ ] Logo exists (if applicable)
- [ ] Screenshots clear and helpful

### Files
- [ ] README.md complete
- [ ] CONTRIBUTING.md exists
- [ ] LICENSE exists
- [ ] CHANGELOG.md exists

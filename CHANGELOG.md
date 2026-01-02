# Changelog

All notable changes to x-cli will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-03

### Added

#### Core Features
- OAuth 2.0 PKCE authentication with secure token storage (AES-256-GCM)
- Full X API v2 support with Zod validation
- Auto-retry on rate limits (429) with exponential backoff
- Auto-retry on server errors (5xx)

#### Posts & Timelines
- `x post create/get/delete/reply/quote` - Full post management
- `x timeline home/user/mentions` - Timeline viewing with pagination
- `x search` - Search posts with advanced operators
- `x like/unlike/repost/unrepost` - Engagement actions
- `x bookmark add/list/remove` - Bookmark management

#### Users
- `x user <username>` - User lookup
- `x me` - Current user info
- `x follow/unfollow` - Follow management
- `x following/followers` - Relationship lists
- `x block/unblock/blocks` - Block management
- `x mute/unmute/mutes` - Mute management

#### Lists
- `x list create/get/update/delete` - List CRUD
- `x list timeline/members` - List content
- `x list add/remove` - Member management
- `x list follow/unfollow/pin/unpin` - List subscriptions
- `x lists owned/followed/pinned` - List discovery

#### Direct Messages
- `x dm list/view/conversation` - View conversations
- `x dm send` - Send direct messages
- `x dm group` - Create group DMs
- `x dm delete` - Delete messages

#### Spaces
- `x space get/search` - Space lookup and search
- `x spaces <username>` - User's spaces
- `x space buyers` - Ticketed space buyers

#### Media
- `x media upload` - Upload images and videos
- Simple upload for images < 5MB
- Chunked upload for videos/large files
- `x media upload --alt` - Alt text support
- `x media status/wait` - Processing status

#### Grok AI Integration
- `x grok "<query>"` - Natural language command parsing
- `x grok summarize` - Thread and user post summarization
- `x grok analyze` - Sentiment and topic analysis
- `x grok draft` - AI-powered post drafting
- `x grok reply` - Reply suggestions
- `x grok ask` - Ask questions about timeline
- Requires `XAI_API_KEY` environment variable

#### Interactive Mode
- `x -i` / `x --interactive` - REPL mode
- Command history with up arrow
- Tab completion
- Built-in commands: `clear`, `exit`, `history`, `help`

#### Shell Completions
- `x completion bash` - Bash completions
- `x completion zsh` - Zsh completions
- `x completion fish` - Fish completions

#### Configuration
- `x config get/set/list/reset` - Configuration management
- Settings: `default_output`, `default_limit`
- Config stored at `~/.config/x-cli/config.json`

#### Output Options
- `--json` / `-j` - JSON output
- `--quiet` / `-q` - Suppress non-essential output
- `--verbose` / `-v` - Debug information
- `--no-color` - Disable colors

### Technical
- Built with Bun + TypeScript
- Strict mode TypeScript
- Commander.js CLI framework
- Zod schema validation
- Chalk terminal colors
- Ora spinners
- cli-table3 for tables

[Unreleased]: https://github.com/ps/x-cli/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ps/x-cli/releases/tag/v0.1.0

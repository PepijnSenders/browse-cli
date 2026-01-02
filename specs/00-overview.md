# X-CLI Overview

A fast, type-safe CLI for X (Twitter) that feels native to developers.

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Runtime | Bun | Fast, built-in test runner, native TS |
| Package Manager | pnpm | Fast, disk efficient |
| CLI Framework | Commander.js | Battle-tested, good DX |
| Validation | Zod | Type-first, runtime validation |
| HTTP | Built-in fetch | No deps needed |
| OAuth | `arctic` | Generic OAuth 2.0 PKCE, has Twitter provider |
| Output | chalk, ora, cli-table3 | Pretty terminal output |
| Linting | 0xc | Consistent style |
| Testing | Bun test | Built-in, fast |

## Directory Structure

```
x-cli/
├── src/
│   ├── index.ts           # Entry point
│   ├── cli/               # Command definitions
│   ├── api/               # API clients (thin wrappers)
│   ├── types/             # Zod schemas + inferred types
│   ├── output/            # Formatters (json, pretty)
│   └── grok/              # Grok integration
├── tests/
├── specs/
└── package.json
```

## Type-First Approach

1. Define Zod schemas matching X API responses (see `types.md`)
2. Infer TypeScript types from schemas
3. Validate all API responses at runtime
4. Fail fast on unexpected data

## Output Modes

### JSON (default for pipes)
```bash
x timeline home | jq '.data[0].text'
```
Minimal, parseable, no extra fields.

### Pretty (default for TTY)
```
@elonmusk · 2h
The future is exciting

♥ 42K  ↺ 5.2K  💬 1.3K
```

## Global Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--json` | `-j` | Force JSON output |
| `--quiet` | `-q` | Suppress non-essential output |
| `--verbose` | `-v` | Debug information |
| `--no-color` | | Disable colors |

## Environment Variables

```bash
# .env
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_CLIENT_ID=your_oauth_client_id
X_REDIRECT_URI=http://localhost:8765/callback
XAI_API_KEY=your_grok_api_key
```

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Posts (read) | 900/15min |
| Posts (write) | 200/15min |
| Users | 900/15min |
| Timeline | 180/15min |
| Search | 180/15min |
| DMs | 200/15min |

Auto-retry with exponential backoff on 429.

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Not authenticated |
| `AUTH_EXPIRED` | Token expired |
| `RATE_LIMITED` | Rate limit exceeded |
| `NOT_FOUND` | Resource not found |
| `FORBIDDEN` | Action not allowed |
| `VALIDATION` | Invalid input |
| `API_ERROR` | X API error |
| `NETWORK_ERROR` | Connectivity issue |

## Command Reference

```bash
# Auth
x auth login|logout|status

# Posts
x post create|get|delete|reply
x timeline home|user|mentions
x search <query>
x like|unlike|repost|bookmark <id>

# Users
x user <username>
x me
x follow|unfollow|block|mute <username>
x following|followers [user]
x blocks|mutes

# Lists
x list create|update|delete|timeline
x list add|remove|members <id>

# DMs
x dm list|send|view|delete

# Spaces & Media
x space <id>
x media upload <file>

# Grok
x grok <prompt>
x grok summarize|analyze|draft|reply

# Config
x config set|get|list
x -i  # REPL mode
```

## Phases

| Phase | Name | Focus |
|-------|------|-------|
| 1 | Foundation | Auth, client, types, formatters |
| 2 | Posts | CRUD, timelines, search, engagement |
| 3 | Users | Lookup, follow, block, mute |
| 4 | Lists | CRUD, membership |
| 5 | DMs | Conversations, send/receive |
| 6 | Spaces & Media | Lookup, upload |
| 7 | Grok | AI features, natural language |
| 8 | Polish | REPL, completions, 100% coverage |

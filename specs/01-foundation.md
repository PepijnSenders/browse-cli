# Phase 1: Foundation

## Objectives

- Project setup with Bun + pnpm + TypeScript
- OAuth 2.0 PKCE authentication (using `arctic`)
- HTTP client with rate limiting
- Output formatters (JSON, Pretty)
- Token storage
- Error handling framework

## Dependencies

```bash
pnpm add commander chalk ora cli-table3 open arctic zod
pnpm add -D typescript @types/bun
```

Use `arctic` for OAuth - it's a generic OAuth 2.0 library with a built-in Twitter provider that handles PKCE, token refresh, and revocation.

## Auth Commands

```bash
x auth login     # Opens browser for OAuth, stores tokens
x auth logout    # Clears stored tokens
x auth status    # Shows current auth status + user info
x auth refresh   # Force token refresh
```

### Login Flow

1. Generate PKCE code verifier and state (via arctic)
2. Open browser to X authorization URL
3. Local server receives callback on `localhost:8765`
4. Exchange code for tokens
5. Store encrypted tokens in `~/.config/x-cli/tokens.json`
6. Fetch and display authenticated user info

### Status Output

**Pretty:**
```
Logged in as @username
Token expires in 1h 45m
```

**JSON:**
```json
{"authenticated":true,"username":"username","expires_in":6300}
```

## HTTP Client Requirements

- Base URL: `https://api.twitter.com/2`
- Auto-attach Bearer token
- Parse rate limit headers (`x-rate-limit-*`)
- Auto-retry on 429 with exponential backoff
- Auto-retry on 5xx (max 3 attempts)
- Timeout: 30s default
- Validate responses with Zod schemas

## Output Formatters

### JSON Formatter
- Minimal output (no pretty-print whitespace)
- Single line per response
- Errors as `{"error":"message","code":"CODE"}`

### Pretty Formatter
- Colored output with chalk
- Spinners for loading (ora)
- Tables for lists (cli-table3)
- Relative timestamps ("2h ago")
- Number formatting (1.5K, 2.3M)
- Box drawing for cards

## Token Storage

Location: `~/.config/x-cli/`

Files:
- `tokens.json` - Encrypted access/refresh tokens
- `config.json` - User preferences

Token encryption: Use machine-specific key derivation.

## Error Classes

| Class | Code | When |
|-------|------|------|
| `AuthError` | `AUTH_REQUIRED`, `AUTH_EXPIRED` | Not logged in, token expired |
| `RateLimitError` | `RATE_LIMITED` | 429 response |
| `APIError` | `API_ERROR` | X API errors |
| `ValidationError` | `VALIDATION` | Invalid input or response |
| `ConfigError` | `CONFIG_ERROR` | Config file issues |

## Verification Checklist

- [ ] `pnpm install` completes
- [ ] `bun run typecheck` passes
- [ ] `x auth login` opens browser, completes OAuth
- [ ] `x auth status` shows user info
- [ ] `x auth logout` clears tokens
- [ ] `x auth refresh` works
- [ ] Tokens persist across sessions
- [ ] `--json` flag works globally
- [ ] `--no-color` disables colors
- [ ] Rate limit headers are tracked
- [ ] 429 triggers backoff retry
- [ ] 5xx triggers retry

## Test Coverage

- Auth: PKCE generation, token exchange, refresh
- Client: Headers, rate limits, retries, timeouts
- Formatters: JSON output, relative time, number formatting
- Config: Token save/load/clear, encryption

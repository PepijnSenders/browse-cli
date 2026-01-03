---
name: x-cli
description: Use the X (Twitter) CLI to post, read timelines, search, manage users, send DMs, and use Grok AI. Use when working with X/Twitter, posting to social media, checking timelines, or using Grok.
allowed-tools: Bash
---

# X CLI Skill

A fast, type-safe CLI for X (Twitter).

## Prerequisites

Ensure x-cli is installed:
```bash
which x && x --version
```

If not installed, build from source:
```bash
cd /path/to/x-cli && bun install && bun run build
```

## Authentication

Before using, authenticate:
```bash
x auth login
```

Check status:
```bash
x auth status
```

## Core Commands

### Posts
```bash
x post create "Your message here"          # Create post
x post get <id>                            # Get post by ID
x post delete <id>                         # Delete post
x post reply <id> "Reply text"             # Reply to post
x post quote <id> "Quote text"             # Quote post
```

### Timelines
```bash
x timeline home                            # Home timeline
x timeline home --limit 10                 # Limit results
x timeline user <username>                 # User's posts
x timeline mentions                        # Your mentions
```

### Search
```bash
x search "query"                           # Search posts
x search "from:user keyword"               # From specific user
x search "topic" --limit 20                # With limit
```

### Engagement
```bash
x like <id>                                # Like post
x unlike <id>                              # Unlike
x repost <id>                              # Repost
x unrepost <id>                            # Remove repost
x bookmark add <id>                        # Bookmark
x bookmark list                            # View bookmarks
x bookmark remove <id>                     # Remove bookmark
```

### Users
```bash
x me                                       # Your profile
x user <username>                          # User lookup
x follow <username>                        # Follow
x unfollow <username>                      # Unfollow
x followers [username]                     # List followers
x following [username]                     # List following
x block <username>                         # Block user
x unblock <username>                       # Unblock user
x mute <username>                          # Mute user
x unmute <username>                        # Unmute user
```

### Lists
```bash
x list create <name>                       # Create list
x list get <id>                            # List info
x list timeline <id>                       # List timeline
x list members <id>                        # List members
x list add <id> <username>                 # Add member
x list remove <id> <username>              # Remove member
x lists                                    # Your lists
```

### Direct Messages
```bash
x dm list                                  # List conversations
x dm view <username>                       # View conversation
x dm send <username> "message"             # Send DM
x dm group -u user1 -u user2 "message"     # Group DM
```

### Spaces
```bash
x space get <id>                           # Space details
x space search <query>                     # Search spaces
x spaces <username>                        # User's spaces
```

### Media
```bash
x media upload <file>                      # Upload media
x media upload <file> --alt "description"  # With alt text
x media status <id>                        # Check status
```

### Grok AI
```bash
x grok "your question"                     # Ask Grok anything
x grok summarize @username                 # Summarize user's posts
x grok summarize <post_id>                 # Summarize thread
x grok analyze <post_id>                   # Analyze post
x grok draft "topic"                       # Draft a post
x grok draft "topic" --tone professional   # With tone
x grok reply <post_id>                     # Suggest replies
x grok ask "question"                      # Ask about timeline
```

Requires `XAI_API_KEY` environment variable.

### Configuration
```bash
x config list                              # Show config
x config get <key>                         # Get value
x config set <key> <value>                 # Set value
x config reset                             # Reset to defaults
```

### Interactive Mode
```bash
x -i                                       # Start REPL
x --interactive                            # Same
```

## Output Formats

```bash
x timeline home                            # Pretty output (default)
x timeline home --json                     # JSON output
x timeline home | jq '.data[0]'            # Pipe to jq
```

## Additional Resources

- @docs/commands.md - Complete command reference with all flags
- @docs/examples.md - Real-world usage patterns and scripts
- @docs/troubleshooting.md - Common issues and fixes

# X CLI Command Reference

Complete reference for all x-cli commands with flags and options.

## Global Options

These options work with all commands:

| Flag | Short | Description |
|------|-------|-------------|
| `--json` | `-j` | Output raw JSON |
| `--quiet` | `-q` | Suppress non-essential output |
| `--verbose` | `-v` | Show debug information |
| `--no-color` | | Disable colored output |

---

## Authentication

### x auth login
Start OAuth 2.0 PKCE authentication flow.
```bash
x auth login
```
Opens browser for X authentication. Tokens stored encrypted at `~/.config/x-cli/`.

### x auth logout
Clear stored authentication tokens.
```bash
x auth logout
```

### x auth status
Show current authentication status and user info.
```bash
x auth status
```

### x auth refresh
Force refresh of access token.
```bash
x auth refresh
```

---

## Posts

### x post create
Create a new post.
```bash
x post create <text>
x post create "Hello world!"
```

### x post get
Get a post by ID.
```bash
x post get <id>
x post get 1234567890
```

### x post delete
Delete a post.
```bash
x post delete <id>
```

### x post reply
Reply to a post.
```bash
x post reply <id> <text>
x post reply 1234567890 "Great post!"
```

### x post quote
Quote a post.
```bash
x post quote <id> <text>
x post quote 1234567890 "This is important"
```

---

## Timelines

### x timeline home
View your home timeline.
```bash
x timeline home
x timeline home --limit 20
x timeline home --since-id 1234567890
```

| Option | Description |
|--------|-------------|
| `--limit <n>` | Number of posts (default: 10, max: 100) |
| `--since-id <id>` | Only posts newer than this ID |

### x timeline user
View a user's posts.
```bash
x timeline user <username>
x timeline user elonmusk --limit 5
```

### x timeline mentions
View posts mentioning you.
```bash
x timeline mentions
x timeline mentions --limit 20
```

---

## Search

### x search
Search for posts.
```bash
x search <query>
x search "AI news"
x search "from:elonmusk SpaceX"
x search "#tech" --limit 50
```

| Option | Description |
|--------|-------------|
| `--limit <n>` | Number of results (default: 10) |

**Search operators:**
- `from:username` - Posts from specific user
- `to:username` - Replies to specific user
- `#hashtag` - Posts with hashtag
- `@mention` - Posts mentioning user
- `"exact phrase"` - Exact match
- `-keyword` - Exclude keyword

---

## Engagement

### x like / x unlike
Like or unlike a post.
```bash
x like <id>
x unlike <id>
```

### x repost / x unrepost
Repost or remove repost.
```bash
x repost <id>
x unrepost <id>
```

### x bookmark
Manage bookmarks.
```bash
x bookmark add <id>      # Add bookmark
x bookmark list          # List bookmarks
x bookmark remove <id>   # Remove bookmark
```

---

## Users

### x me
Show your profile.
```bash
x me
```

### x user
Look up a user by username.
```bash
x user <username>
x user elonmusk
```

### x follow / x unfollow
Follow or unfollow a user.
```bash
x follow <username>
x unfollow <username>
```

### x followers
List followers.
```bash
x followers            # Your followers
x followers <username> # User's followers
```

### x following
List following.
```bash
x following            # Your following
x following <username> # User's following
```

### x block / x unblock
Block or unblock a user.
```bash
x block <username>
x unblock <username>
x blocks              # List blocked users
```

### x mute / x unmute
Mute or unmute a user.
```bash
x mute <username>
x unmute <username>
x mutes               # List muted users
```

---

## Lists

### x list create
Create a new list.
```bash
x list create <name>
x list create "Tech News"
x list create "Private List" --private
```

| Option | Description |
|--------|-------------|
| `--private` | Create private list |
| `--description <text>` | List description |

### x list get
Get list details.
```bash
x list get <id>
```

### x list update
Update a list.
```bash
x list update <id> --name "New Name"
x list update <id> --description "Updated description"
```

### x list delete
Delete a list.
```bash
x list delete <id>
```

### x list timeline
View posts from a list.
```bash
x list timeline <id>
x list timeline <id> --limit 20
```

### x lists
View your lists.
```bash
x lists            # Your owned lists
x lists owned      # Same as above
x lists followed   # Lists you follow
x lists pinned     # Your pinned lists
```

### x list members
View list members.
```bash
x list members <id>
```

### x list add / x list remove
Add or remove list members.
```bash
x list add <list_id> <username>
x list remove <list_id> <username>
```

### x list follow / x list unfollow
Follow or unfollow a list.
```bash
x list follow <id>
x list unfollow <id>
```

### x list pin / x list unpin
Pin or unpin a list.
```bash
x list pin <id>
x list unpin <id>
```

---

## Direct Messages

### x dm list
List your DM conversations.
```bash
x dm list
```

### x dm view
View conversation with a user.
```bash
x dm view <username>
```

### x dm conversation
View conversation by ID.
```bash
x dm conversation <conversation_id>
```

### x dm send
Send a direct message.
```bash
x dm send <username> <text>
x dm send friend "Hey, how are you?"
```

### x dm group
Create a group DM.
```bash
x dm group -u user1 -u user2 <text>
x dm group -u alice -u bob "Group chat!"
```

### x dm delete
Delete a message.
```bash
x dm delete <event_id>
```

---

## Spaces

### x space get
Get space details.
```bash
x space get <id>
```

### x space search
Search for spaces.
```bash
x space search <query>
x space search "AI" --state live
```

| Option | Description |
|--------|-------------|
| `--state <state>` | Filter by state: `live`, `scheduled`, `all` |

### x spaces
Get user's spaces.
```bash
x spaces <username>
```

### x space buyers
Get ticketed space buyers.
```bash
x space buyers <id>
```

---

## Media

### x media upload
Upload media file.
```bash
x media upload <file>
x media upload image.png
x media upload video.mp4 --alt "Video description"
```

| Option | Description |
|--------|-------------|
| `--alt <text>` | Alt text for accessibility |

Supports: PNG, JPEG, GIF, MP4, MOV
- Images < 5MB: Simple upload
- Videos/large files: Chunked upload with progress

### x media status
Check media processing status.
```bash
x media status <media_id>
```

### x media wait
Wait for media processing to complete.
```bash
x media wait <media_id>
```

---

## Grok AI

Requires `XAI_API_KEY` environment variable.

### x grok
Ask Grok anything or parse natural language commands.
```bash
x grok "your question"
x grok "What's trending in AI?"
x grok "show my last 5 posts"  # Parses to CLI command
```

### x grok summarize
Summarize content.
```bash
x grok summarize @<username>   # Summarize user's recent posts
x grok summarize <post_id>     # Summarize thread
x grok summarize @elonmusk --length detailed
```

| Option | Description |
|--------|-------------|
| `--length <length>` | `brief` or `detailed` (default: brief) |

### x grok analyze
Analyze a post.
```bash
x grok analyze <post_id>
```

Returns: sentiment, topics, engagement prediction.

### x grok draft
Draft a post on a topic.
```bash
x grok draft "topic"
x grok draft "AI announcement" --tone professional
x grok draft "product launch" --tone casual
```

| Option | Description |
|--------|-------------|
| `--tone <tone>` | `professional`, `casual`, `humorous`, `formal` |

### x grok reply
Get reply suggestions for a post.
```bash
x grok reply <post_id>
```

### x grok ask
Ask questions about your timeline.
```bash
x grok ask "What are people saying about X?"
x grok ask "Any important announcements?"
```

---

## Configuration

### x config list
Show all configuration.
```bash
x config list
```

### x config get
Get a config value.
```bash
x config get <key>
x config get default_output
```

### x config set
Set a config value.
```bash
x config set <key> <value>
x config set default_output json
x config set default_limit 20
```

**Available settings:**
| Key | Values | Default |
|-----|--------|---------|
| `default_output` | `pretty`, `json` | `pretty` |
| `default_limit` | 1-100 | 10 |

### x config reset
Reset to default configuration.
```bash
x config reset
```

Config file location: `~/.config/x-cli/config.json`

---

## Interactive Mode

### x -i / x --interactive
Start interactive REPL mode.
```bash
x -i
x --interactive
```

**REPL commands:**
- `help` - Show available commands
- `history` - Show command history
- `clear` - Clear screen
- `exit` / `quit` - Exit REPL

Features:
- Command history (up/down arrows)
- Tab completion
- Persistent session

---

## Shell Completions

### x completion
Generate shell completion scripts.
```bash
x completion bash   # Bash completions
x completion zsh    # Zsh completions
x completion fish   # Fish completions
```

**Installation:**

Bash:
```bash
x completion bash >> ~/.bashrc
```

Zsh:
```bash
x completion zsh >> ~/.zshrc
```

Fish:
```bash
x completion fish > ~/.config/fish/completions/x.fish
```

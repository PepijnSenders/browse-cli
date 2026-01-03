# X CLI Examples

Real-world usage patterns and workflows.

## Quick Actions

### Post and engage
```bash
# Create a post
x post create "Excited to announce our new feature!"

# Like and repost something
x like 1234567890
x repost 1234567890

# Reply to a post
x post reply 1234567890 "Thanks for sharing!"

# Quote with commentary
x post quote 1234567890 "This is a great insight"
```

### Check your timeline
```bash
# See what's happening
x timeline home

# Check mentions
x timeline mentions

# See a specific user's posts
x timeline user elonmusk --limit 5
```

## Search Patterns

### Find specific content
```bash
# Basic search
x search "machine learning"

# From a specific user
x search "from:OpenAI GPT"

# With hashtag
x search "#AI #startup"

# Exclude terms
x search "AI -crypto -NFT"

# Exact phrase
x search "\"artificial intelligence\" research"

# Combine operators
x search "from:sama AI" --limit 20
```

### Monitor topics
```bash
# Get latest on a topic
x search "breaking news" --limit 50

# Track a product
x search "@CompanyName OR #ProductName"
```

## User Management

### Follow workflow
```bash
# Look up a user first
x user interesting_person

# Follow them
x follow interesting_person

# Check who they follow for more accounts
x following interesting_person
```

### Manage your network
```bash
# See who follows you
x followers

# Check mutual connections
x following
x followers

# Block problematic accounts
x block spammer123
x blocks  # List all blocked
```

## Lists for Organization

### Create a curated feed
```bash
# Create a tech news list
x list create "Tech News"

# Add members
x list add 1234567890 verge
x list add 1234567890 techcrunch
x list add 1234567890 wired

# View the curated timeline
x list timeline 1234567890
```

### Manage multiple lists
```bash
# See all your lists
x lists

# Pin important ones
x list pin 1234567890

# View pinned lists
x lists pinned
```

## Direct Messages

### Start conversations
```bash
# Send a DM
x dm send friend "Hey, did you see the announcement?"

# View conversation
x dm view friend

# List all conversations
x dm list
```

### Group chats
```bash
# Create a group DM
x dm group -u alice -u bob "Team meeting at 3pm?"
```

## Media Uploads

### Post with images
```bash
# Upload an image
x media upload screenshot.png --alt "App screenshot showing new feature"

# Check status
x media status 1234567890

# Use media ID when creating post (future feature)
```

### Video content
```bash
# Upload video (chunked automatically for large files)
x media upload demo.mp4 --alt "Product demo"

# Wait for processing
x media wait 1234567890
```

## Grok AI Workflows

### Content creation
```bash
# Draft a post
x grok draft "announcing a new feature" --tone professional

# Get reply suggestions
x grok reply 1234567890

# Ask for help
x grok "how should I respond to criticism?"
```

### Research and analysis
```bash
# Summarize someone's recent activity
x grok summarize @competitor --length detailed

# Analyze a viral post
x grok analyze 1234567890

# Ask about your timeline
x grok ask "What are the main topics being discussed today?"
```

### Natural language commands
```bash
# These get parsed into CLI commands
x grok "show my mentions"
x grok "search for AI news"
x grok "who do I follow?"
```

## JSON Output for Scripting

### Pipe to jq
```bash
# Get specific fields
x timeline home --json | jq '.[0].text'

# Filter by engagement
x search "topic" --json | jq '[.[] | select(.public_metrics.like_count > 100)]'

# Extract usernames
x followers --json | jq '.[].username'
```

### Save for later
```bash
# Export timeline
x timeline home --limit 100 --json > timeline.json

# Export followers list
x followers --json > followers.json
```

## Interactive Mode

### Extended session
```bash
# Start REPL
x -i

# Inside REPL:
> timeline home
> search "interesting topic"
> like 1234567890
> history
> exit
```

## Automation Scripts

### Daily digest script
```bash
#!/bin/bash
echo "=== Home Timeline ==="
x timeline home --limit 10

echo -e "\n=== Mentions ==="
x timeline mentions --limit 5

echo -e "\n=== Bookmarks ==="
x bookmark list --limit 5
```

### Engagement tracker
```bash
#!/bin/bash
# Track a specific post's engagement
POST_ID="1234567890"
x post get $POST_ID --json | jq '.public_metrics'
```

### Batch follow from file
```bash
#!/bin/bash
# users.txt contains one username per line
while read username; do
  x follow "$username"
  sleep 1  # Rate limit friendly
done < users.txt
```

## Configuration

### Set defaults
```bash
# Prefer JSON output
x config set default_output json

# Increase default limit
x config set default_limit 25

# Check settings
x config list
```

### Environment setup
```bash
# Add to .bashrc/.zshrc
export XAI_API_KEY="your-grok-api-key"

# Install completions
x completion zsh >> ~/.zshrc
source ~/.zshrc
```

## Common Patterns

### Thread creation (manual)
```bash
# First post
x post create "1/ Here's a thread about X..."

# Get the ID from output, then reply
x post reply <first_post_id> "2/ Second point..."
x post reply <second_post_id> "3/ Third point..."
```

### Quick engagement check
```bash
# See engagement on your recent posts
x timeline user $(x me --json | jq -r '.username') --limit 5 --json | \
  jq '.[] | {text: .text[0:50], likes: .public_metrics.like_count}'
```

### Find and engage with influencers
```bash
# Search for topic experts
x search "from:expert_user topic" --limit 10

# Look at their profile
x user expert_user

# Follow if interesting
x follow expert_user
```

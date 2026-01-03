# MCP Tools Specification

This document defines all tools exposed by the Session Scraper MCP server.

## Tool Categories

1. **Twitter/X Tools** - Scrape Twitter data
2. **LinkedIn Tools** - Scrape LinkedIn data
3. **Browser Tools** - Navigation, screenshots, page info
4. **Generic Tools** - Extract data from any page

---

## Twitter/X Tools

### `scrape_twitter_profile`

Scrape a Twitter user's profile information.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "description": "Twitter username (without @)"
    }
  },
  "required": ["username"]
}
```

**Output:**
```json
{
  "username": "elonmusk",
  "displayName": "Elon Musk",
  "bio": "...",
  "location": "...",
  "website": "...",
  "joinDate": "March 2009",
  "followersCount": 170000000,
  "followingCount": 500,
  "postsCount": 40000,
  "verified": true,
  "profileImageUrl": "https://...",
  "bannerImageUrl": "https://..."
}
```

**Errors:**
- `User not found` - Username doesn't exist
- `Profile suspended` - Account suspended
- `Rate limited` - Too many requests (wait and retry)

---

### `scrape_twitter_timeline`

Scrape tweets from a user's timeline or home feed.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "username": {
      "type": "string",
      "description": "Username to scrape (omit for home timeline)"
    },
    "count": {
      "type": "number",
      "description": "Number of tweets to fetch (default: 20, max: 100)"
    }
  }
}
```

**Output:**
```json
{
  "tweets": [
    {
      "id": "1234567890",
      "url": "https://x.com/user/status/1234567890",
      "text": "Tweet content...",
      "author": {
        "username": "elonmusk",
        "displayName": "Elon Musk",
        "verified": true
      },
      "createdAt": "2024-01-15T10:30:00Z",
      "metrics": {
        "likes": 50000,
        "retweets": 10000,
        "replies": 5000,
        "views": 1000000
      },
      "media": [
        {
          "type": "image",
          "url": "https://..."
        }
      ],
      "isRetweet": false,
      "isReply": false,
      "quotedTweet": null
    }
  ],
  "hasMore": true
}
```

---

### `scrape_twitter_post`

Scrape a single tweet and its thread context.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "Full URL of the tweet (e.g., https://x.com/user/status/123)"
    }
  },
  "required": ["url"]
}
```

**Output:**
```json
{
  "tweet": { /* same as timeline tweet */ },
  "thread": [ /* parent tweets if this is a reply */ ],
  "replies": [ /* top replies */ ]
}
```

---

### `scrape_twitter_search`

Search Twitter for tweets matching a query.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query (supports Twitter search operators)"
    },
    "count": {
      "type": "number",
      "description": "Number of results (default: 20, max: 100)"
    }
  },
  "required": ["query"]
}
```

**Output:** Same as `scrape_twitter_timeline`

**Query Operators:**
- `from:username` - Tweets from user
- `to:username` - Replies to user
- `@username` - Mentions of user
- `#hashtag` - Contains hashtag
- `since:2024-01-01` - Date filter
- `filter:media` - Only with media
- `filter:links` - Only with links

---

## LinkedIn Tools

### `scrape_linkedin_profile`

Scrape a LinkedIn user's profile.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "Full LinkedIn profile URL"
    }
  },
  "required": ["url"]
}
```

**Output:**
```json
{
  "name": "John Doe",
  "headline": "Senior Software Engineer at Google",
  "location": "San Francisco Bay Area",
  "about": "...",
  "profileImageUrl": "https://...",
  "connectionCount": "500+",
  "experience": [
    {
      "title": "Senior Software Engineer",
      "company": "Google",
      "companyUrl": "https://linkedin.com/company/google",
      "duration": "Jan 2020 - Present · 4 yrs",
      "location": "Mountain View, CA",
      "description": "..."
    }
  ],
  "education": [
    {
      "school": "Stanford University",
      "degree": "BS Computer Science",
      "years": "2012 - 2016"
    }
  ],
  "skills": ["Python", "JavaScript", "Machine Learning"]
}
```

---

### `scrape_linkedin_posts`

Scrape posts from a LinkedIn user or company page.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "LinkedIn profile or company URL"
    },
    "count": {
      "type": "number",
      "description": "Number of posts (default: 10, max: 50)"
    }
  },
  "required": ["url"]
}
```

**Output:**
```json
{
  "posts": [
    {
      "id": "urn:li:activity:123",
      "text": "Post content...",
      "author": {
        "name": "John Doe",
        "headline": "...",
        "profileUrl": "..."
      },
      "createdAt": "2024-01-15",
      "metrics": {
        "likes": 500,
        "comments": 50,
        "reposts": 20
      },
      "media": []
    }
  ]
}
```

---

### `scrape_linkedin_search`

Search LinkedIn for people, posts, or companies.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query"
    },
    "type": {
      "type": "string",
      "enum": ["people", "posts", "companies"],
      "description": "Type of search (default: people)"
    },
    "count": {
      "type": "number",
      "description": "Number of results (default: 10, max: 50)"
    }
  },
  "required": ["query"]
}
```

**Output (people):**
```json
{
  "results": [
    {
      "name": "John Doe",
      "headline": "Software Engineer at Google",
      "location": "San Francisco",
      "profileUrl": "https://linkedin.com/in/johndoe",
      "connectionDegree": "2nd"
    }
  ]
}
```

---

## Browser Tools

### `navigate`

Navigate the active page to a URL.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "url": {
      "type": "string",
      "description": "URL to navigate to"
    }
  },
  "required": ["url"]
}
```

**Output:**
```json
{
  "success": true,
  "url": "https://...",
  "title": "Page Title"
}
```

---

### `take_screenshot`

Take a screenshot of the current page.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "fullPage": {
      "type": "boolean",
      "description": "Capture full page or just viewport (default: false)"
    }
  }
}
```

**Output:** Returns image content block (base64 PNG)

---

### `get_page_info`

Get information about the current page.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {}
}
```

**Output:**
```json
{
  "url": "https://x.com/home",
  "title": "Home / X"
}
```

---

### `list_pages`

List all pages (tabs) available for control.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {}
}
```

**Output:**
```json
{
  "pages": [
    { "index": 0, "url": "https://x.com/home", "title": "Home / X" },
    { "index": 1, "url": "https://linkedin.com/feed", "title": "LinkedIn" }
  ]
}
```

---

### `switch_page`

Switch to a different page (tab) by index.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "index": {
      "type": "number",
      "description": "Page index from list_pages"
    }
  },
  "required": ["index"]
}
```

---

## Generic Tools

### `scrape_page`

Extract text content and links from the current page.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "selector": {
      "type": "string",
      "description": "CSS selector to scope extraction (optional)"
    }
  }
}
```

**Output:**
```json
{
  "url": "https://...",
  "title": "...",
  "text": "Extracted text content...",
  "links": [
    { "text": "Link text", "href": "https://..." }
  ],
  "images": [
    { "alt": "Image description", "src": "https://..." }
  ]
}
```

---

### `execute_script`

Execute custom JavaScript on the page.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "script": {
      "type": "string",
      "description": "JavaScript code to execute (must return JSON-serializable value)"
    }
  },
  "required": ["script"]
}
```

**Output:** Returns the result of the script execution.

**Example:**
```javascript
// Get all heading text
Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent)
```

**Security Note:** This tool executes arbitrary JavaScript. Use carefully.

---

## Error Response Format

All tools return errors in this format:

```json
{
  "content": [
    {
      "type": "text",
      "text": "Error: <error message>"
    }
  ],
  "isError": true
}
```

Common errors:
- `Extension not connected` - Playwriter extension not active
- `No pages available` - No tabs enabled for control
- `Navigation timeout` - Page took too long to load
- `Element not found` - Expected DOM element missing
- `Rate limited` - Site is throttling requests

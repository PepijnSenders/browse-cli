# Phase 2: Posts

## Objectives

- Post CRUD operations
- Timeline retrieval (home, user, mentions)
- Search
- Engagement (like, repost, bookmark)

## Commands

### Posts

```bash
x post create "Hello world!"
x post create "Check this!" --media image.jpg
x post create "Thread!" --reply-to <id>
x post create "Quote" --quote <id>

x post get <id>
x post delete <id>
x post reply <id> "Great point!"
```

### Timeline

```bash
x timeline home
x timeline home --limit 50 --since-id <id>

x timeline user elonmusk
x timeline user --id <user_id>

x timeline mentions
```

### Search

```bash
x search "typescript"
x search "from:elonmusk AI"
x search "#buildinpublic" --limit 100
```

### Engagement

```bash
x like <id>
x unlike <id>

x repost <id>
x unrepost <id>

x bookmark <id>
x bookmark list
x bookmark remove <id>
```

## API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Get post | GET | `/tweets/:id` |
| Create post | POST | `/tweets` |
| Delete post | DELETE | `/tweets/:id` |
| Home timeline | GET | `/users/:id/reverse_chronological_timeline` |
| User timeline | GET | `/users/:id/tweets` |
| Mentions | GET | `/users/:id/mentions` |
| Search | GET | `/tweets/search/recent` |
| Like | POST | `/users/:id/likes` |
| Unlike | DELETE | `/users/:id/likes/:tweet_id` |
| Repost | POST | `/users/:id/retweets` |
| Unrepost | DELETE | `/users/:id/retweets/:tweet_id` |
| Bookmark | POST | `/users/:id/bookmarks` |
| List bookmarks | GET | `/users/:id/bookmarks` |
| Remove bookmark | DELETE | `/users/:id/bookmarks/:tweet_id` |

## Pretty Output

### Post Card
```
┌─────────────────────────────────────────────────────────┐
│ @elonmusk · 2h                                          │
│                                                         │
│ The future of AI is going to be incredible.             │
│                                                         │
│ 💬 1.2K  ↺ 4.5K  ♥ 45.6K  📊 12.3M                      │
└─────────────────────────────────────────────────────────┘
```

### Timeline (compact)
```
@user1 · 5m
Just shipped a new feature!
💬 12  ↺ 45  ♥ 128

@user2 · 1h
Working on something exciting...
💬 5  ↺ 10  ♥ 89
```

## Verification Checklist

- [ ] `x post create` returns new post ID
- [ ] `x post get` shows post with metrics
- [ ] `x post delete` removes post
- [ ] `x timeline home` shows home feed
- [ ] `x timeline user` shows user's posts
- [ ] `x timeline mentions` shows mentions
- [ ] `x search` returns matching posts
- [ ] `x like/unlike` toggles like
- [ ] `x repost/unrepost` toggles repost
- [ ] `x bookmark` CRUD works
- [ ] `--json` outputs minimal JSON
- [ ] `--limit` pagination works
- [ ] Rate limits handled gracefully

## Test Coverage

- Posts API: CRUD, timelines, search, engagement
- CLI: output formatting, flags, error handling
- Edge cases: empty results, pagination tokens

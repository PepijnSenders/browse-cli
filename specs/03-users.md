# Phase 3: Users

## Objectives

- User lookup (by username, ID)
- User search
- Follow/unfollow
- Block/mute management

## Commands

### Lookup

```bash
x user elonmusk
x user --id 44196397
x me
x user search "elon"
```

### Following

```bash
x follow elonmusk
x unfollow elonmusk

x following              # Your following
x following elonmusk     # Their following

x followers              # Your followers
x followers elonmusk     # Their followers
```

### Block / Mute

```bash
x block username
x unblock username
x blocks

x mute username
x unmute username
x mutes
```

## API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Get by username | GET | `/users/by/username/:username` |
| Get by ID | GET | `/users/:id` |
| Get me | GET | `/users/me` |
| Search | GET | `/users/search` |
| Follow | POST | `/users/:id/following` |
| Unfollow | DELETE | `/users/:source_id/following/:target_id` |
| Following list | GET | `/users/:id/following` |
| Followers list | GET | `/users/:id/followers` |
| Block | POST | `/users/:id/blocking` |
| Unblock | DELETE | `/users/:source_id/blocking/:target_id` |
| Blocked list | GET | `/users/:id/blocking` |
| Mute | POST | `/users/:id/muting` |
| Unmute | DELETE | `/users/:source_id/muting/:target_id` |
| Muted list | GET | `/users/:id/muting` |

## Pretty Output

### User Profile
```
╭──────────────────────────────────────────────────────────╮
│ Elon Musk                                                │
│ @elonmusk ✓                                              │
│                                                          │
│ Mars, Cars, Chips, and Tweets                            │
│                                                          │
│ 📍 Austin, TX · 🔗 tesla.com                             │
│ 📅 Joined June 2009                                      │
│                                                          │
│ 567 Following · 195.2M Followers                         │
╰──────────────────────────────────────────────────────────╯
```

### User List
```
┌──────────────────┬─────────────────────┬────────────┐
│ Username         │ Name                │ Followers  │
├──────────────────┼─────────────────────┼────────────┤
│ @user1           │ User One            │ 12.5K      │
│ @user2           │ User Two            │ 5.6K       │
└──────────────────┴─────────────────────┴────────────┘
```

## Verification Checklist

- [ ] `x user <username>` shows profile
- [ ] `x user --id` works with user ID
- [ ] `x me` shows authenticated user
- [ ] `x user search` finds users
- [ ] `x follow/unfollow` works
- [ ] `x following/followers` lists users
- [ ] `x block/unblock` works
- [ ] `x mute/unmute` works
- [ ] `x blocks/mutes` lists blocked/muted
- [ ] `--json` outputs minimal JSON
- [ ] `--limit` pagination works

## Test Coverage

- Users API: lookup, search, relationships
- CLI: profile formatting, lists, error handling
- Helper: username-to-ID resolution

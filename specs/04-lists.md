# Phase 4: Lists

## Objectives

- List CRUD
- Membership management
- List timeline
- Follow/pin lists

## Commands

### CRUD

```bash
x list create "Tech News"
x list create "Private" --private --description "My notes"

x list <id>
x list update <id> --name "New Name"
x list delete <id>
```

### Content

```bash
x list timeline <id>
x list timeline <id> --limit 50

x lists                  # Your lists
x lists elonmusk         # User's lists
x lists --pinned
x lists --followed
```

### Membership

```bash
x list add <id> elonmusk
x list remove <id> elonmusk
x list members <id>
```

### Following

```bash
x list follow <id>
x list unfollow <id>
x list pin <id>
x list unpin <id>
```

## API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Get list | GET | `/lists/:id` |
| Create | POST | `/lists` |
| Update | PUT | `/lists/:id` |
| Delete | DELETE | `/lists/:id` |
| Timeline | GET | `/lists/:id/tweets` |
| Owned lists | GET | `/users/:id/owned_lists` |
| Followed lists | GET | `/users/:id/followed_lists` |
| Pinned lists | GET | `/users/:id/pinned_lists` |
| Add member | POST | `/lists/:id/members` |
| Remove member | DELETE | `/lists/:id/members/:user_id` |
| Members | GET | `/lists/:id/members` |
| Follow list | POST | `/users/:id/followed_lists` |
| Unfollow list | DELETE | `/users/:id/followed_lists/:list_id` |
| Pin list | POST | `/users/:id/pinned_lists` |
| Unpin list | DELETE | `/users/:id/pinned_lists/:list_id` |

## Pretty Output

### List Details
```
╭──────────────────────────────────────────────────────────╮
│ 📋 Tech News                                             │
│ By @elonmusk · 🔒 Private                                │
│                                                          │
│ The latest technology news and updates                   │
│                                                          │
│ 👥 125 Members · 👁 1.2K Followers                       │
╰──────────────────────────────────────────────────────────╯
```

### Lists Table
```
┌────────────────────┬─────────┬───────────┬─────────┐
│ Name               │ Members │ Followers │ Private │
├────────────────────┼─────────┼───────────┼─────────┤
│ Tech News          │ 125     │ 1,234     │ No      │
│ Private Friends    │ 10      │ 0         │ Yes     │
└────────────────────┴─────────┴───────────┴─────────┘
```

## Verification Checklist

- [ ] `x list create` creates and returns ID
- [ ] `x list create --private` works
- [ ] `x list <id>` shows details
- [ ] `x list update` modifies list
- [ ] `x list delete` removes list
- [ ] `x list timeline` shows posts
- [ ] `x list members` shows members
- [ ] `x list add/remove` manages members
- [ ] `x list follow/unfollow` works
- [ ] `x list pin/unpin` works
- [ ] `x lists` shows your lists
- [ ] `--json` outputs minimal JSON

## Test Coverage

- Lists API: CRUD, membership, following
- CLI: formatting, flags
- Edge cases: private lists, empty lists

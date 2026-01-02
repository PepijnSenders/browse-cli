# Phase 5: Direct Messages

## Objectives

- DM conversation management
- Send and receive messages
- Group DM support
- Message deletion

## Commands

```bash
# List conversations
x dm list
x dm list --limit 20

# View conversation
x dm elonmusk
x dm elonmusk --limit 50
x dm --conversation <id>

# Send message
x dm send elonmusk "Hey, how are you?"
x dm send elonmusk "Check this" --media image.jpg

# Group DM
x dm group create -u user1 -u user2 "Hello everyone!"

# Delete message
x dm delete <event_id>
```

## API Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| List conversations | GET | `/dm_conversations` |
| Get messages | GET | `/dm_conversations/:id/dm_events` |
| Get with user | GET | `/dm_conversations/with/:user_id/dm_events` |
| Send to user | POST | `/dm_conversations/with/:user_id/messages` |
| Send to conversation | POST | `/dm_conversations/:id/messages` |
| Create group | POST | `/dm_conversations` |
| Delete message | DELETE | `/dm_events/:id` |

## Pretty Output

### Conversation List
```
┌──────────────────────┬───────────┬────────────────────────────────────────┐
│ Conversation         │ Type      │ Last Message                           │
├──────────────────────┼───────────┼────────────────────────────────────────┤
│ 1234567890           │ one_to_one│ Hey, how's the project going?...       │
│ 9876543210           │ group     │ Let's schedule the meeting for...      │
└──────────────────────┴───────────┴────────────────────────────────────────┘
```

### Conversation View
```
@elonmusk · 2d
Hey, what do you think about the new feature?

@you · 2d
I think it's great! We should ship it soon.

@elonmusk · 1d
Agreed. Let's do it tomorrow.
```

## Verification Checklist

- [ ] `x dm list` shows conversations
- [ ] `x dm <username>` shows messages
- [ ] `x dm send <user> "text"` sends DM
- [ ] `x dm group create` works
- [ ] `x dm delete <id>` deletes message
- [ ] Messages display chronologically
- [ ] User names resolve correctly
- [ ] `--json` outputs minimal JSON
- [ ] Pagination works

## Test Coverage

- DM API: conversations, messages, send, delete
- CLI: formatting, user resolution
- Edge cases: empty conversations, group DMs

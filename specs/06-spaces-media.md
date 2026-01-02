# Phase 6: Spaces & Media

## Objectives

- Spaces lookup and search
- Media upload (simple and chunked)
- Media attachment to posts

## Spaces Commands

```bash
x space <id>
x space search "tech talk"
x space search "AI" --state live

x spaces elonmusk
x space buyers <id>
```

## Media Commands

```bash
# Upload (returns media ID)
x media upload image.jpg
x media upload video.mp4
x media upload image.jpg --alt "Description"

# Check async status
x media status <id>

# Use in post
x post create "Check this!" --media <media_id>
```

## API Endpoints

### Spaces

| Action | Method | Endpoint |
|--------|--------|----------|
| Get space | GET | `/spaces/:id` |
| Get multiple | GET | `/spaces` |
| By creators | GET | `/spaces/by/creator_ids` |
| Search | GET | `/spaces/search` |
| Buyers | GET | `/spaces/:id/buyers` |

### Media

| Action | Method | Endpoint |
|--------|--------|----------|
| Simple upload | POST | `upload.twitter.com/1.1/media/upload.json` |
| Chunked INIT | POST | `upload.twitter.com/1.1/media/upload.json?command=INIT` |
| Chunked APPEND | POST | `upload.twitter.com/1.1/media/upload.json?command=APPEND` |
| Chunked FINALIZE | POST | `upload.twitter.com/1.1/media/upload.json?command=FINALIZE` |
| Check status | GET | `upload.twitter.com/1.1/media/upload.json?command=STATUS` |
| Set alt text | POST | `upload.twitter.com/1.1/media/metadata/create.json` |

## Upload Strategy

- **Images < 5MB**: Simple upload
- **Videos / Large files**: Chunked upload (5MB chunks)
- **Processing**: Poll status until `succeeded` or `failed`

## Pretty Output

### Space Details
```
╭──────────────────────────────────────────────────────────╮
│ 🎙️ Tech Talk: The Future of AI                          │
│ State: 🔴 LIVE                                           │
│                                                          │
│ Host: @elonmusk                                          │
│ Speakers: @sama, @karpathy                               │
│                                                          │
│ 👥 12,456 listening                                      │
╰──────────────────────────────────────────────────────────╯
```

### Media Upload
```
✔ Media uploaded

{"media_id":"1234567890","expires_after_secs":86400}

Use in a post:
  x post create "Your text" --media 1234567890
```

## Verification Checklist

### Spaces
- [ ] `x space <id>` shows details
- [ ] `x space search` finds spaces
- [ ] `x space search --state live` filters
- [ ] `x spaces <user>` shows user's spaces
- [ ] `--json` works

### Media
- [ ] `x media upload image.jpg` returns ID
- [ ] `x media upload video.mp4` handles chunked
- [ ] `x media upload --alt` sets alt text
- [ ] `x media status <id>` shows processing status
- [ ] Uploaded ID works with `x post create --media`
- [ ] Progress indicator shows during upload

## Test Coverage

- Spaces API: lookup, search, filters
- Media API: simple upload, chunked upload, status polling
- CLI: progress indicators, error handling

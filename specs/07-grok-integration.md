# Phase 7: Grok Integration

## Objectives

- Grok API integration for AI features
- Natural language command parsing
- Thread summarization
- Post analysis and drafting

## Commands

### Natural Language

```bash
x grok "show my last 5 posts"
x grok "who followed me this week"
x grok "find tweets about typescript"
```

### Summarization

```bash
x grok summarize <post_id>
x grok summarize <post_id> --length detailed
x grok summarize @elonmusk --limit 20
```

### Analysis

```bash
x grok analyze <post_id>
```

### Content Generation

```bash
x grok draft "benefits of TypeScript"
x grok draft "new feature" --tone professional
x grok draft "weekend" --tone casual --hashtags

x grok reply <post_id>
x grok reply <post_id> --tone agree
x grok reply <post_id> --tone disagree

x grok ask "what are people saying about AI"
```

## Grok API

- **Base URL**: `https://api.x.ai/v1`
- **Model**: `grok-2` (default)
- **Auth**: Bearer token from `XAI_API_KEY`

### Endpoints

| Action | Method | Endpoint |
|--------|--------|----------|
| Chat | POST | `/chat/completions` |

## NL Command Examples

| Input | Parsed Command |
|-------|----------------|
| "show my posts" | `x timeline user @me` |
| "show my last 5 posts" | `x timeline user @me --limit 5` |
| "who followed me" | `x followers` |
| "search typescript" | `x search "typescript"` |
| "post hello world" | `x post create "hello world"` |
| "like tweet 123" | `x like 123` |
| "follow elon" | `x follow elonmusk` |

## Analysis Output

```json
{
  "sentiment": "positive",
  "sentimentScore": 0.72,
  "topics": ["technology", "innovation"],
  "engagementPrediction": "high",
  "keyPoints": ["announces new feature", "strong CTA"]
}
```

## Pretty Output

### Summary
```
✔ Summary generated

Summary:
The thread discusses AI development with participants
debating progress and societal impacts.

Key Points:
  • AI capabilities advancing rapidly
  • Concerns about job displacement
  • Need for ethical guidelines

Participants: @elonmusk, @sama, @karpathy
```

### Draft
```
✔ Draft ready

Draft:
We're thrilled to announce our latest AI feature
that makes your workflow 10x faster!

Characters: 142/280

To post: x post create "We're thrilled..."
```

### Reply Suggestions
```
✔ Suggestions ready

Suggested Replies:

1. Great point! This aligns with what we've seen too.
2. Interesting perspective. Have you considered...
3. Could you elaborate on the implementation details?

To reply: x post reply <id> "your reply"
```

## Verification Checklist

- [ ] `XAI_API_KEY` loads from .env
- [ ] `x grok "natural language"` parses and executes
- [ ] `x grok summarize <id>` produces summary
- [ ] `x grok summarize @user` summarizes user's posts
- [ ] `x grok analyze <id>` shows sentiment
- [ ] `x grok draft "topic"` generates draft
- [ ] `x grok draft --tone` respects tone
- [ ] `x grok reply <id>` suggests replies
- [ ] `x grok ask` answers about timeline
- [ ] `--json` works for all commands
- [ ] Spinner shows during API calls

## Test Coverage

- Grok Client: chat, summarize, analyze, draft
- Commands: NL parsing, confidence scoring
- CLI: output formatting, error handling

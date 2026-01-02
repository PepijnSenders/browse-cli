# X API Types (Zod Schemas)

Type-first approach: Define all X API response types as Zod schemas, infer TypeScript types.

## Core Pattern

```typescript
// All schemas in src/types/
import { z } from "zod";

// Define schema
export const UserSchema = z.object({ ... });

// Infer type
export type User = z.infer<typeof UserSchema>;

// Validate at runtime
const user = UserSchema.parse(apiResponse);
```

## Base Types

### User
```typescript
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
  created_at: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  url: z.string().optional(),
  verified: z.boolean().optional(),
  verified_type: z.enum(["blue", "business", "government"]).optional(),
  profile_image_url: z.string().optional(),
  protected: z.boolean().optional(),
  public_metrics: z.object({
    followers_count: z.number(),
    following_count: z.number(),
    tweet_count: z.number(),
    listed_count: z.number(),
    like_count: z.number().optional(),
  }).optional(),
  pinned_tweet_id: z.string().optional(),
});
```

### Tweet (Post)
```typescript
const TweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  author_id: z.string().optional(),
  created_at: z.string().optional(),
  conversation_id: z.string().optional(),
  in_reply_to_user_id: z.string().optional(),
  edit_history_tweet_ids: z.array(z.string()).optional(),
  attachments: z.object({
    media_keys: z.array(z.string()).optional(),
    poll_ids: z.array(z.string()).optional(),
  }).optional(),
  public_metrics: z.object({
    retweet_count: z.number(),
    reply_count: z.number(),
    like_count: z.number(),
    quote_count: z.number(),
    bookmark_count: z.number().optional(),
    impression_count: z.number().optional(),
  }).optional(),
  entities: TweetEntitiesSchema.optional(),
  referenced_tweets: z.array(z.object({
    type: z.enum(["retweeted", "quoted", "replied_to"]),
    id: z.string(),
  })).optional(),
});
```

### Tweet Entities
```typescript
const TweetEntitiesSchema = z.object({
  urls: z.array(z.object({
    start: z.number(),
    end: z.number(),
    url: z.string(),
    expanded_url: z.string().optional(),
    display_url: z.string().optional(),
  })).optional(),
  mentions: z.array(z.object({
    start: z.number(),
    end: z.number(),
    username: z.string(),
    id: z.string().optional(),
  })).optional(),
  hashtags: z.array(z.object({
    start: z.number(),
    end: z.number(),
    tag: z.string(),
  })).optional(),
  cashtags: z.array(z.object({
    start: z.number(),
    end: z.number(),
    tag: z.string(),
  })).optional(),
});
```

### Media
```typescript
const MediaSchema = z.object({
  media_key: z.string(),
  type: z.enum(["photo", "video", "animated_gif"]),
  url: z.string().optional(),
  preview_image_url: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration_ms: z.number().optional(),
  alt_text: z.string().optional(),
  variants: z.array(z.object({
    bit_rate: z.number().optional(),
    content_type: z.string(),
    url: z.string(),
  })).optional(),
});
```

### List
```typescript
const ListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  owner_id: z.string().optional(),
  private: z.boolean().optional(),
  member_count: z.number().optional(),
  follower_count: z.number().optional(),
  created_at: z.string().optional(),
});
```

### Space
```typescript
const SpaceSchema = z.object({
  id: z.string(),
  state: z.enum(["live", "scheduled", "ended"]),
  title: z.string().optional(),
  host_ids: z.array(z.string()).optional(),
  speaker_ids: z.array(z.string()).optional(),
  participant_count: z.number().optional(),
  scheduled_start: z.string().optional(),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
  is_ticketed: z.boolean().optional(),
  lang: z.string().optional(),
});
```

### DM Event
```typescript
const DMEventSchema = z.object({
  id: z.string(),
  event_type: z.enum(["MessageCreate", "ParticipantsJoin", "ParticipantsLeave"]),
  text: z.string().optional(),
  sender_id: z.string(),
  participant_ids: z.array(z.string()).optional(),
  dm_conversation_id: z.string(),
  created_at: z.string(),
  attachments: z.object({
    media_keys: z.array(z.string()).optional(),
  }).optional(),
  referenced_tweets: z.array(z.object({
    id: z.string(),
  })).optional(),
});

const DMConversationSchema = z.object({
  id: z.string(),
  type: z.enum(["one_to_one", "group"]),
});
```

## Response Wrappers

### Single Resource Response
```typescript
const SingleResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    includes: IncludesSchema.optional(),
  });
```

### Paginated Response
```typescript
const PaginatedResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    meta: z.object({
      result_count: z.number(),
      next_token: z.string().optional(),
      previous_token: z.string().optional(),
      newest_id: z.string().optional(),
      oldest_id: z.string().optional(),
    }).optional(),
    includes: IncludesSchema.optional(),
  });
```

### Includes (Expansions)
```typescript
const IncludesSchema = z.object({
  users: z.array(UserSchema).optional(),
  tweets: z.array(TweetSchema).optional(),
  media: z.array(MediaSchema).optional(),
  polls: z.array(PollSchema).optional(),
  places: z.array(PlaceSchema).optional(),
});
```

### Error Response
```typescript
const APIErrorSchema = z.object({
  errors: z.array(z.object({
    message: z.string(),
    code: z.number().optional(),
    type: z.string().optional(),
    title: z.string().optional(),
    detail: z.string().optional(),
    parameter: z.string().optional(),
    value: z.string().optional(),
  })),
});
```

## Request Types

### Create Tweet
```typescript
const CreateTweetRequestSchema = z.object({
  text: z.string().max(280),
  reply: z.object({
    in_reply_to_tweet_id: z.string(),
    exclude_reply_user_ids: z.array(z.string()).optional(),
  }).optional(),
  quote_tweet_id: z.string().optional(),
  media: z.object({
    media_ids: z.array(z.string()),
    tagged_user_ids: z.array(z.string()).optional(),
  }).optional(),
  poll: z.object({
    options: z.array(z.string()).min(2).max(4),
    duration_minutes: z.number().min(5).max(10080),
  }).optional(),
  reply_settings: z.enum(["everyone", "mentionedUsers", "following"]).optional(),
});
```

### Create List
```typescript
const CreateListRequestSchema = z.object({
  name: z.string().max(25),
  description: z.string().max(100).optional(),
  private: z.boolean().optional(),
});
```

### Send DM
```typescript
const SendDMRequestSchema = z.object({
  text: z.string(),
  attachments: z.array(z.object({
    media_id: z.string(),
  })).optional(),
});
```

## File Organization

```
src/types/
├── index.ts       # Re-exports all
├── user.ts        # User schemas
├── tweet.ts       # Tweet schemas
├── media.ts       # Media schemas
├── list.ts        # List schemas
├── space.ts       # Space schemas
├── dm.ts          # DM schemas
├── response.ts    # Response wrappers
└── request.ts     # Request body schemas
```

## Usage in API Client

```typescript
// api/posts.ts
import { TweetSchema, PaginatedResponseSchema } from "../types";

async getTimeline(userId: string) {
  const raw = await this.client.get(`/users/${userId}/tweets`);
  return PaginatedResponseSchema(TweetSchema).parse(raw);
}
```

## Validation Strategy

1. **Parse, don't validate** - Use `.parse()` to transform unknown data
2. **Fail fast** - Let Zod throw on invalid data (catches API changes)
3. **Safe parse for optional** - Use `.safeParse()` when failure is acceptable
4. **Strip extra fields** - Use `.strip()` to remove unexpected fields

```typescript
// Strict validation (throws)
const tweet = TweetSchema.parse(response.data);

// Safe validation (returns result object)
const result = TweetSchema.safeParse(response.data);
if (!result.success) {
  console.error(result.error.issues);
}

// Strip unknown fields
const TweetSchemaStrict = TweetSchema.strict();
```

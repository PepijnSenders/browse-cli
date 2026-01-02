import { z } from "zod";

/**
 * Tweet public engagement metrics
 */
export const TweetPublicMetricsSchema = z.object({
  retweet_count: z.number(),
  reply_count: z.number(),
  like_count: z.number(),
  quote_count: z.number(),
  bookmark_count: z.number().optional(),
  impression_count: z.number().optional(),
});

export type TweetPublicMetrics = z.infer<typeof TweetPublicMetricsSchema>;

/**
 * URL entity within tweet text
 */
export const UrlEntitySchema = z.object({
  start: z.number(),
  end: z.number(),
  url: z.string(),
  expanded_url: z.string().optional(),
  display_url: z.string().optional(),
});

export type UrlEntity = z.infer<typeof UrlEntitySchema>;

/**
 * Mention entity within tweet text
 */
export const MentionEntitySchema = z.object({
  start: z.number(),
  end: z.number(),
  username: z.string(),
  id: z.string().optional(),
});

export type MentionEntity = z.infer<typeof MentionEntitySchema>;

/**
 * Hashtag entity within tweet text
 */
export const HashtagEntitySchema = z.object({
  start: z.number(),
  end: z.number(),
  tag: z.string(),
});

export type HashtagEntity = z.infer<typeof HashtagEntitySchema>;

/**
 * Cashtag entity within tweet text
 */
export const CashtagEntitySchema = z.object({
  start: z.number(),
  end: z.number(),
  tag: z.string(),
});

export type CashtagEntity = z.infer<typeof CashtagEntitySchema>;

/**
 * Tweet entities (URLs, mentions, hashtags, cashtags)
 */
export const TweetEntitiesSchema = z.object({
  urls: z.array(UrlEntitySchema).optional(),
  mentions: z.array(MentionEntitySchema).optional(),
  hashtags: z.array(HashtagEntitySchema).optional(),
  cashtags: z.array(CashtagEntitySchema).optional(),
});

export type TweetEntities = z.infer<typeof TweetEntitiesSchema>;

/**
 * Referenced tweet (retweet, quote, reply)
 */
export const ReferencedTweetSchema = z.object({
  type: z.enum(["retweeted", "quoted", "replied_to"]),
  id: z.string(),
});

export type ReferencedTweet = z.infer<typeof ReferencedTweetSchema>;

/**
 * Tweet attachments
 */
export const TweetAttachmentsSchema = z.object({
  media_keys: z.array(z.string()).optional(),
  poll_ids: z.array(z.string()).optional(),
});

export type TweetAttachments = z.infer<typeof TweetAttachmentsSchema>;

/**
 * X (Twitter) Tweet/Post schema
 * Matches X API v2 tweet object structure
 */
export const TweetSchema = z.object({
  id: z.string(),
  text: z.string(),
  author_id: z.string().optional(),
  created_at: z.string().optional(),
  conversation_id: z.string().optional(),
  in_reply_to_user_id: z.string().optional(),
  edit_history_tweet_ids: z.array(z.string()).optional(),
  attachments: TweetAttachmentsSchema.optional(),
  public_metrics: TweetPublicMetricsSchema.optional(),
  entities: TweetEntitiesSchema.optional(),
  referenced_tweets: z.array(ReferencedTweetSchema).optional(),
});

export type Tweet = z.infer<typeof TweetSchema>;

/**
 * Request body for creating a new tweet
 */
export const CreateTweetRequestSchema = z.object({
  text: z.string().max(280),
  reply: z
    .object({
      in_reply_to_tweet_id: z.string(),
      exclude_reply_user_ids: z.array(z.string()).optional(),
    })
    .optional(),
  quote_tweet_id: z.string().optional(),
  media: z
    .object({
      media_ids: z.array(z.string()),
      tagged_user_ids: z.array(z.string()).optional(),
    })
    .optional(),
  poll: z
    .object({
      options: z.array(z.string()).min(2).max(4),
      duration_minutes: z.number().min(5).max(10080),
    })
    .optional(),
  reply_settings: z.enum(["everyone", "mentionedUsers", "following"]).optional(),
});

export type CreateTweetRequest = z.infer<typeof CreateTweetRequestSchema>;

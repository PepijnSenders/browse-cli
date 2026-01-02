import { z } from "zod";

/**
 * Public metrics for a user profile
 */
export const UserPublicMetricsSchema = z.object({
  followers_count: z.number(),
  following_count: z.number(),
  tweet_count: z.number(),
  listed_count: z.number(),
  like_count: z.number().optional(),
});

export type UserPublicMetrics = z.infer<typeof UserPublicMetricsSchema>;

/**
 * X (Twitter) User schema
 * Matches X API v2 user object structure
 */
export const UserSchema = z.object({
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
  public_metrics: UserPublicMetricsSchema.optional(),
  pinned_tweet_id: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

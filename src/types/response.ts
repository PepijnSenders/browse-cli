import { z } from "zod";
import { UserSchema } from "./user.js";
import { TweetSchema } from "./tweet.js";
import { MediaSchema } from "./media.js";
import { PollSchema } from "./poll.js";
import { PlaceSchema } from "./place.js";

/**
 * Includes object containing expanded data
 * Used when requesting expansions in API calls
 */
export const IncludesSchema = z.object({
  users: z.array(UserSchema).optional(),
  tweets: z.array(TweetSchema).optional(),
  media: z.array(MediaSchema).optional(),
  polls: z.array(PollSchema).optional(),
  places: z.array(PlaceSchema).optional(),
});

export type Includes = z.infer<typeof IncludesSchema>;

/**
 * Pagination metadata for list responses
 */
export const PaginationMetaSchema = z.object({
  result_count: z.number(),
  next_token: z.string().optional(),
  previous_token: z.string().optional(),
  newest_id: z.string().optional(),
  oldest_id: z.string().optional(),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Factory for creating single resource response schemas
 */
export function createSingleResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T
) {
  return z.object({
    data: dataSchema,
    includes: IncludesSchema.optional(),
  });
}

/**
 * Factory for creating paginated response schemas
 */
export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(
  dataSchema: T
) {
  return z.object({
    data: z.array(dataSchema),
    meta: PaginationMetaSchema.optional(),
    includes: IncludesSchema.optional(),
  });
}

/**
 * Single tweet response
 */
export const SingleTweetResponseSchema = createSingleResponseSchema(TweetSchema);
export type SingleTweetResponse = z.infer<typeof SingleTweetResponseSchema>;

/**
 * Paginated tweets response
 */
export const PaginatedTweetsResponseSchema =
  createPaginatedResponseSchema(TweetSchema);
export type PaginatedTweetsResponse = z.infer<
  typeof PaginatedTweetsResponseSchema
>;

/**
 * Single user response
 */
export const SingleUserResponseSchema = createSingleResponseSchema(UserSchema);
export type SingleUserResponse = z.infer<typeof SingleUserResponseSchema>;

/**
 * Paginated users response
 */
export const PaginatedUsersResponseSchema =
  createPaginatedResponseSchema(UserSchema);
export type PaginatedUsersResponse = z.infer<
  typeof PaginatedUsersResponseSchema
>;

import { z } from "zod";
import { getClient } from "./client.js";
import { PaginatedTweetsResponseSchema } from "../types/index.js";
import type { PaginationOptions } from "./posts.js";

/**
 * Tweet fields for bookmark responses
 */
const TWEET_FIELDS = [
  "id",
  "text",
  "author_id",
  "created_at",
  "public_metrics",
  "entities",
];

const USER_FIELDS = [
  "id",
  "name",
  "username",
  "verified",
  "verified_type",
];

const TWEET_EXPANSIONS = ["author_id"];

/**
 * Response schema for like/unlike operations
 */
const LikeResponseSchema = z.object({
  data: z.object({
    liked: z.boolean(),
  }),
});

/**
 * Response schema for retweet/unretweet operations
 */
const RetweetResponseSchema = z.object({
  data: z.object({
    retweeted: z.boolean(),
  }),
});

/**
 * Response schema for bookmark operations
 */
const BookmarkResponseSchema = z.object({
  data: z.object({
    bookmarked: z.boolean(),
  }),
});

/**
 * Like a tweet
 */
export async function likeTweet(userId: string, tweetId: string) {
  const client = getClient();
  const response = await client.post(`/users/${userId}/likes`, LikeResponseSchema, {
    tweet_id: tweetId,
  });
  return response.data.liked;
}

/**
 * Unlike a tweet
 */
export async function unlikeTweet(userId: string, tweetId: string) {
  const client = getClient();
  const response = await client.delete(
    `/users/${userId}/likes/${tweetId}`,
    LikeResponseSchema
  );
  return !response.data.liked;
}

/**
 * Retweet a tweet
 */
export async function retweet(userId: string, tweetId: string) {
  const client = getClient();
  const response = await client.post(
    `/users/${userId}/retweets`,
    RetweetResponseSchema,
    {
      tweet_id: tweetId,
    }
  );
  return response.data.retweeted;
}

/**
 * Unretweet a tweet
 */
export async function unretweet(userId: string, tweetId: string) {
  const client = getClient();
  const response = await client.delete(
    `/users/${userId}/retweets/${tweetId}`,
    RetweetResponseSchema
  );
  return !response.data.retweeted;
}

/**
 * Bookmark a tweet
 */
export async function bookmarkTweet(userId: string, tweetId: string) {
  const client = getClient();
  const response = await client.post(
    `/users/${userId}/bookmarks`,
    BookmarkResponseSchema,
    {
      tweet_id: tweetId,
    }
  );
  return response.data.bookmarked;
}

/**
 * Remove bookmark from a tweet
 */
export async function removeBookmark(userId: string, tweetId: string) {
  const client = getClient();
  const response = await client.delete(
    `/users/${userId}/bookmarks/${tweetId}`,
    BookmarkResponseSchema
  );
  return !response.data.bookmarked;
}

/**
 * Get bookmarked tweets
 */
export async function getBookmarks(
  userId: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
    max_results: options.max_results?.toString() ?? "10",
    pagination_token: options.pagination_token,
  };

  const response = await client.get(
    `/users/${userId}/bookmarks`,
    PaginatedTweetsResponseSchema,
    params
  );
  return response;
}

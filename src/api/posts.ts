import { z } from "zod";
import { getClient } from "./client.js";
import {
  SingleTweetResponseSchema,
  PaginatedTweetsResponseSchema,
  CreateTweetRequestSchema,
  type CreateTweetRequest,
} from "../types/index.js";

/**
 * Tweet fields to request from API
 */
const TWEET_FIELDS = [
  "id",
  "text",
  "author_id",
  "created_at",
  "conversation_id",
  "in_reply_to_user_id",
  "edit_history_tweet_ids",
  "attachments",
  "public_metrics",
  "entities",
  "referenced_tweets",
];

/**
 * Expansions to include with tweets
 */
const TWEET_EXPANSIONS = ["author_id", "referenced_tweets.id"];

/**
 * User fields to include when expanding author
 */
const USER_FIELDS = [
  "id",
  "name",
  "username",
  "verified",
  "verified_type",
  "profile_image_url",
];

/**
 * Response schema for delete operations
 */
const DeleteResponseSchema = z.object({
  data: z.object({
    deleted: z.boolean(),
  }),
});

/**
 * Response schema for create operations
 */
const CreateTweetResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    text: z.string(),
  }),
});

/**
 * Get a single tweet by ID
 */
export async function getTweet(id: string) {
  const client = getClient();
  const response = await client.get(`/tweets/${id}`, SingleTweetResponseSchema, {
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
  });
  return response;
}

/**
 * Create a new tweet
 */
export async function createTweet(request: CreateTweetRequest) {
  const client = getClient();
  const validated = CreateTweetRequestSchema.parse(request);
  const response = await client.post(
    "/tweets",
    CreateTweetResponseSchema,
    validated
  );
  return response.data;
}

/**
 * Delete a tweet
 */
export async function deleteTweet(id: string) {
  const client = getClient();
  const response = await client.delete(`/tweets/${id}`, DeleteResponseSchema);
  return response.data.deleted;
}

/**
 * Reply to a tweet
 */
export async function replyToTweet(tweetId: string, text: string) {
  return createTweet({
    text,
    reply: {
      in_reply_to_tweet_id: tweetId,
    },
  });
}

/**
 * Quote a tweet
 */
export async function quoteTweet(tweetId: string, text: string) {
  return createTweet({
    text,
    quote_tweet_id: tweetId,
  });
}

/**
 * Pagination options for timeline/search
 */
export interface PaginationOptions {
  max_results?: number;
  since_id?: string;
  until_id?: string;
  pagination_token?: string;
}

/**
 * Get home timeline for authenticated user
 */
export async function getHomeTimeline(
  userId: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
    max_results: options.max_results?.toString() ?? "10",
    since_id: options.since_id,
    until_id: options.until_id,
    pagination_token: options.pagination_token,
  };

  const response = await client.get(
    `/users/${userId}/reverse_chronological_timeline`,
    PaginatedTweetsResponseSchema,
    params
  );
  return response;
}

/**
 * Get user timeline (their tweets)
 */
export async function getUserTimeline(
  userId: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
    max_results: options.max_results?.toString() ?? "10",
    since_id: options.since_id,
    until_id: options.until_id,
    pagination_token: options.pagination_token,
  };

  const response = await client.get(
    `/users/${userId}/tweets`,
    PaginatedTweetsResponseSchema,
    params
  );
  return response;
}

/**
 * Get mentions for authenticated user
 */
export async function getMentions(
  userId: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
    max_results: options.max_results?.toString() ?? "10",
    since_id: options.since_id,
    until_id: options.until_id,
    pagination_token: options.pagination_token,
  };

  const response = await client.get(
    `/users/${userId}/mentions`,
    PaginatedTweetsResponseSchema,
    params
  );
  return response;
}

/**
 * Search recent tweets
 */
export async function searchTweets(
  query: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    query,
    "tweet.fields": TWEET_FIELDS,
    expansions: TWEET_EXPANSIONS,
    "user.fields": USER_FIELDS,
    max_results: options.max_results?.toString() ?? "10",
    since_id: options.since_id,
    until_id: options.until_id,
    next_token: options.pagination_token,
  };

  const response = await client.get(
    "/tweets/search/recent",
    PaginatedTweetsResponseSchema,
    params
  );
  return response;
}

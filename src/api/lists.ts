import { z } from "zod";
import { getClient } from "./client.js";
import {
  ListSchema,
  CreateListRequestSchema,
  UpdateListRequestSchema,
  PaginatedTweetsResponseSchema,
  PaginatedUsersResponseSchema,
  type CreateListRequest,
  type UpdateListRequest,
} from "../types/index.js";
import type { PaginationOptions } from "./posts.js";

/**
 * List fields to request from API
 */
const LIST_FIELDS = [
  "id",
  "name",
  "description",
  "owner_id",
  "private",
  "member_count",
  "follower_count",
  "created_at",
];

/**
 * Tweet fields for list timeline
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
  "profile_image_url",
  "public_metrics",
];

const TWEET_EXPANSIONS = ["author_id"];

/**
 * Single list response schema
 */
const SingleListResponseSchema = z.object({
  data: ListSchema,
});

/**
 * Paginated lists response schema
 */
const PaginatedListsResponseSchema = z.object({
  data: z.array(ListSchema).optional(),
  meta: z
    .object({
      result_count: z.number(),
      next_token: z.string().optional(),
      previous_token: z.string().optional(),
    })
    .optional(),
});

/**
 * Response schema for create operations
 */
const CreateListResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

/**
 * Response schema for delete operations
 */
const DeleteResponseSchema = z.object({
  data: z.object({
    deleted: z.boolean(),
  }),
});

/**
 * Response schema for update operations
 */
const UpdateListResponseSchema = z.object({
  data: z.object({
    updated: z.boolean(),
  }),
});

/**
 * Response schema for member operations
 */
const MemberResponseSchema = z.object({
  data: z.object({
    is_member: z.boolean(),
  }),
});

/**
 * Response schema for follow operations
 */
const FollowListResponseSchema = z.object({
  data: z.object({
    following: z.boolean(),
  }),
});

/**
 * Response schema for pin operations
 */
const PinListResponseSchema = z.object({
  data: z.object({
    pinned: z.boolean(),
  }),
});

/**
 * Get a list by ID
 */
export async function getList(id: string) {
  const client = getClient();
  const response = await client.get(`/lists/${id}`, SingleListResponseSchema, {
    "list.fields": LIST_FIELDS,
  });
  return response.data;
}

/**
 * Create a new list
 */
export async function createList(request: CreateListRequest) {
  const client = getClient();
  const validated = CreateListRequestSchema.parse(request);
  const response = await client.post(
    "/lists",
    CreateListResponseSchema,
    validated
  );
  return response.data;
}

/**
 * Update a list
 */
export async function updateList(id: string, request: UpdateListRequest) {
  const client = getClient();
  const validated = UpdateListRequestSchema.parse(request);
  const response = await client.put(
    `/lists/${id}`,
    UpdateListResponseSchema,
    validated
  );
  return response.data.updated;
}

/**
 * Delete a list
 */
export async function deleteList(id: string) {
  const client = getClient();
  const response = await client.delete(`/lists/${id}`, DeleteResponseSchema);
  return response.data.deleted;
}

/**
 * Get list timeline (tweets from list members)
 */
export async function getListTimeline(
  listId: string,
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
    `/lists/${listId}/tweets`,
    PaginatedTweetsResponseSchema,
    params
  );
  return response;
}

/**
 * Get lists owned by a user
 */
export async function getOwnedLists(
  userId: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    "list.fields": LIST_FIELDS,
    max_results: options.max_results?.toString() ?? "100",
    pagination_token: options.pagination_token,
  };

  const response = await client.get(
    `/users/${userId}/owned_lists`,
    PaginatedListsResponseSchema,
    params
  );
  return response;
}

/**
 * Get lists followed by a user
 */
export async function getFollowedLists(
  userId: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    "list.fields": LIST_FIELDS,
    max_results: options.max_results?.toString() ?? "100",
    pagination_token: options.pagination_token,
  };

  const response = await client.get(
    `/users/${userId}/followed_lists`,
    PaginatedListsResponseSchema,
    params
  );
  return response;
}

/**
 * Get pinned lists for a user
 */
export async function getPinnedLists(userId: string) {
  const client = getClient();
  const response = await client.get(
    `/users/${userId}/pinned_lists`,
    PaginatedListsResponseSchema,
    {
      "list.fields": LIST_FIELDS,
    }
  );
  return response;
}

/**
 * Get list members
 */
export async function getListMembers(
  listId: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    "user.fields": USER_FIELDS,
    max_results: options.max_results?.toString() ?? "100",
    pagination_token: options.pagination_token,
  };

  const response = await client.get(
    `/lists/${listId}/members`,
    PaginatedUsersResponseSchema,
    params
  );
  return response;
}

/**
 * Add a member to a list
 */
export async function addListMember(listId: string, userId: string) {
  const client = getClient();
  const response = await client.post(
    `/lists/${listId}/members`,
    MemberResponseSchema,
    { user_id: userId }
  );
  return response.data.is_member;
}

/**
 * Remove a member from a list
 */
export async function removeListMember(listId: string, userId: string) {
  const client = getClient();
  const response = await client.delete(
    `/lists/${listId}/members/${userId}`,
    MemberResponseSchema
  );
  return !response.data.is_member;
}

/**
 * Follow a list
 */
export async function followList(userId: string, listId: string) {
  const client = getClient();
  const response = await client.post(
    `/users/${userId}/followed_lists`,
    FollowListResponseSchema,
    { list_id: listId }
  );
  return response.data.following;
}

/**
 * Unfollow a list
 */
export async function unfollowList(userId: string, listId: string) {
  const client = getClient();
  const response = await client.delete(
    `/users/${userId}/followed_lists/${listId}`,
    FollowListResponseSchema
  );
  return !response.data.following;
}

/**
 * Pin a list
 */
export async function pinList(userId: string, listId: string) {
  const client = getClient();
  const response = await client.post(
    `/users/${userId}/pinned_lists`,
    PinListResponseSchema,
    { list_id: listId }
  );
  return response.data.pinned;
}

/**
 * Unpin a list
 */
export async function unpinList(userId: string, listId: string) {
  const client = getClient();
  const response = await client.delete(
    `/users/${userId}/pinned_lists/${listId}`,
    PinListResponseSchema
  );
  return !response.data.pinned;
}

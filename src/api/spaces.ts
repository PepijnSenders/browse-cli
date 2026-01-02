import { z } from "zod";
import { getClient } from "./client.js";
import { SpaceSchema } from "../types/index.js";
import { UserSchema } from "../types/user.js";
import type { PaginationOptions } from "./posts.js";

/**
 * Space fields to request from API
 */
const SPACE_FIELDS = [
  "id",
  "state",
  "title",
  "host_ids",
  "speaker_ids",
  "participant_count",
  "scheduled_start",
  "started_at",
  "ended_at",
  "is_ticketed",
  "lang",
];

/**
 * User fields for expansion
 */
const USER_FIELDS = [
  "id",
  "name",
  "username",
  "profile_image_url",
];

/**
 * Single space response
 */
const SingleSpaceResponseSchema = z.object({
  data: SpaceSchema,
  includes: z.object({
    users: z.array(UserSchema).optional(),
  }).optional(),
});

/**
 * Multiple spaces response
 */
const SpacesResponseSchema = z.object({
  data: z.array(SpaceSchema).optional(),
  includes: z.object({
    users: z.array(UserSchema).optional(),
  }).optional(),
  meta: z.object({
    result_count: z.number(),
  }).optional(),
});

/**
 * Space search response
 */
const SpaceSearchResponseSchema = z.object({
  data: z.array(SpaceSchema).optional(),
  includes: z.object({
    users: z.array(UserSchema).optional(),
  }).optional(),
  meta: z.object({
    result_count: z.number(),
  }).optional(),
});

/**
 * Space buyers response
 */
const SpaceBuyersResponseSchema = z.object({
  data: z.array(UserSchema).optional(),
  meta: z.object({
    result_count: z.number(),
    next_token: z.string().optional(),
    previous_token: z.string().optional(),
  }).optional(),
});

/**
 * Get a space by ID
 */
export async function getSpace(id: string) {
  const client = getClient();
  const response = await client.get(
    `/spaces/${id}`,
    SingleSpaceResponseSchema,
    {
      "space.fields": SPACE_FIELDS,
      "user.fields": USER_FIELDS,
      expansions: ["host_ids", "speaker_ids"],
    }
  );
  return { space: response.data, users: response.includes?.users };
}

/**
 * Get multiple spaces by IDs
 */
export async function getSpaces(ids: string[]) {
  const client = getClient();
  const response = await client.get(
    "/spaces",
    SpacesResponseSchema,
    {
      ids: ids,
      "space.fields": SPACE_FIELDS,
      "user.fields": USER_FIELDS,
      expansions: ["host_ids", "speaker_ids"],
    }
  );
  return { spaces: response.data || [], users: response.includes?.users };
}

/**
 * Search for spaces
 */
export async function searchSpaces(
  query: string,
  options: { state?: "live" | "scheduled" | "all"; max_results?: number } = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    query,
    "space.fields": SPACE_FIELDS,
    "user.fields": USER_FIELDS,
    expansions: ["host_ids", "speaker_ids"],
    max_results: options.max_results?.toString() ?? "10",
  };

  if (options.state && options.state !== "all") {
    params.state = options.state;
  }

  const response = await client.get(
    "/spaces/search",
    SpaceSearchResponseSchema,
    params
  );
  return { spaces: response.data || [], users: response.includes?.users };
}

/**
 * Get spaces by creator IDs
 */
export async function getSpacesByCreators(creatorIds: string[]) {
  const client = getClient();
  const response = await client.get(
    "/spaces/by/creator_ids",
    SpacesResponseSchema,
    {
      user_ids: creatorIds,
      "space.fields": SPACE_FIELDS,
      "user.fields": USER_FIELDS,
      expansions: ["host_ids", "speaker_ids"],
    }
  );
  return { spaces: response.data || [], users: response.includes?.users };
}

/**
 * Get buyers of a ticketed space
 */
export async function getSpaceBuyers(
  spaceId: string,
  options: PaginationOptions = {}
) {
  const client = getClient();
  const params: Record<string, string | string[] | undefined> = {
    "user.fields": USER_FIELDS,
    max_results: options.max_results?.toString() ?? "100",
    pagination_token: options.pagination_token,
  };

  const response = await client.get(
    `/spaces/${spaceId}/buyers`,
    SpaceBuyersResponseSchema,
    params
  );
  return response;
}

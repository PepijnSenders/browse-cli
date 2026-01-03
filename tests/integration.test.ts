/**
 * Integration Tests (E2E Flows)
 *
 * These tests require real API credentials and make actual API calls.
 * They are skipped by default and only run when:
 * - RUN_INTEGRATION_TESTS=true environment variable is set
 * - Valid authentication tokens exist
 *
 * To run: RUN_INTEGRATION_TESTS=true bun test tests/integration.test.ts
 */

import { describe, test, expect, beforeAll } from "bun:test";
import { existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// Check if integration tests should run
const SHOULD_RUN = process.env.RUN_INTEGRATION_TESTS === "true";
const TOKEN_PATH = join(homedir(), ".config", "x-cli", "tokens.json");
const HAS_TOKENS = existsSync(TOKEN_PATH);

// Skip helper - wraps test to skip if conditions not met
const integrationTest = SHOULD_RUN && HAS_TOKENS ? test : test.skip;

describe("Integration Tests", () => {
  beforeAll(() => {
    if (!SHOULD_RUN) {
      console.log("Skipping integration tests (set RUN_INTEGRATION_TESTS=true to run)");
    } else if (!HAS_TOKENS) {
      console.log("Skipping integration tests (no tokens found, run 'x auth login' first)");
    }
  });

  describe("Authentication", () => {
    integrationTest("x auth status returns current user", async () => {
      const { getMe } = await import("../src/api/users.js");
      const user = await getMe();

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBeDefined();
    });
  });

  describe("Timeline", () => {
    integrationTest("x timeline home returns posts", async () => {
      const { getMe } = await import("../src/api/users.js");
      const { getHomeTimeline } = await import("../src/api/posts.js");

      const me = await getMe();
      const result = await getHomeTimeline(me.id, { max_results: 5 });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    integrationTest("x timeline mentions returns mentions", async () => {
      const { getMe } = await import("../src/api/users.js");
      const { getMentions } = await import("../src/api/posts.js");

      const me = await getMe();
      const result = await getMentions(me.id, { max_results: 5 });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("User Lookup", () => {
    integrationTest("x user <username> returns user profile", async () => {
      const { getUserByUsername } = await import("../src/api/users.js");

      // Use a well-known account that's unlikely to be deleted
      const user = await getUserByUsername("X");

      expect(user).toBeDefined();
      expect(user.username.toLowerCase()).toBe("x");
    });
  });

  describe("Search", () => {
    integrationTest("x search returns results", async () => {
      const { searchTweets } = await import("../src/api/posts.js");

      const result = await searchTweets("hello", { max_results: 10 });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    });
  });

  describe("Post Lifecycle", () => {
    let createdPostId: string | null = null;

    integrationTest("x post create creates a new post", async () => {
      const { createTweet } = await import("../src/api/posts.js");

      // Create a unique test post
      const timestamp = Date.now();
      const result = await createTweet({
        text: `Integration test post ${timestamp} - will be deleted`,
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      createdPostId = result.id;
    });

    integrationTest("x post get retrieves the created post", async () => {
      if (!createdPostId) {
        console.log("Skipping - no post was created");
        return;
      }

      const { getTweet } = await import("../src/api/posts.js");
      const tweet = await getTweet(createdPostId);

      expect(tweet).toBeDefined();
      expect(tweet.id).toBe(createdPostId);
    });

    integrationTest("x post delete removes the post", async () => {
      if (!createdPostId) {
        console.log("Skipping - no post was created");
        return;
      }

      const { deleteTweet } = await import("../src/api/posts.js");
      const deleted = await deleteTweet(createdPostId);

      expect(deleted).toBe(true);
      createdPostId = null;
    });
  });

  describe("Engagement", () => {
    // Note: These tests use a well-known post ID
    // In a real test suite, you'd create a test post first
    const TEST_POST_ID = "1445078208190291973"; // Example: Twitter's "hello world" post

    integrationTest("x like and unlike work", async () => {
      const { getMe } = await import("../src/api/users.js");
      const { likeTweet, unlikeTweet } = await import("../src/api/engagement.js");

      const me = await getMe();

      // Like the post
      const liked = await likeTweet(me.id, TEST_POST_ID);
      expect(liked).toBe(true);

      // Unlike it
      const unliked = await unlikeTweet(me.id, TEST_POST_ID);
      expect(unliked).toBe(true);
    });
  });

  describe("Bookmarks", () => {
    integrationTest("x bookmark list returns bookmarks", async () => {
      const { getMe } = await import("../src/api/users.js");
      const { getBookmarks } = await import("../src/api/engagement.js");

      const me = await getMe();
      const result = await getBookmarks(me.id, { max_results: 5 });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe("Following", () => {
    integrationTest("x following returns list", async () => {
      const { getMe } = await import("../src/api/users.js");
      const { getFollowing } = await import("../src/api/relationships.js");

      const me = await getMe();
      const result = await getFollowing(me.id, { max_results: 10 });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    integrationTest("x followers returns list", async () => {
      const { getMe } = await import("../src/api/users.js");
      const { getFollowers } = await import("../src/api/relationships.js");

      const me = await getMe();
      const result = await getFollowers(me.id, { max_results: 10 });

      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});

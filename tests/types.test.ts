import { describe, expect, test } from "bun:test";
import {
  UserSchema,
  TweetSchema,
  MediaSchema,
  ListSchema,
  SpaceSchema,
  DMEventSchema,
  createSingleResponseSchema,
  createPaginatedResponseSchema,
  XCLIError,
  ErrorCode,
  AuthError,
  RateLimitError,
} from "../src/types";

describe("User Schema", () => {
  test("parses valid user", () => {
    const user = {
      id: "123",
      name: "Test User",
      username: "testuser",
    };
    const result = UserSchema.parse(user);
    expect(result.id).toBe("123");
    expect(result.username).toBe("testuser");
  });

  test("parses user with optional fields", () => {
    const user = {
      id: "123",
      name: "Test User",
      username: "testuser",
      description: "A test user",
      verified: true,
      verified_type: "blue" as const,
      public_metrics: {
        followers_count: 100,
        following_count: 50,
        tweet_count: 200,
        listed_count: 5,
      },
    };
    const result = UserSchema.parse(user);
    expect(result.verified).toBe(true);
    expect(result.verified_type).toBe("blue");
    expect(result.public_metrics?.followers_count).toBe(100);
  });

  test("rejects invalid user", () => {
    const user = {
      id: 123, // should be string
      name: "Test User",
    };
    expect(() => UserSchema.parse(user)).toThrow();
  });
});

describe("Tweet Schema", () => {
  test("parses valid tweet", () => {
    const tweet = {
      id: "456",
      text: "Hello, world!",
    };
    const result = TweetSchema.parse(tweet);
    expect(result.id).toBe("456");
    expect(result.text).toBe("Hello, world!");
  });

  test("parses tweet with metrics", () => {
    const tweet = {
      id: "456",
      text: "Hello, world!",
      public_metrics: {
        retweet_count: 10,
        reply_count: 5,
        like_count: 100,
        quote_count: 2,
      },
    };
    const result = TweetSchema.parse(tweet);
    expect(result.public_metrics?.like_count).toBe(100);
  });

  test("parses tweet with entities", () => {
    const tweet = {
      id: "456",
      text: "Hello @user #tag",
      entities: {
        mentions: [{ start: 6, end: 11, username: "user" }],
        hashtags: [{ start: 12, end: 16, tag: "tag" }],
      },
    };
    const result = TweetSchema.parse(tweet);
    expect(result.entities?.mentions?.[0].username).toBe("user");
    expect(result.entities?.hashtags?.[0].tag).toBe("tag");
  });
});

describe("Media Schema", () => {
  test("parses photo media", () => {
    const media = {
      media_key: "media_123",
      type: "photo" as const,
      url: "https://example.com/photo.jpg",
    };
    const result = MediaSchema.parse(media);
    expect(result.type).toBe("photo");
  });

  test("parses video media with variants", () => {
    const media = {
      media_key: "media_456",
      type: "video" as const,
      duration_ms: 30000,
      variants: [
        { content_type: "video/mp4", url: "https://example.com/video.mp4" },
      ],
    };
    const result = MediaSchema.parse(media);
    expect(result.type).toBe("video");
    expect(result.variants?.[0].content_type).toBe("video/mp4");
  });
});

describe("Response Wrappers", () => {
  test("creates single response schema", () => {
    const SingleUserResponse = createSingleResponseSchema(UserSchema);
    const response = {
      data: {
        id: "123",
        name: "Test User",
        username: "testuser",
      },
    };
    const result = SingleUserResponse.parse(response);
    expect(result.data.username).toBe("testuser");
  });

  test("creates paginated response schema", () => {
    const PaginatedTweetResponse = createPaginatedResponseSchema(TweetSchema);
    const response = {
      data: [
        { id: "1", text: "First tweet" },
        { id: "2", text: "Second tweet" },
      ],
      meta: {
        result_count: 2,
        next_token: "token123",
      },
    };
    const result = PaginatedTweetResponse.parse(response);
    expect(result.data).toHaveLength(2);
    expect(result.meta?.next_token).toBe("token123");
  });
});

describe("Error Classes", () => {
  test("XCLIError has correct properties", () => {
    const error = new XCLIError("Test error", ErrorCode.API_ERROR);
    expect(error.message).toBe("Test error");
    expect(error.code).toBe("API_ERROR");
    expect(error.toJSON()).toEqual({
      error: "Test error",
      code: "API_ERROR",
    });
  });

  test("AuthError defaults to AUTH_REQUIRED", () => {
    const error = new AuthError("Not logged in");
    expect(error.code).toBe("AUTH_REQUIRED");
  });

  test("AuthError uses AUTH_EXPIRED when specified", () => {
    const error = new AuthError("Token expired", true);
    expect(error.code).toBe("AUTH_EXPIRED");
  });

  test("RateLimitError includes retry info", () => {
    const error = new RateLimitError("Too many requests", 900);
    expect(error.code).toBe("RATE_LIMITED");
    expect(error.retryAfter).toBe(900);
  });
});

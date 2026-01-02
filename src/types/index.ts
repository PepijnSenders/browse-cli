/**
 * X-CLI Type Definitions
 *
 * Type-first approach using Zod schemas with inferred TypeScript types.
 * All API responses are validated at runtime.
 */

// User types
export {
  UserSchema,
  UserPublicMetricsSchema,
  type User,
  type UserPublicMetrics,
} from "./user.js";

// Tweet types
export {
  TweetSchema,
  TweetPublicMetricsSchema,
  TweetEntitiesSchema,
  TweetAttachmentsSchema,
  UrlEntitySchema,
  MentionEntitySchema,
  HashtagEntitySchema,
  CashtagEntitySchema,
  ReferencedTweetSchema,
  CreateTweetRequestSchema,
  type Tweet,
  type TweetPublicMetrics,
  type TweetEntities,
  type TweetAttachments,
  type UrlEntity,
  type MentionEntity,
  type HashtagEntity,
  type CashtagEntity,
  type ReferencedTweet,
  type CreateTweetRequest,
} from "./tweet.js";

// Media types
export {
  MediaSchema,
  MediaVariantSchema,
  type Media,
  type MediaVariant,
} from "./media.js";

// List types
export {
  ListSchema,
  CreateListRequestSchema,
  UpdateListRequestSchema,
  type List,
  type CreateListRequest,
  type UpdateListRequest,
} from "./list.js";

// Space types
export { SpaceSchema, type Space } from "./space.js";

// DM types
export {
  DMEventSchema,
  DMConversationSchema,
  DMEventTypeSchema,
  DMAttachmentsSchema,
  DMReferencedTweetSchema,
  SendDMRequestSchema,
  type DMEvent,
  type DMConversation,
  type DMEventType,
  type DMAttachments,
  type DMReferencedTweet,
  type SendDMRequest,
} from "./dm.js";

// Poll types
export {
  PollSchema,
  PollOptionSchema,
  type Poll,
  type PollOption,
} from "./poll.js";

// Place types
export {
  PlaceSchema,
  GeoSchema,
  type Place,
  type Geo,
} from "./place.js";

// Response wrapper types
export {
  IncludesSchema,
  PaginationMetaSchema,
  createSingleResponseSchema,
  createPaginatedResponseSchema,
  SingleTweetResponseSchema,
  PaginatedTweetsResponseSchema,
  SingleUserResponseSchema,
  PaginatedUsersResponseSchema,
  type Includes,
  type PaginationMeta,
  type SingleTweetResponse,
  type PaginatedTweetsResponse,
  type SingleUserResponse,
  type PaginatedUsersResponse,
} from "./response.js";

// Error types
export {
  APIErrorDetailSchema,
  APIErrorResponseSchema,
  ErrorCode,
  XCLIError,
  AuthError,
  RateLimitError,
  APIError,
  ValidationError,
  ConfigError,
  NetworkError,
  type APIErrorDetail,
  type APIErrorResponse,
} from "./errors.js";

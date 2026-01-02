import { z } from "zod";

/**
 * Direct Message event types
 */
export const DMEventTypeSchema = z.enum([
  "MessageCreate",
  "ParticipantsJoin",
  "ParticipantsLeave",
]);

export type DMEventType = z.infer<typeof DMEventTypeSchema>;

/**
 * DM attachments
 */
export const DMAttachmentsSchema = z.object({
  media_keys: z.array(z.string()).optional(),
});

export type DMAttachments = z.infer<typeof DMAttachmentsSchema>;

/**
 * Referenced tweet in a DM
 */
export const DMReferencedTweetSchema = z.object({
  id: z.string(),
});

export type DMReferencedTweet = z.infer<typeof DMReferencedTweetSchema>;

/**
 * X (Twitter) Direct Message Event schema
 */
export const DMEventSchema = z.object({
  id: z.string(),
  event_type: DMEventTypeSchema,
  text: z.string().optional(),
  sender_id: z.string(),
  participant_ids: z.array(z.string()).optional(),
  dm_conversation_id: z.string(),
  created_at: z.string(),
  attachments: DMAttachmentsSchema.optional(),
  referenced_tweets: z.array(DMReferencedTweetSchema).optional(),
});

export type DMEvent = z.infer<typeof DMEventSchema>;

/**
 * DM Conversation type
 */
export const DMConversationTypeSchema = z.enum(["one_to_one", "group"]);

export type DMConversationType = z.infer<typeof DMConversationTypeSchema>;

/**
 * X (Twitter) DM Conversation schema
 */
export const DMConversationSchema = z.object({
  id: z.string(),
  type: DMConversationTypeSchema,
});

export type DMConversation = z.infer<typeof DMConversationSchema>;

/**
 * Request body for sending a DM
 */
export const SendDMRequestSchema = z.object({
  text: z.string(),
  attachments: z
    .array(
      z.object({
        media_id: z.string(),
      })
    )
    .optional(),
});

export type SendDMRequest = z.infer<typeof SendDMRequestSchema>;

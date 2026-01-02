import { z } from "zod";

/**
 * X (Twitter) List schema
 */
export const ListSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  owner_id: z.string().optional(),
  private: z.boolean().optional(),
  member_count: z.number().optional(),
  follower_count: z.number().optional(),
  created_at: z.string().optional(),
});

export type List = z.infer<typeof ListSchema>;

/**
 * Request body for creating a new list
 */
export const CreateListRequestSchema = z.object({
  name: z.string().max(25),
  description: z.string().max(100).optional(),
  private: z.boolean().optional(),
});

export type CreateListRequest = z.infer<typeof CreateListRequestSchema>;

/**
 * Request body for updating a list
 */
export const UpdateListRequestSchema = z.object({
  name: z.string().max(25).optional(),
  description: z.string().max(100).optional(),
  private: z.boolean().optional(),
});

export type UpdateListRequest = z.infer<typeof UpdateListRequestSchema>;

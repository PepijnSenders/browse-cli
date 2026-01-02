import { z } from "zod";

/**
 * Poll option with voting information
 */
export const PollOptionSchema = z.object({
  position: z.number(),
  label: z.string(),
  votes: z.number(),
});

export type PollOption = z.infer<typeof PollOptionSchema>;

/**
 * X (Twitter) Poll schema
 */
export const PollSchema = z.object({
  id: z.string(),
  options: z.array(PollOptionSchema),
  duration_minutes: z.number().optional(),
  end_datetime: z.string().optional(),
  voting_status: z.enum(["open", "closed"]).optional(),
});

export type Poll = z.infer<typeof PollSchema>;

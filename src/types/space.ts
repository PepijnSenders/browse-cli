import { z } from "zod";

/**
 * X (Twitter) Space schema
 * Represents audio conversation rooms
 */
export const SpaceSchema = z.object({
  id: z.string(),
  state: z.enum(["live", "scheduled", "ended"]),
  title: z.string().optional(),
  host_ids: z.array(z.string()).optional(),
  speaker_ids: z.array(z.string()).optional(),
  participant_count: z.number().optional(),
  scheduled_start: z.string().optional(),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
  is_ticketed: z.boolean().optional(),
  lang: z.string().optional(),
});

export type Space = z.infer<typeof SpaceSchema>;

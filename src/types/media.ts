import { z } from "zod";

/**
 * Media variant (different resolutions/formats)
 */
export const MediaVariantSchema = z.object({
  bit_rate: z.number().optional(),
  content_type: z.string(),
  url: z.string(),
});

export type MediaVariant = z.infer<typeof MediaVariantSchema>;

/**
 * X (Twitter) Media schema
 * Represents photos, videos, and animated GIFs
 */
export const MediaSchema = z.object({
  media_key: z.string(),
  type: z.enum(["photo", "video", "animated_gif"]),
  url: z.string().optional(),
  preview_image_url: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  duration_ms: z.number().optional(),
  alt_text: z.string().optional(),
  variants: z.array(MediaVariantSchema).optional(),
});

export type Media = z.infer<typeof MediaSchema>;

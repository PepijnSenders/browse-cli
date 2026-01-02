import { z } from "zod";

/**
 * Geographic coordinates
 */
export const GeoSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.tuple([z.number(), z.number()]),
});

export type Geo = z.infer<typeof GeoSchema>;

/**
 * X (Twitter) Place schema
 */
export const PlaceSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  name: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  place_type: z
    .enum(["city", "country", "neighborhood", "admin", "poi"])
    .optional(),
  geo: GeoSchema.optional(),
});

export type Place = z.infer<typeof PlaceSchema>;

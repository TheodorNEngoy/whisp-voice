import { z } from "zod";

export const uploadRequestSchema = z.object({
  contentType: z.string().min(1),
  ext: z.enum(["webm", "mp4", "m4a", "ogg"]),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024),
});

export const audioMetadataSchema = z.object({
  durationSec: z.number().positive().max(60),
  mime: z.string(),
  codec: z.string(),
  sizeBytes: z.number().int().positive(),
  waveformSmall: z.array(z.number()).max(256),
  loudnessLUFS: z.number(),
  hash: z.string().min(8),
  s3Key: z.string().min(5),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
export type AudioMetadata = z.infer<typeof audioMetadataSchema>;

export const rankingConfig = {
  socialBoostWeight: 0.15,
  timeHalfLifeHours: 8,
  gravity: 1.6,
} as const;

export interface RankedScore {
  wilson: number;
  hot: number;
  socialBoost: number;
  composite: number;
}

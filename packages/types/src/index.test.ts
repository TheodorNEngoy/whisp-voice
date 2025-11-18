import { describe, expect, it } from "vitest";
import { audioMetadataSchema, uploadRequestSchema } from "./index";

describe("shared schemas", () => {
  it("validates upload request", () => {
    const result = uploadRequestSchema.safeParse({
      contentType: "audio/webm",
      ext: "webm",
      sizeBytes: 1024,
    });
    expect(result.success).toBe(true);
  });

  it("rejects oversized files", () => {
    const result = uploadRequestSchema.safeParse({
      contentType: "audio/webm",
      ext: "webm",
      sizeBytes: 6 * 1024 * 1024,
    });
    expect(result.success).toBe(false);
  });

  it("exports audio metadata shape", () => {
    const parsed = audioMetadataSchema.safeParse({
      durationSec: 10,
      mime: "audio/webm",
      codec: "opus",
      sizeBytes: 1024,
      waveformSmall: [0, 0.1],
      loudnessLUFS: -16,
      hash: "abc12345",
      s3Key: "demo/key",
    });
    expect(parsed.success).toBe(true);
  });
});

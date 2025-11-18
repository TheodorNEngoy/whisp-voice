import crypto from "crypto";

export interface PresignedUpload {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  fields?: Record<string, string>;
  key: string;
  expiresAt: string;
}

export async function createPresignedUrl({
  contentType,
  ext,
}: {
  contentType: string;
  ext: string;
}): Promise<PresignedUpload> {
  const key = `audio/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 5).toISOString();
  if (process.env.MOCK_PRESIGN === "true") {
    return {
      url: `https://storage.local/${key}`,
      method: "PUT",
      headers: { "x-mock": "true", "content-type": contentType },
      key,
      expiresAt,
    };
  }
  return {
    url: process.env.S3_UPLOAD_URL || "https://example.com",
    method: "PUT",
    headers: { "content-type": contentType },
    key,
    expiresAt,
  };
}

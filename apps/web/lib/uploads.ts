"use client";

import { uploadRequestSchema } from "@whisp/types";

interface UploadArgs {
  file: File;
  waveform: number[];
  durationSec: number;
}

export async function uploadRecording({
  file,
  waveform,
  durationSec,
}: UploadArgs) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const body = uploadRequestSchema.parse({
    contentType: file.type,
    ext: file.name.split(".").pop() ?? "webm",
    sizeBytes: file.size,
  });

  const urlRes = await fetch("/api/upload-url", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

  if (!urlRes.ok) throw new Error("Failed to get upload URL");
  const presign = await urlRes.json();

  if (presign.fields) {
    const form = new FormData();
    Object.entries(presign.fields).forEach(([key, value]) =>
      form.append(key, value as string),
    );
    form.append("file", file);
    await fetch(presign.url, {
      method: "POST",
      body: form,
    });
  } else {
    await fetch(presign.url, {
      method: presign.method || "PUT",
      headers: {
        "Content-Type": file.type,
        ...(presign.headers || {}),
      },
      body: file,
    });
  }

  await fetch("/api/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      audio: {
        durationSec,
        mime: file.type,
        sizeBytes: file.size,
        codec: body.ext,
        waveformSmall: waveform,
        loudnessLUFS: -16,
        s3Key: presign.key,
        hash: hashHex,
      },
    }),
  });
}

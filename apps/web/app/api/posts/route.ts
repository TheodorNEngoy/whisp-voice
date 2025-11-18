import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { scoreTranscript, shouldQuarantine } from "@/lib/moderation";
import { resolveTranscriber } from "@/lib/transcriber";

const bodySchema = z.object({
  audio: z.object({
    durationSec: z.number(),
    mime: z.string(),
    codec: z.string(),
    sizeBytes: z.number(),
    hash: z.string(),
    waveformSmall: z.array(z.number()),
    loudnessLUFS: z.number(),
    s3Key: z.string(),
  }),
  caption: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User missing" }, { status: 404 });
  }

  const payload = bodySchema.parse(await request.json());
  const transcriber = resolveTranscriber();
  const transcript = await transcriber.transcribe(payload.audio.s3Key);
  const moderationScores = await scoreTranscript(transcript.text ?? "");
  const quarantined = shouldQuarantine(moderationScores);

  const audio = await prisma.audioAsset.create({
    data: {
      s3Key: payload.audio.s3Key,
      mime: payload.audio.mime,
      codec: payload.audio.codec,
      durationSec: payload.audio.durationSec,
      sizeBytes: payload.audio.sizeBytes,
      hash: payload.audio.hash,
      waveformSmall: payload.audio.waveformSmall,
      loudnessLUFS: payload.audio.loudnessLUFS,
    },
  });

  const post = await prisma.post.create({
    data: {
      authorId: user.id,
      audioId: audio.id,
      caption: payload.caption,
      visibility: quarantined ? "QUARANTINED" : "PUBLIC",
      transcript: transcript.text ?? null,
    },
  });

  await prisma.transcript.create({
    data: {
      audioId: audio.id,
      segments: transcript.segments.length
        ? {
            createMany: {
              data: transcript.segments.map((segment) => ({
                startMs: segment.startMs,
                endMs: segment.endMs,
                text: segment.text,
              })),
            },
          }
        : undefined,
    },
  });

  return NextResponse.json({ postId: post.id, quarantined });
}

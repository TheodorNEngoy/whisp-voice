import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { visibility: "QUARANTINED" },
    include: { author: true, audio: true },
  });
  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const { postId, note } = await request.json();
  console.info("moderation queue note", postId, note);
  return NextResponse.json({ ok: true });
}

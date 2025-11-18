import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  postId: z.string().uuid(),
  audioId: z.string().uuid(),
  type: z.string().default("vibe"),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user)
    return NextResponse.json({ error: "User missing" }, { status: 404 });
  const body = schema.parse(await request.json());
  const reaction = await prisma.reaction.create({
    data: {
      postId: body.postId,
      audioId: body.audioId,
      type: body.type,
      authorId: user.id,
    },
  });
  return NextResponse.json(reaction);
}

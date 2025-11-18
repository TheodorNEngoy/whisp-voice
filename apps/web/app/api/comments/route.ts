import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const commentSchema = z.object({
  postId: z.string().uuid(),
  audioId: z.string().uuid(),
  parentCommentId: z.string().uuid().optional(),
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
  const body = commentSchema.parse(await request.json());
  const comment = await prisma.comment.create({
    data: {
      postId: body.postId,
      authorId: user.id,
      audioId: body.audioId,
      parentCommentId: body.parentCommentId,
    },
  });
  return NextResponse.json(comment);
}

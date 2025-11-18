import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  postId: z.string().uuid(),
  action: z.enum(["approve", "reject", "ban"]),
});

export async function POST(request: NextRequest) {
  const body = schema.parse(await request.json());
  if (body.action === "approve") {
    await prisma.post.update({
      where: { id: body.postId },
      data: { visibility: "PUBLIC" },
    });
  } else if (body.action === "reject") {
    await prisma.post.update({
      where: { id: body.postId },
      data: { visibility: "REJECTED" },
    });
  } else if (body.action === "ban") {
    await prisma.post.update({
      where: { id: body.postId },
      data: { visibility: "BANNED" },
    });
  }
  return NextResponse.json({ ok: true });
}

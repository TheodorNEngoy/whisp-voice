import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  targetType: z.enum(["post", "user", "comment"]),
  targetId: z.string().uuid(),
  reason: z.string().min(3),
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
  const report = await prisma.report.create({
    data: {
      reporterId: user.id,
      targetType: body.targetType,
      targetId: body.targetId,
      reason: body.reason,
      status: "pending",
    },
  });
  return NextResponse.json(report);
}

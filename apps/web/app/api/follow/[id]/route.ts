import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user)
    return NextResponse.json({ error: "User missing" }, { status: 404 });
  await prisma.follow.create({
    data: {
      followerId: user.id,
      followingId: params.id,
    },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.email)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user)
    return NextResponse.json({ error: "User missing" }, { status: 404 });
  await prisma.follow.deleteMany({
    where: { followerId: user.id, followingId: params.id },
  });
  return NextResponse.json({ ok: true });
}

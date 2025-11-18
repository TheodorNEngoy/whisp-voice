import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeCompositeRank } from "@/lib/ranking";

export async function GET() {
  const posts = await prisma.post.findMany({
    include: {
      audio: true,
      author: true,
      _count: { select: { likes: true, reposts: true } },
    },
    take: 20,
    orderBy: { createdAt: "desc" },
  });

  const ranked = posts
    .map((post) => ({
      post,
      score: computeCompositeRank({
        upVotes: post._count.likes,
        downVotes: post._count.reposts,
        createdAt: post.createdAt,
        isFollowedAuthor: false,
      }),
    }))
    .sort((a, b) => b.score.composite - a.score.composite);

  return NextResponse.json({
    posts: ranked.map(({ post, score }) => ({ ...post, rank: score })),
  });
}

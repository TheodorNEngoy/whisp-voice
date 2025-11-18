import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@whisp.local" },
    update: {},
    create: {
      email: "demo@whisp.local",
      profile: {
        create: {
          displayName: "Demo",
          handle: "demo",
          bio: "First citizen of Whisp",
        },
      },
    },
  });

  const audio = await prisma.audioAsset.create({
    data: {
      s3Key: "seed/audio/demo.webm",
      mime: "audio/webm",
      codec: "opus",
      durationSec: 12,
      sizeBytes: 1024,
      hash: "seed-hash",
      waveformSmall: Array.from({ length: 32 }, (_, idx) => Math.sin(idx)),
      loudnessLUFS: -18,
    },
  });

  await prisma.post.create({
    data: {
      authorId: user.id,
      audioId: audio.id,
      caption: "Welcome to Whisp",
      visibility: "PUBLIC",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error);
    return prisma.$disconnect();
  });

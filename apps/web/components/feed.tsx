"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, WaveformPreview } from "@whisp/ui";
import { computeCompositeRank } from "@/lib/ranking";

export interface FeedItem {
  id: string;
  author: string;
  likes: number;
  reposts: number;
  createdAt: string;
  followed: boolean;
  waveform: number[];
  durationSec: number;
}

export default function Feed() {
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    setItems([
      {
        id: "demo-1",
        author: "@mila",
        likes: 32,
        reposts: 5,
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        followed: true,
        waveform: Array.from({ length: 64 }, (_, idx) => Math.sin(idx) * 0.6),
        durationSec: 23,
      },
      {
        id: "demo-2",
        author: "@sol",
        likes: 18,
        reposts: 2,
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        followed: false,
        waveform: Array.from({ length: 64 }, (_, idx) => Math.cos(idx) * 0.4),
        durationSec: 12,
      },
    ]);
  }, []);

  const ranked = useMemo(() => {
    return items
      .map((item) => ({
        item,
        score: computeCompositeRank({
          upVotes: item.likes,
          downVotes: Math.max(0, Math.floor(item.reposts * 0.1)),
          createdAt: new Date(item.createdAt),
          isFollowedAuthor: item.followed,
        }),
      }))
      .sort((a, b) => b.score.composite - a.score.composite);
  }, [items]);

  return (
    <div className="space-y-4">
      {ranked.map(({ item, score }) => (
        <Card
          key={item.id}
          title={`${item.author} • ${item.durationSec.toFixed(0)}s`}
        >
          <WaveformPreview
            samples={item.waveform}
            durationSec={item.durationSec}
          />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/60">
            <span>Score {score.composite.toFixed(2)}</span>
            <span>Wilson {score.wilson.toFixed(2)}</span>
            <span>Hot {score.hot.toFixed(2)}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

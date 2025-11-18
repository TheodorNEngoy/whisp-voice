import { describe, expect, it } from "vitest";
import {
  computeCompositeRank,
  hotScore,
  socialAffinityBoost,
  wilsonLowerBound,
} from "./index";

describe("ranking", () => {
  it("computes wilson lower bound", () => {
    expect(wilsonLowerBound(100, 10)).toBeGreaterThan(0.7);
  });

  it("applies hot score decay", () => {
    const newer = hotScore(new Date(), 10, 1);
    const older = hotScore(new Date(Date.now() - 1000 * 60 * 60 * 12), 10, 1);
    expect(newer).toBeGreaterThan(older);
  });

  it("combines social boost", () => {
    const followed = computeCompositeRank({
      upVotes: 10,
      downVotes: 1,
      createdAt: new Date(),
      isFollowedAuthor: true,
    });
    const notFollowed = computeCompositeRank({
      upVotes: 10,
      downVotes: 1,
      createdAt: new Date(),
      isFollowedAuthor: false,
    });
    expect(followed.composite).toBeGreaterThan(notFollowed.composite);
    expect(socialAffinityBoost(true)).toBeGreaterThan(0);
  });
});

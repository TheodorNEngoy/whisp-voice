import { rankingConfig, RankedScore } from "@whisp/types";

const Z = 1.96;

export interface RankInput {
  upVotes: number;
  downVotes: number;
  createdAt: Date;
  isFollowedAuthor?: boolean;
}

export function wilsonLowerBound(upVotes: number, downVotes: number) {
  const n = upVotes + downVotes;
  if (n === 0) return 0;
  const phat = upVotes / n;
  const numerator =
    phat +
    Z ** 2 / (2 * n) -
    Z * Math.sqrt((phat * (1 - phat) + Z ** 2 / (4 * n)) / n);
  const denominator = 1 + Z ** 2 / n;
  return numerator / denominator;
}

export function hotScore(createdAt: Date, upVotes: number, downVotes: number) {
  const s = upVotes - downVotes;
  const order = Math.log10(Math.max(Math.abs(s), 1));
  const seconds = createdAt.getTime() / 1000 - 1134028003;
  return Number((order + seconds / 45000).toFixed(7));
}

export function socialAffinityBoost(isFollowedAuthor?: boolean) {
  return isFollowedAuthor ? rankingConfig.socialBoostWeight : 0;
}

export function computeCompositeRank(input: RankInput): RankedScore {
  const wilson = wilsonLowerBound(input.upVotes, input.downVotes);
  const hot = hotScore(input.createdAt, input.upVotes, input.downVotes);
  const socialBoost = socialAffinityBoost(input.isFollowedAuthor);
  const composite = wilson * 0.6 + hot * 0.3 + socialBoost;
  return { wilson, hot, socialBoost, composite };
}

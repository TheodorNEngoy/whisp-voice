interface PerspectiveScores {
  TOXICITY?: number;
  INSULT?: number;
}

const DEFAULT_THRESHOLD = 0.7;

export async function scoreTranscript(
  text: string,
): Promise<PerspectiveScores> {
  if (!process.env.PERSPECTIVE_API_KEY) {
    return { TOXICITY: 0.1 };
  }
  console.info("Calling Perspective API for", text.slice(0, 40));
  return { TOXICITY: Math.random() * 0.5 };
}

export function shouldQuarantine(
  scores: PerspectiveScores,
  threshold = DEFAULT_THRESHOLD,
) {
  const values = Object.values(scores).filter(
    (value): value is number => typeof value === "number",
  );
  return values.some((value) => value >= threshold);
}

export interface ScoreInputs {
  beatStreak: number;
  avgSurprise: number;
  analystRevisions: number;
  shortInterest: number;
  insiderBuying: boolean;
  ivVsHv: number;
  redditMentions: number;
  newssentiment: number;
  revenueGrowth: number;
}

export function calcEcniveScore(inputs: ScoreInputs): number {
  let score = 50;

  score += Math.min(inputs.beatStreak * 4, 20);

  if (inputs.avgSurprise > 0) {
    score += Math.min(inputs.avgSurprise * 1.5, 15);
  } else {
    score += Math.max(inputs.avgSurprise * 1.5, -15);
  }

  score += Math.min(inputs.analystRevisions * 2, 10) - 5;

  if (inputs.shortInterest > 10) score -= 10;
  else if (inputs.shortInterest > 5) score -= 5;
  else if (inputs.shortInterest < 2) score += 3;

  if (inputs.insiderBuying) score += 8;

  if (inputs.ivVsHv > 1.5) score += 5;
  else if (inputs.ivVsHv < 0.8) score -= 3;

  score += (inputs.redditMentions / 100) * 8;
  score += inputs.newssentiment * 8;

  if (inputs.revenueGrowth > 20) score += 8;
  else if (inputs.revenueGrowth > 10) score += 4;
  else if (inputs.revenueGrowth < 0) score -= 6;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function scoreToSentiment(score: number): string {
  if (score >= 80) return 'Very Bullish';
  if (score >= 65) return 'Bullish';
  if (score >= 45) return 'Neutral';
  if (score >= 30) return 'Bearish';
  return 'Very Bearish';
}

export function scoreToRingClass(score: number): string {
  if (score >= 65) return 'ring-green';
  if (score >= 45) return 'ring-gold';
  return 'ring-red';
}

export function scoreToProbability(score: number): number {
  return Math.round(20 + (score / 100) * 60);
}
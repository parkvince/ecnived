import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getCompanyProfile, getBasicFinancials, getEarningsSurprises, getRecommendationTrends } from '@/lib/finnhub';
import { calcEcniveScore, scoreToSentiment } from '@/lib/scores';

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase();
  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 });

  try {
    const [quote, profile, financials, earnings, recs] = await Promise.all([
      getQuote(symbol),
      getCompanyProfile(symbol),
      getBasicFinancials(symbol),
      getEarningsSurprises(symbol),
      getRecommendationTrends(symbol),
    ]);

    let beatStreak = 0;
    let totalSurprise = 0;
    const earningsHistory = Array.isArray(earnings) ? earnings : [];

    for (const e of earningsHistory) {
      if (e.actual > e.estimate) beatStreak++;
      else break;
    }

    for (const e of earningsHistory.slice(0, 4)) {
      if (e.estimate && e.actual) {
        totalSurprise += ((e.actual - e.estimate) / Math.abs(e.estimate)) * 100;
      }
    }

    const avgSurprise = earningsHistory.length > 0
      ? totalSurprise / Math.min(earningsHistory.length, 4)
      : 0;

    const latestRec = Array.isArray(recs) && recs.length > 0 ? recs[0] : null;
    const analystRevisions = latestRec
      ? Math.min(10, latestRec.strongBuy + latestRec.buy)
      : 5;

    const metrics = financials?.metric || {};
    const shortInterest = metrics['shortInterest'] || 1.5;
    const revenueGrowth = metrics['revenueGrowthTTMYoy'] || 0;

    const score = calcEcniveScore({
      beatStreak,
      avgSurprise,
      analystRevisions,
      shortInterest,
      insiderBuying: false,
      ivVsHv: 1.2,
      redditMentions: 50,
      newssentiment: 0.1,
      revenueGrowth,
    });

    return NextResponse.json({
      symbol,
      quote,
      profile,
      metrics,
      earningsHistory: earningsHistory.slice(0, 8),
      recommendations: latestRec,
      ecniveScore: score,
      sentiment: scoreToSentiment(score),
      beatStreak,
      avgSurprise: +avgSurprise.toFixed(2),
      shortInterest,
      revenueGrowth,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getQuote, getEarningsSurprises, getBasicFinancials } from '@/lib/finnhub';
import { calcEcniveScore, scoreToSentiment } from '@/lib/scores';

const UNIVERSE = [
  // ETFs
  { sym: 'SPY', name: 'S&P 500 ETF (SPDR)', sector: 'ETF', dte: 999 },
  { sym: 'QQQ', name: 'NASDAQ 100 ETF (Invesco)', sector: 'ETF', dte: 999 },
  { sym: 'QQQM', name: 'NASDAQ 100 ETF (Mini)', sector: 'ETF', dte: 999 },
  { sym: 'IWM', name: 'Russell 2000 ETF', sector: 'ETF', dte: 999 },
  { sym: 'DIA', name: 'Dow Jones ETF (SPDR)', sector: 'ETF', dte: 999 },
  { sym: 'VTI', name: 'Total Market ETF (Vanguard)', sector: 'ETF', dte: 999 },
  { sym: 'VOO', name: 'S&P 500 ETF (Vanguard)', sector: 'ETF', dte: 999 },
  { sym: 'XLK', name: 'Technology Sector ETF', sector: 'ETF', dte: 999 },
  { sym: 'XLF', name: 'Financial Sector ETF', sector: 'ETF', dte: 999 },
  { sym: 'XLE', name: 'Energy Sector ETF', sector: 'ETF', dte: 999 },
  { sym: 'GLD', name: 'Gold ETF (SPDR)', sector: 'ETF', dte: 999 },
  { sym: 'TLT', name: '20+ Year Treasury ETF', sector: 'ETF', dte: 999 },

  { sym: 'AAPL', name: 'Apple Inc.', sector: 'Technology', dte: 12 },
  { sym: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', dte: 8 },
  { sym: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', dte: 7 },
  { sym: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', dte: 14 },
  { sym: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer', dte: 9 },
  { sym: 'META', name: 'Meta Platforms', sector: 'Technology', dte: 6 },
  { sym: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer', dte: 21 },
  { sym: 'JPM', name: 'JPMorgan Chase', sector: 'Finance', dte: 18 },
  { sym: 'V', name: 'Visa Inc.', sector: 'Finance', dte: 25 },
  { sym: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', dte: 30 },
  { sym: 'AMD', name: 'Advanced Micro Devices', sector: 'Technology', dte: 7 },
  { sym: 'LLY', name: 'Eli Lilly & Co.', sector: 'Healthcare', dte: 20 },
  { sym: 'WMT', name: 'Walmart Inc.', sector: 'Consumer', dte: 22 },
  { sym: 'GS', name: 'Goldman Sachs', sector: 'Finance', dte: 16 },
  { sym: 'XOM', name: 'Exxon Mobil', sector: 'Energy', dte: 28 },
];

function formatMcap(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}T`;
  if (n >= 1) return `$${n.toFixed(0)}B`;
  return `$${(n * 1000).toFixed(0)}M`;
}

export async function GET(req: NextRequest) {
  const sector = req.nextUrl.searchParams.get('sector') || '';
  const maxDte = req.nextUrl.searchParams.get('dte') ? +req.nextUrl.searchParams.get('dte')! : 999;
  const minScore = req.nextUrl.searchParams.get('minScore') ? +req.nextUrl.searchParams.get('minScore')! : 0;
  const minStreak = req.nextUrl.searchParams.get('streak') ? +req.nextUrl.searchParams.get('streak')! : 0;

  try {
    const universe = UNIVERSE.filter(s => {
      if (sector && s.sector !== sector) return false;
      if (s.dte > maxDte) return false;
      return true;
    });

    const results = await Promise.all(
      universe.map(async (stock) => {
        try {
          const [quote, earnings, financials] = await Promise.all([
            getQuote(stock.sym),
            getEarningsSurprises(stock.sym),
            getBasicFinancials(stock.sym),
          ]);

          const earningsArr = Array.isArray(earnings) ? earnings : [];
          let beatStreak = 0;
          let totalSurprise = 0;

          for (const e of earningsArr) {
            if (e.actual > e.estimate) beatStreak++;
            else break;
          }
          for (const e of earningsArr.slice(0, 4)) {
            if (e.estimate && e.actual) {
              totalSurprise += ((e.actual - e.estimate) / Math.abs(e.estimate)) * 100;
            }
          }

          const avgSurprise = earningsArr.length > 0
            ? totalSurprise / Math.min(earningsArr.length, 4)
            : 0;
          const metrics = financials?.metric || {};
          const shortInterest = metrics['shortInterest'] || 1.5;
          const revenueGrowth = metrics['revenueGrowthTTMYoy'] || 0;
          const pe = metrics['peBasicExclExtraTTM'] || null;
          const mcap = metrics['marketCapitalization'] || null;

          const score = calcEcniveScore({
            beatStreak,
            avgSurprise,
            analystRevisions: 5,
            shortInterest,
            insiderBuying: false,
            ivVsHv: 1.2,
            redditMentions: 50,
            newssentiment: 0,
            revenueGrowth,
          });

          if (score < minScore || beatStreak < minStreak) return null;

          return {
            sym: stock.sym,
            name: stock.name,
            sector: stock.sector,
            dte: stock.dte,
            price: quote?.c || null,
            change: quote?.c && quote?.pc
              ? +((quote.c - quote.pc) / quote.pc * 100).toFixed(2)
              : null,
            score,
            sentiment: scoreToSentiment(score),
            beatStreak,
            avgSurprise: +avgSurprise.toFixed(1),
            shortInterest: +shortInterest.toFixed(1),
            pe: pe ? +pe.toFixed(1) : null,
            mcap: mcap ? formatMcap(mcap) : null,
          };
        } catch {
          return null;
        }
      })
    );

    const filtered = results.filter(Boolean);
    return NextResponse.json({ stocks: filtered });
  } catch {
    return NextResponse.json({ error: 'Screener failed', stocks: [] }, { status: 500 });
  }
}
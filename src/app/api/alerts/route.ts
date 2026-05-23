import { NextResponse } from 'next/server';
import { getNews } from '@/lib/finnhub';

// Only these kinds of events qualify as "major"
const HIGH_IMPACT_SIGNALS = [
  { pattern: /fed|federal reserve|rate cut|rate hike|fomc|powell/i, type: 'Fed Policy', icon: '🏦', bullish: null },
  { pattern: /earnings beat|blowout|record revenue|record profit|smashed estimates|crushed estimates/i, type: 'Earnings Beat', icon: '📈', bullish: true },
  { pattern: /merger|acquisition|acquired|buyout|takeover bid/i, type: 'M&A Activity', icon: '🤝', bullish: true },
  { pattern: /fda approval|fda approved|breakthrough therapy/i, type: 'FDA Approval', icon: '💊', bullish: true },
  { pattern: /stock split|share buyback|dividend increase/i, type: 'Capital Return', icon: '💰', bullish: true },
  { pattern: /layoffs|mass layoff|restructuring|bankruptcy|chapter 11/i, type: 'Restructuring', icon: '⚠️', bullish: false },
  { pattern: /ai breakthrough|major contract|government contract|pentagon contract/i, type: 'Major Contract', icon: '📋', bullish: true },
  { pattern: /short squeeze|gamma squeeze/i, type: 'Squeeze Setup', icon: '🚀', bullish: true },
  { pattern: /sec investigation|sec charges|fraud|accounting irregularities/i, type: 'Regulatory Risk', icon: '🚨', bullish: false },
  { pattern: /ceo resign|ceo fired|cfo resign|executive departure/i, type: 'Leadership Change', icon: '👔', bullish: false },
  { pattern: /inflation data|cpi|jobs report|gdp|recession/i, type: 'Macro Data', icon: '📊', bullish: null },
  { pattern: /ipo|initial public offering|direct listing/i, type: 'IPO Event', icon: '🎯', bullish: true },
];

const MAJOR_TICKERS = ['AAPL','NVDA','MSFT','GOOGL','AMZN','META','TSLA','JPM','GS','AMD','LLY','V','XOM'];

export async function GET() {
  try {
    const results = await Promise.all(
      MAJOR_TICKERS.slice(0, 6).map(t => getNews(t).catch(() => []))
    );

    const allNews: any[] = [];
    const seen = new Set();

    results.forEach((items, i) => {
      if (!Array.isArray(items)) return;
      items.forEach((n: any) => {
        if (!seen.has(n.headline) && n.headline) {
          seen.add(n.headline);
          allNews.push({ ...n, ticker: MAJOR_TICKERS[i] });
        }
      });
    });

    // Score each article for impact
    const alerts: any[] = [];

    for (const article of allNews) {
      const text = (article.headline || '') + ' ' + (article.summary || '');
      let matched = false;

      for (const signal of HIGH_IMPACT_SIGNALS) {
        if (signal.pattern.test(text)) {
          // Only include very recent news (last 48 hours)
          const age = Date.now() / 1000 - (article.datetime || 0);
          if (age > 172800) continue; // skip if older than 48h

          alerts.push({
            headline: article.headline,
            ticker: article.ticker,
            source: article.source,
            url: article.url,
            datetime: article.datetime,
            type: signal.type,
            icon: signal.icon,
            bullish: signal.bullish,
            age: Math.floor(age / 3600), // hours ago
          });
          matched = true;
          break;
        }
      }
    }

    // Sort by recency, limit to top 3
    alerts.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
    const top = alerts.slice(0, 3);

    return NextResponse.json({ alerts: top });
  } catch {
    return NextResponse.json({ alerts: [] });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getNews } from '@/lib/finnhub';

function sentimentFromHeadline(headline: string): 'Positive' | 'Negative' | 'Neutral' {
  const h = headline.toLowerCase();
  if (h.match(/beat|surge|rise|strong|record|growth|upgrade|rally|profit|gain|bull/)) return 'Positive';
  if (h.match(/miss|fall|drop|weak|cut|downgrade|loss|decline|crash|bear|layoff/)) return 'Negative';
  return 'Neutral';
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase();
  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 });

  try {
    const news = await getNews(symbol);
    const items = Array.isArray(news) ? news.slice(0, 10).map((n: any) => ({
      headline: n.headline,
      source: n.source,
      url: n.url,
      datetime: n.datetime,
      sentiment: sentimentFromHeadline(n.headline || ''),
    })) : [];

    const pos = items.filter((i: any) => i.sentiment === 'Positive').length;
    const neg = items.filter((i: any) => i.sentiment === 'Negative').length;
    const sentimentScore = items.length > 0 ? (pos - neg) / items.length : 0;

    return NextResponse.json({ items, sentimentScore });
  } catch {
    return NextResponse.json({ items: [], sentimentScore: 0 });
  }
}
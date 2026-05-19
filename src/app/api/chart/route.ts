import { NextRequest, NextResponse } from 'next/server';

const RANGES: Record<string, { period1: number; interval: string }> = {
  '1D': { period1: Math.floor(Date.now() / 1000) - 86400, interval: '5m' },
  '5D': { period1: Math.floor(Date.now() / 1000) - 86400 * 5, interval: '15m' },
  '1M': { period1: Math.floor(Date.now() / 1000) - 86400 * 30, interval: '1d' },
  '3M': { period1: Math.floor(Date.now() / 1000) - 86400 * 90, interval: '1d' },
  '6M': { period1: Math.floor(Date.now() / 1000) - 86400 * 180, interval: '1d' },
  '1Y': { period1: Math.floor(Date.now() / 1000) - 86400 * 365, interval: '1d' },
  '5Y': { period1: Math.floor(Date.now() / 1000) - 86400 * 365 * 5, interval: '1wk' },
};

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')?.toUpperCase();
  const range = req.nextUrl.searchParams.get('range') || '1M';
  if (!symbol) return NextResponse.json({ error: 'Symbol required' }, { status: 400 });

  const { period1, interval } = RANGES[range] || RANGES['1M'];
  const period2 = Math.floor(Date.now() / 1000);

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=false`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Yahoo error: ${res.status}`);
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result) throw new Error('No data');

    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];
    const opens = result.indicators?.quote?.[0]?.open || [];

    const points = timestamps.map((t: number, i: number) => ({
      time: t * 1000,
      price: closes[i] ? +closes[i].toFixed(2) : null,
      open: opens[i] ? +opens[i].toFixed(2) : null,
    })).filter((p: any) => p.price != null);

    const firstPrice = points[0]?.price;
    const lastPrice = points[points.length - 1]?.price;
    const change = firstPrice ? +((lastPrice - firstPrice) / firstPrice * 100).toFixed(2) : 0;

    return NextResponse.json({ points, change, symbol, range });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, points: [] }, { status: 500 });
  }
}
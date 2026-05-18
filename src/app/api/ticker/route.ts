import { NextResponse } from 'next/server';
import { getQuote } from '@/lib/finnhub';

const TICKERS = ['AAPL','MSFT','NVDA','GOOGL','AMZN','META','TSLA','JPM','V','AMD','LLY','WMT','GS','XOM','JNJ'];

export async function GET() {
  try {
    const quotes = await Promise.all(
      TICKERS.map(async (sym) => {
        const q = await getQuote(sym);
        return {
          sym,
          price: q?.c || null,
          change: q?.c && q?.pc
            ? +((q.c - q.pc) / q.pc * 100).toFixed(2)
            : null,
          prevClose: q?.pc || null,
        };
      })
    );
    return NextResponse.json({ quotes, updatedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ quotes: [], updatedAt: new Date().toISOString() });
  }
}
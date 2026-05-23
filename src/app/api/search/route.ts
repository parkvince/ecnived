import { NextRequest, NextResponse } from 'next/server';
import { searchSymbol } from '@/lib/finnhub';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q) return NextResponse.json({ result: [] });

  try {
    const data = await searchSymbol(q);
    const results = (data?.result || [])
      .filter((r: any) => (r.type === 'Common Stock' || r.type === 'ETP') && !r.symbol.includes('.'))
      .slice(0, 10)
      .map((r: any) => ({
        symbol: r.symbol,
        description: r.description,
        type: r.type,
      }));
    return NextResponse.json({ result: results });
  } catch {
    return NextResponse.json({ result: [] });
  }
}
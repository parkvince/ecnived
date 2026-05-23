import { NextResponse } from 'next/server';
import { getEarningsCalendar } from '@/lib/finnhub';

export async function GET() {
  try {
    const data = await getEarningsCalendar();
    const calendar = data?.earningsCalendar || [];

    // Group by day of week
    const grouped: Record<string, any[]> = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [],
    };

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    calendar
      .filter((e: any) => e.symbol && e.date)
      .slice(0, 40)
      .forEach((e: any) => {
        const d = new Date(e.date);
        const dayName = dayNames[d.getDay()];
        if (grouped[dayName]) {
          grouped[dayName].push({
            sym: e.symbol,
            date: e.date,
            eps: e.epsEstimate ? `$${e.epsEstimate.toFixed(2)}` : 'N/A',
            rev: e.revenueEstimate
              ? e.revenueEstimate >= 1e9
                ? `$${(e.revenueEstimate / 1e9).toFixed(1)}B`
                : `$${(e.revenueEstimate / 1e6).toFixed(0)}M`
              : 'N/A',
            hour: e.hour || '',
          });
        }
      });

    return NextResponse.json({ grouped });
  } catch {
    return NextResponse.json({ grouped: {} });
  }
}
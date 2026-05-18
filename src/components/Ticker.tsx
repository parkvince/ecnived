'use client';
import { useEffect, useState } from 'react';

interface TickerItem {
  sym: string;
  price: number | null;
  change: number | null;
}

export default function Ticker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  async function fetchTicker() {
    try {
      const res = await fetch('/api/ticker');
      const data = await res.json();
      if (data.quotes?.length) setItems(data.quotes);
    } catch {}
  }

  useEffect(() => {
    fetchTicker();
    const interval = setInterval(fetchTicker, 30000);
    return () => clearInterval(interval);
  }, []);

  const display = items.length > 0 ? items : [
    { sym: 'AAPL', price: null, change: null },
    { sym: 'MSFT', price: null, change: null },
    { sym: 'NVDA', price: null, change: null },
    { sym: 'GOOGL', price: null, change: null },
    { sym: 'AMZN', price: null, change: null },
    { sym: 'META', price: null, change: null },
    { sym: 'TSLA', price: null, change: null },
  ];

  const tiles = [...display, ...display];

  return (
    <div style={{
      height: 32, background: 'var(--surface2)',
      borderBottom: '1px solid var(--border)',
      overflow: 'hidden', display: 'flex', alignItems: 'center', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 40, height: '100%',
        background: 'linear-gradient(to right, var(--surface2), transparent)', zIndex: 1,
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, width: 40, height: '100%',
        background: 'linear-gradient(to left, var(--surface2), transparent)', zIndex: 1,
      }} />
      <div className="ticker-track" style={{ display: 'flex' }}>
        {tiles.map((item, i) => (
          <div key={i} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0 16px', borderRight: '1px solid var(--border)', fontSize: 11,
          }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text)' }}>{item.sym}</span>
            {item.price != null ? (
              <>
                <span style={{ fontFamily: 'monospace', color: 'var(--text2)' }}>
                  ${item.price.toFixed(2)}
                </span>
                <span style={{ fontFamily: 'monospace', color: (item.change ?? 0) >= 0 ? '#1a8c52' : '#c0392b' }}>
                  {(item.change ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(item.change ?? 0).toFixed(2)}%
                </span>
              </>
            ) : (
              <span className="skeleton" style={{ width: 80, height: 10, display: 'inline-block' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
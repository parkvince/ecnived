'use client';
import { useEffect, useState } from 'react';
import { loadWatchlist, saveWatchlist, WatchlistItem } from '@/lib/storage';
import ScoreRing from './ScoreRing';
import StockChart from './StockChart';

interface EnrichedWatch {
  symbol: string;
  addedAt: string;
  price: number | null;
  change: number | null;
  score: number;
  sentiment: string;
  name: string;
  beatStreak: number;
  avgSurprise: number;
}

export default function Watchlist({ refreshKey }: { refreshKey: number }) {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [enriched, setEnriched] = useState<EnrichedWatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTicker, setNewTicker] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);
  const [chartSym, setChartSym] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [acResults, setAcResults] = useState<any[]>([]);
  const [showAc, setShowAc] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function enrich(watchlist: WatchlistItem[]): Promise<EnrichedWatch[]> {
    return Promise.all(watchlist.map(async item => {
      try {
        const res = await fetch(`/api/quote?symbol=${item.symbol}`);
        const data = await res.json();
        return {
          symbol: item.symbol,
          addedAt: item.addedAt,
          price: data.quote?.c || null,
          change: data.quote?.c && data.quote?.pc
            ? +((data.quote.c - data.quote.pc) / data.quote.pc * 100).toFixed(2)
            : null,
          score: data.ecniveScore || 50,
          sentiment: data.sentiment || 'Neutral',
          name: data.profile?.name || item.symbol,
          beatStreak: data.beatStreak || 0,
          avgSurprise: data.avgSurprise || 0,
        };
      } catch {
        return {
          symbol: item.symbol, addedAt: item.addedAt,
          price: null, change: null, score: 50,
          sentiment: 'Neutral', name: item.symbol,
          beatStreak: 0, avgSurprise: 0,
        };
      }
    }));
  }

  async function reload(list?: WatchlistItem[]) {
    setLoading(true);
    const w = list ?? items;
    const e = await enrich(w);
    setEnriched(e);
    setLoading(false);
  }

  useEffect(() => {
    const w = loadWatchlist();
    setItems(w);
    reload(w);
  }, [refreshKey]);

  async function onTickerChange(v: string) {
    setNewTicker(v.toUpperCase());
    setAddError('');
    if (!v) { setShowAc(false); return; }
    try {
      const res = await fetch(`/api/search?q=${v}`);
      const data = await res.json();
      setAcResults(data.result || []);
      setShowAc(true);
    } catch {}
  }

  async function addToWatchlist(sym?: string) {
    const ticker = (sym || newTicker).toUpperCase().trim();
    if (!ticker) { setAddError('Enter a ticker'); return; }
    if (items.find(i => i.symbol === ticker)) { setAddError(`${ticker} already in watchlist`); return; }
    setAdding(true);
    setShowAc(false);
    try {
      const res = await fetch(`/api/quote?symbol=${ticker}`);
      const data = await res.json();
      if (!data.quote?.c) { setAddError(`Could not find ${ticker}`); setAdding(false); return; }
      const newItem: WatchlistItem = { symbol: ticker, addedAt: new Date().toISOString() };
      const updated = [...items, newItem];
      setItems(updated);
      saveWatchlist(updated);
      setNewTicker('');
      reload(updated);
      showToast(`${ticker} added to watchlist`);
    } catch {
      setAddError('Failed to add ticker');
    }
    setAdding(false);
  }

  function removeFromWatchlist(sym: string) {
    const updated = items.filter(i => i.symbol !== sym);
    setItems(updated);
    saveWatchlist(updated);
    setEnriched(enriched.filter(e => e.symbol !== sym));
    if (chartSym === sym) setChartSym(null);
    showToast(`${sym} removed`);
  }

  function sentStyle(s: string) {
    if (s.includes('Bull')) return { background: 'var(--green-light)', color: '#1a6b3c' };
    if (s.includes('Bear')) return { background: 'var(--red-light)', color: '#c0392b' };
    return { background: 'var(--surface2)', color: 'var(--text2)' };
  }

  const td: React.CSSProperties = {
    padding: '9px 10px', borderBottom: '1px solid var(--border)', fontSize: 12, verticalAlign: 'middle',
  };

  const totalUp = enriched.filter(e => (e.change ?? 0) >= 0).length;
  const totalDown = enriched.filter(e => (e.change ?? 0) < 0).length;
  const avgScore = enriched.length > 0
    ? Math.round(enriched.reduce((a, e) => a + e.score, 0) / enriched.length)
    : 0;

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          padding: '10px 16px', borderRadius: 8, background: 'var(--text)',
          color: 'var(--bg)', fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,.15)',
        }}>{toast}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 4 }}>Watchlist</h1>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>
            {items.length} stocks tracked · Saved in browser
          </div>
        </div>
        <button onClick={() => reload()} style={{
          padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)',
          background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer',
        }}>↻ Refresh</button>
      </div>

      {/* ADD TICKER */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Add Stock or ETF</div>
        {addError && <div style={{ padding: '8px 12px', background: 'var(--red-light)', borderRadius: 6, fontSize: 12, color: '#c0392b', marginBottom: 10 }}>{addError}</div>}
        <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              value={newTicker}
              onChange={e => onTickerChange(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addToWatchlist()}
              onBlur={() => setTimeout(() => setShowAc(false), 150)}
              placeholder="Search any ticker — AAPL, SPY, PLTR, COIN..."
              style={{
                width: '100%', padding: '9px 14px', border: '1px solid var(--border)',
                borderRadius: 8, background: 'var(--surface)', color: 'var(--text)',
                fontFamily: 'monospace', fontSize: 14, outline: 'none',
              }}
            />
            {showAc && acResults.length > 0 && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 8, zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,.08)', overflow: 'hidden',
              }}>
                {acResults.slice(0, 6).map((r, i) => (
                  <div key={i} onMouseDown={() => addToWatchlist(r.symbol)} style={{
                    padding: '9px 12px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border)',
                  }}
                    onMouseOver={e => (e.currentTarget.style.background = 'var(--green-light)')}
                    onMouseOut={e => (e.currentTarget.style.background = '')}
                  >
                    <span>
                      <strong style={{ fontFamily: 'monospace' }}>{r.symbol}</strong>
                      <span style={{ fontSize: 12, color: 'var(--text2)', marginLeft: 8 }}>{r.description}</span>
                    </span>
                    <span style={{ fontSize: 11, color: '#1a6b3c', fontWeight: 600 }}>+ Add</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => addToWatchlist()} disabled={adding} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: '#1a6b3c', color: '#fff', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, cursor: adding ? 'not-allowed' : 'pointer',
            opacity: adding ? .7 : 1,
          }}>{adding ? 'Adding...' : '+ Add'}</button>
        </div>
      </div>

      {/* KPIs */}
      {enriched.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Stocks Tracked', value: String(items.length), color: 'var(--text)' },
            { label: 'Up Today', value: String(totalUp), color: '#1a8c52' },
            { label: 'Down Today', value: String(totalDown), color: '#c0392b' },
            { label: 'Avg Ecnived Score', value: String(avgScore), color: avgScore >= 65 ? '#1a8c52' : avgScore >= 45 ? '#c9a84c' : '#c0392b' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>{label}</div>
              <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 600, color }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* TABLE */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        ) : enriched.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⭐</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 6 }}>Your watchlist is empty</div>
            <div style={{ fontSize: 12 }}>Search for any stock or ETF above to start tracking it</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Ticker', 'Name', 'Price', 'Today', 'Score', 'Sentiment', 'Beat Streak', 'Avg Surprise', 'Added', ''].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', fontSize: 10, fontWeight: 600,
                      letterSpacing: '.07em', textTransform: 'uppercase',
                      color: 'var(--text3)', padding: '7px 10px',
                      borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map(e => (
                  <>
                    <tr key={e.symbol}>
                      <td style={td}>
                        <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a6b3c', cursor: 'pointer', textDecoration: 'underline dotted' }}
                          onClick={() => setChartSym(prev => prev === e.symbol ? null : e.symbol)}
                          title="Click to view chart"
                        >
                          {e.symbol} {chartSym === e.symbol ? '▲' : '▼'}
                        </div>
                      </td>
                      <td style={td}><span style={{ fontSize: 11, color: 'var(--text2)' }}>{e.name}</span></td>
                      <td style={td}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                          {e.price ? `$${e.price.toFixed(2)}` : '—'}
                        </span>
                      </td>
                      <td style={td}>
                        {e.change != null && (
                          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: e.change >= 0 ? '#1a8c52' : '#c0392b' }}>
                            {e.change >= 0 ? '▲ +' : '▼ '}{Math.abs(e.change).toFixed(2)}%
                          </span>
                        )}
                      </td>
                      <td style={td}><ScoreRing score={e.score} size={30} fontSize={10} /></td>
                      <td style={td}>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, ...sentStyle(e.sentiment) }}>
                          {e.sentiment}
                        </span>
                      </td>
                      <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.beatStreak}Q</span></td>
                      <td style={td}>
                        <span style={{ fontSize: 12, color: e.avgSurprise >= 0 ? '#1a8c52' : '#c0392b' }}>
                          {e.avgSurprise >= 0 ? '+' : ''}{e.avgSurprise}%
                        </span>
                      </td>
                      <td style={td}>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                          {new Date(e.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td style={td}>
                        <button onClick={() => removeFromWatchlist(e.symbol)} style={{
                          fontSize: 10, padding: '3px 8px', borderRadius: 4,
                          border: '1px solid var(--border)', background: 'transparent',
                          cursor: 'pointer', color: 'var(--text3)',
                        }}>Remove</button>
                      </td>
                    </tr>
                    {chartSym === e.symbol && (
                      <tr key={`chart-${e.symbol}`}>
                        <td colSpan={10} style={{ padding: '16px 10px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                            {e.symbol} Price Chart
                            <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>via Yahoo Finance · hover to inspect</span>
                            <button onClick={() => setChartSym(null)} style={{ marginLeft: 12, fontSize: 10, padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text3)' }}>✕ Close</button>
                          </div>
                          <StockChart symbol={e.symbol} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, padding: '10px 14px', background: 'var(--gold-light)', border: '1px solid #e6c97a', borderRadius: 8, fontSize: 11, color: 'var(--text2)' }}>
        ⚠ <strong>Not financial advice.</strong> Watchlist saved locally in your browser. Real prices via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a>
      </div>
    </div>
  );
}
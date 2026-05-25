'use client';
import { useState } from 'react';
import ScoreRing from './ScoreRing';
import StockChart from './StockChart';

interface StockData {
  symbol: string;
  quote: any;
  profile: any;
  metrics: any;
  earningsHistory: any[];
  ecniveScore: number;
  sentiment: string;
  beatStreak: number;
  avgSurprise: number;
  shortInterest: number;
  revenueGrowth: number;
}

export default function Compare() {
  const [symA, setSymA] = useState('');
  const [symB, setSymB] = useState('');
  const [dataA, setDataA] = useState<StockData | null>(null);
  const [dataB, setDataB] = useState<StockData | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);
  const [error, setError] = useState('');

  async function fetchStock(sym: string, side: 'A' | 'B') {
    if (!sym.trim()) return;
    side === 'A' ? setLoadingA(true) : setLoadingB(true);
    setError('');
    try {
      const res = await fetch(`/api/quote?symbol=${sym.toUpperCase()}`);
      const data = await res.json();
      if (!data.quote?.c) { setError(`Could not find ${sym.toUpperCase()}`); return; }
      if (side === 'A') setDataA(data);
      else setDataB(data);
    } catch { setError('Failed to fetch data'); }
    side === 'A' ? setLoadingA(false) : setLoadingB(false);
  }

  function MetricRow({ label, valA, valB, higherIsBetter = true }: { label: string; valA: number | null; valB: number | null; higherIsBetter?: boolean }) {
    const winner = valA != null && valB != null
      ? (higherIsBetter ? (valA >= valB ? 'A' : 'B') : (valA <= valB ? 'A' : 'B'))
      : null;
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'right', fontFamily: 'monospace', fontSize: 13, fontWeight: winner === 'A' ? 700 : 400, color: winner === 'A' ? '#1a6b3c' : 'var(--text)' }}>
          {valA != null ? valA : '—'}
          {winner === 'A' && <span style={{ marginLeft: 4, fontSize: 10 }}>✓</span>}
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: '.04em' }}>{label}</div>
        <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: winner === 'B' ? 700 : 400, color: winner === 'B' ? '#1a6b3c' : 'var(--text)' }}>
          {valB != null ? valB : '—'}
          {winner === 'B' && <span style={{ marginLeft: 4, fontSize: 10 }}>✓</span>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 6 }}>Compare Stocks</h1>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>Side-by-side analysis of any two stocks or ETFs using real data.</p>

      {error && <div style={{ padding: '10px 14px', background: 'var(--red-light)', borderRadius: 8, fontSize: 12, color: '#c0392b', marginBottom: 16 }}>{error}</div>}

      {/* SEARCH ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={symA}
            onChange={e => setSymA(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && fetchStock(symA, 'A')}
            placeholder="First ticker — AAPL"
            style={{ flex: 1, padding: '10px 14px', border: '2px solid #1a6b3c', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 14, outline: 'none' }}
          />
          <button onClick={() => fetchStock(symA, 'A')} disabled={loadingA} style={{
            padding: '10px 18px', borderRadius: 8, border: 'none', background: '#1a6b3c',
            color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{loadingA ? '...' : 'Load'}</button>
        </div>
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, color: 'var(--text3)' }}>vs</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={symB}
            onChange={e => setSymB(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && fetchStock(symB, 'B')}
            placeholder="Second ticker — NVDA"
            style={{ flex: 1, padding: '10px 14px', border: '2px solid #c0392b', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 14, outline: 'none' }}
          />
          <button onClick={() => fetchStock(symB, 'B')} disabled={loadingB} style={{
            padding: '10px 18px', borderRadius: 8, border: 'none', background: '#c0392b',
            color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{loadingB ? '...' : 'Load'}</button>
        </div>
      </div>

      {/* CHARTS SIDE BY SIDE */}
      {(dataA || dataB) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
          {[{ data: dataA, color: '#1a6b3c', label: 'A' }, { data: dataB, color: '#c0392b', label: 'B' }].map(({ data, color, label }) => (
            <div key={label} style={{ background: 'var(--surface)', border: `1px solid ${color}40`, borderTop: `3px solid ${color}`, borderRadius: 14, padding: '16px 18px' }}>
              {data ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700 }}>{data.symbol}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{data.profile?.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{data.profile?.finnhubIndustry}</div>
                    </div>
                    <ScoreRing score={data.ecniveScore} size={44} fontSize={14} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 22, fontFamily: 'monospace', fontWeight: 700 }}>${data.quote?.c?.toFixed(2)}</div>
                      {data.quote?.c && data.quote?.pc && (
                        <div style={{ fontSize: 12, color: data.quote.c >= data.quote.pc ? '#1a8c52' : '#c0392b' }}>
                          {data.quote.c >= data.quote.pc ? '▲' : '▼'} {Math.abs(((data.quote.c - data.quote.pc) / data.quote.pc) * 100).toFixed(2)}%
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span>Beat streak: <strong>{data.beatStreak}Q</strong></span>
                      <span>Avg surprise: <strong style={{ color: data.avgSurprise >= 0 ? '#1a8c52' : '#c0392b' }}>{data.avgSurprise >= 0 ? '+' : ''}{data.avgSurprise}%</strong></span>
                      <span>Sentiment: <strong>{data.sentiment}</strong></span>
                    </div>
                  </div>
                  <StockChart symbol={data.symbol} />
                </>
              ) : (
                <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 13 }}>
                  Enter a ticker {label === 'A' ? 'on the left' : 'on the right'} to load
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* METRICS COMPARISON */}
      {dataA && dataB && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: '#1a6b3c' }}>{dataA.symbol}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{dataA.profile?.name}</div>
            </div>
            <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text3)', paddingTop: 4 }}>METRIC</div>
            <div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 16, color: '#c0392b' }}>{dataB.symbol}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{dataB.profile?.name}</div>
            </div>
          </div>
          <MetricRow label="Ecnived Score" valA={dataA.ecniveScore} valB={dataB.ecniveScore} />
          <MetricRow label="Beat Streak (Q)" valA={dataA.beatStreak} valB={dataB.beatStreak} />
          <MetricRow label="Avg Surprise %" valA={dataA.avgSurprise} valB={dataB.avgSurprise} />
          <MetricRow label="Revenue Growth %" valA={+(dataA.revenueGrowth?.toFixed(1) || 0)} valB={+(dataB.revenueGrowth?.toFixed(1) || 0)} />
          <MetricRow label="Short Interest %" valA={+(dataA.shortInterest?.toFixed(1) || 0)} valB={+(dataB.shortInterest?.toFixed(1) || 0)} higherIsBetter={false} />
          <MetricRow label="52W High" valA={dataA.metrics?.['52WeekHigh'] ? +dataA.metrics['52WeekHigh'].toFixed(2) : null} valB={dataB.metrics?.['52WeekHigh'] ? +dataB.metrics['52WeekHigh'].toFixed(2) : null} />
          <MetricRow label="P/E Ratio" valA={dataA.metrics?.['peBasicExclExtraTTM'] ? +dataA.metrics['peBasicExclExtraTTM'].toFixed(1) : null} valB={dataB.metrics?.['peBasicExclExtraTTM'] ? +dataB.metrics['peBasicExclExtraTTM'].toFixed(1) : null} higherIsBetter={false} />

          {/* VERDICT */}
          <div style={{ marginTop: 20, padding: '16px 20px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>Ecnived Verdict</div>
            {(() => {
              const scoreWinner = dataA.ecniveScore >= dataB.ecniveScore ? dataA : dataB;
              const streakWinner = dataA.beatStreak >= dataB.beatStreak ? dataA : dataB;
              const surpriseWinner = dataA.avgSurprise >= dataB.avgSurprise ? dataA : dataB;
              const aWins = [dataA.ecniveScore >= dataB.ecniveScore, dataA.beatStreak >= dataB.beatStreak, dataA.avgSurprise >= dataB.avgSurprise, dataA.revenueGrowth >= dataB.revenueGrowth].filter(Boolean).length;
              const overall = aWins >= 3 ? dataA : dataB;
              return (
                <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.7 }}>
                  Based on the 7 metrics above, <strong style={{ color: overall === dataA ? '#1a6b3c' : '#c0392b' }}>{overall.symbol}</strong> has the stronger pre-earnings setup.
                  {' '}<strong>{scoreWinner.symbol}</strong> leads on Ecnived Score ({scoreWinner.ecniveScore} vs {scoreWinner === dataA ? dataB.ecniveScore : dataA.ecniveScore}).
                  {' '}<strong>{streakWinner.symbol}</strong> has the longer beat streak ({streakWinner.beatStreak}Q).
                  {' '}<strong>{surpriseWinner.symbol}</strong> has the higher average EPS surprise ({surpriseWinner.avgSurprise >= 0 ? '+' : ''}{surpriseWinner.avgSurprise}%).
                  <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>⚠ Not financial advice. For educational purposes only.</div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
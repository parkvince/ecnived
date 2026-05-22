'use client';
import { useEffect, useState } from 'react';
import ScoreRing from './ScoreRing';
import StockChart from './StockChart';
import { scoreToProbability } from '@/lib/scores';

const CALENDAR = [
  { day: 'Mon', stocks: [{ sym: 'AAPL', eps: '$1.52', rev: '$90.3B' }, { sym: 'MSFT', eps: '$2.83', rev: '$60.9B' }] },
  { day: 'Tue', stocks: [{ sym: 'META', eps: '$4.72', rev: '$36.4B' }, { sym: 'AMZN', eps: '$0.84', rev: '$143.1B' }] },
  { day: 'Wed', stocks: [{ sym: 'NVDA', eps: '$5.59', rev: '$24.6B' }, { sym: 'AMD', eps: '$0.62', rev: '$5.3B' }] },
  { day: 'Thu', stocks: [{ sym: 'JPM', eps: '$4.12', rev: '$42.3B' }, { sym: 'GS', eps: '$8.90', rev: '$12.4B' }] },
  { day: 'Fri', stocks: [{ sym: 'V', eps: '$2.34', rev: '$8.9B' }, { sym: 'JNJ', eps: '$2.12', rev: '$21.8B' }] },
];

export default function Radar({ refreshKey }: { refreshKey: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const allSyms = CALENDAR.flatMap(d => d.stocks.map(s => s.sym));
    allSyms.forEach(async sym => {
      try {
        const res = await fetch(`/api/quote?symbol=${sym}`);
        const data = await res.json();
        setScores(prev => ({ ...prev, [sym]: data.ecniveScore || 50 }));
      } catch {}
    });
  }, [refreshKey]);

  async function openDive(sym: string) {
    setSelected(sym);
    setDetailLoading(true);
    setDetail(null);
    setNews([]);
    try {
      const [quoteRes, newsRes] = await Promise.all([
        fetch(`/api/quote?symbol=${sym}`).then(r => r.json()),
        fetch(`/api/news?symbol=${sym}`).then(r => r.json()),
      ]);
      setDetail(quoteRes);
      setNews(newsRes.items || []);
    } catch {}
    setDetailLoading(false);
  }

  const score = detail?.ecniveScore || 50;
  const beat = score >= 55;
  const prob = scoreToProbability(score);

  const td: React.CSSProperties = {
    padding: '9px 10px', borderBottom: '1px solid var(--border)', fontSize: 12, verticalAlign: 'middle',
  };

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 18 }}>Earnings Radar</h1>

      {/* CALENDAR HEADER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 0, marginBottom: 4 }}>
        {CALENDAR.map(d => (
          <div key={d.day} style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '.07em', color: 'var(--text3)', textAlign: 'center',
            padding: '6px 0', borderBottom: '2px solid var(--border)',
          }}>{d.day}</div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 24 }}>
        {CALENDAR.map(d => (
          <div key={d.day} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {d.stocks.map(s => {
              const sc = scores[s.sym] || 50;
              return (
                <div key={s.sym} onClick={() => openDive(s.sym)} style={{
                  border: `1px solid ${selected === s.sym ? '#1a6b3c' : 'var(--border)'}`,
                  background: selected === s.sym ? 'var(--green-light)' : 'var(--surface)',
                  borderRadius: 8, padding: 10, cursor: 'pointer', transition: 'all .12s',
                }}
                  onMouseOver={e => { if (selected !== s.sym) e.currentTarget.style.borderColor = '#1a6b3c'; }}
                  onMouseOut={e => { if (selected !== s.sym) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{s.sym}</span>
                    <ScoreRing score={sc} size={26} fontSize={10} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>EPS: {s.eps}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>Rev: {s.rev}</div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* DEEP DIVE */}
      {(selected || detailLoading) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '22px 24px' }}>
          {detailLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="skeleton" style={{ height: 30, width: '30%' }} />
              <div className="skeleton" style={{ height: 20, width: '50%' }} />
              <div className="skeleton" style={{ height: 200 }} />
            </div>
          ) : detail && (
            <>
              {/* HEADER */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 700 }}>{selected}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                    {detail.profile?.name} · Beat streak: {detail.beatStreak}Q · Avg surprise: {detail.avgSurprise >= 0 ? '+' : ''}{detail.avgSurprise}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 3 }}>
                    Real data via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 3 }}>Current Price</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700 }}>
                      {detail.quote?.c ? `$${detail.quote.c.toFixed(2)}` : '—'}
                    </div>
                    {detail.quote?.c && detail.quote?.pc && (
                      <div style={{ fontSize: 12, color: detail.quote.c >= detail.quote.pc ? '#1a8c52' : '#c0392b' }}>
                        {detail.quote.c >= detail.quote.pc ? '▲' : '▼'} {Math.abs(((detail.quote.c - detail.quote.pc) / detail.quote.pc) * 100).toFixed(2)}%
                      </div>
                    )}
                  </div>
                  <ScoreRing score={detail.ecniveScore} size={52} fontSize={16} />
                </div>
              </div>

              {/* PRICE CHART */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                  Price Chart
                  <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>via Yahoo Finance · hover to inspect</span>
                </div>
                <StockChart symbol={selected!} />
              </div>

              {/* SIGNAL CARDS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 22 }}>
                {[
                  { label: 'Beat Streak', value: `${detail.beatStreak}Q`, color: 'var(--text)' },
                  { label: 'Avg Surprise', value: `${detail.avgSurprise >= 0 ? '+' : ''}${detail.avgSurprise}%`, color: detail.avgSurprise >= 0 ? '#1a8c52' : '#c0392b' },
                  { label: 'Short Interest', value: `${detail.shortInterest?.toFixed(1)}%`, color: detail.shortInterest > 5 ? '#c0392b' : '#1a8c52' },
                  { label: 'Revenue Growth', value: `${detail.revenueGrowth >= 0 ? '+' : ''}${detail.revenueGrowth?.toFixed(1)}%`, color: detail.revenueGrowth >= 0 ? '#1a8c52' : '#c0392b' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>{label}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 600, color }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* EARNINGS HISTORY */}
              {detail.earningsHistory?.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Earnings History — Real Data</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Quarter', 'Period', 'Est EPS', 'Actual EPS', 'Surprise %', 'Result'].map(h => (
                            <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', padding: '7px 10px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {detail.earningsHistory.map((e: any, i: number) => {
                          const beat = e.actual != null && e.estimate != null && e.actual > e.estimate;
                          const surpPct = e.estimate && e.actual
                            ? ((e.actual - e.estimate) / Math.abs(e.estimate) * 100).toFixed(1)
                            : null;
                          return (
                            <tr key={i}>
                              <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 11 }}>Q{e.quarter} '{String(e.year).slice(2)}</span></td>
                              <td style={td}><span style={{ fontSize: 11, color: 'var(--text3)' }}>{e.period}</span></td>
                              <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 11 }}>{e.estimate != null ? `$${e.estimate.toFixed(2)}` : '—'}</span></td>
                              <td style={td}><strong style={{ fontFamily: 'monospace', fontSize: 11, color: beat ? '#1a8c52' : '#c0392b' }}>{e.actual != null ? `$${e.actual.toFixed(2)}` : '—'}</strong></td>
                              <td style={td}>
                                {surpPct != null && (
                                  <span style={{ padding: '2px 7px', borderRadius: 20, fontSize: 10, background: beat ? 'var(--green-light)' : 'var(--red-light)', color: beat ? '#1a6b3c' : '#c0392b' }}>
                                    {+surpPct > 0 ? '+' : ''}{surpPct}%
                                  </span>
                                )}
                              </td>
                              <td style={td}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: beat ? '#1a8c52' : '#c0392b' }}>
                                  {e.actual != null && e.estimate != null ? (beat ? '✓ BEAT' : '✗ MISS') : '—'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text3)' }}>
                    Real data via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a>
                  </div>
                </div>
              )}

              {/* NEWS */}
              {news.length > 0 && (
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                    Latest News
                    <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>via Finnhub · last 7 days</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {news.slice(0, 8).map((n: any, i: number) => (
                      <a key={i} href={n.url} target="_blank" style={{
                        textDecoration: 'none', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', gap: 10, padding: '9px 11px',
                        border: '1px solid var(--border)', borderRadius: 8, transition: 'border-color .12s',
                      }}
                        onMouseOver={e => (e.currentTarget.style.borderColor = '#1a6b3c')}
                        onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{n.headline}</div>
                          <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 3 }}>
                            {n.source} · {new Date(n.datetime * 1000).toLocaleDateString()}
                          </div>
                        </div>
                        <span style={{
                          flexShrink: 0, padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500,
                          background: n.sentiment === 'Positive' ? 'var(--green-light)' : n.sentiment === 'Negative' ? 'var(--red-light)' : 'var(--surface2)',
                          color: n.sentiment === 'Positive' ? '#1a6b3c' : n.sentiment === 'Negative' ? '#c0392b' : 'var(--text2)',
                        }}>{n.sentiment}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* PREDICTION CARD */}
              <div style={{
                background: beat ? '#1a6b3c' : '#c0392b',
                color: '#fff', borderRadius: 14, padding: '20px 22px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 4 }}>Ecnived Prediction</div>
                    <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'monospace' }}>{beat ? 'BEAT ↑' : 'MISS ↓'}</div>
                    <div style={{ fontSize: 16, opacity: .88, marginTop: 2 }}>Confidence: {prob}%</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '12px 14px', maxWidth: 300, flex: 1 }}>
                    <div style={{ fontWeight: 600, marginBottom: 7, fontSize: 12 }}>Signal Breakdown</div>
                    <div style={{ fontSize: 11, opacity: .9, lineHeight: 1.8 }}>
                      1. Beat streak: {detail.beatStreak} consecutive quarters<br />
                      2. Avg EPS surprise: {detail.avgSurprise >= 0 ? '+' : ''}{detail.avgSurprise}%<br />
                      3. Short interest: {detail.shortInterest?.toFixed(1)}% {detail.shortInterest > 5 ? '(elevated)' : '(low — bullish)'}
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 10, opacity: .6 }}>
                  ⚠ Quantitative prediction based on historical patterns. Not financial advice. Ecnived is not a registered investment advisor.
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
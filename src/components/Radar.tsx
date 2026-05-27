'use client';
import { useEffect, useState } from 'react';
import ScoreRing from './ScoreRing';
import StockChart from './StockChart';
import { scoreToProbability } from '@/lib/scores';
import Feedback from './Feedback';

const DAY_KEYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function Radar({ refreshKey }: { refreshKey: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [calendar, setCalendar] = useState<Record<string, any[]>>({});
  const [calLoading, setCalLoading] = useState(true);
  const [expandedNews, setExpandedNews] = useState<number | null>(null);
  const [newsSums, setNewsSums] = useState<Record<number, string>>({});
  const [newsSumLoading, setNewsSumLoading] = useState<Record<number, boolean>>({});
  const [showCite, setShowCite] = useState<Record<number, boolean>>({});
  const [citationFmt, setCitationFmt] = useState<Record<number, string>>({});
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    async function loadCalendar() {
      setCalLoading(true);
      try {
        const res = await fetch('/api/earnings');
        const data = await res.json();
        setCalendar(data.grouped || {});
        // Load scores for all stocks in calendar
        const allSyms = Object.values(data.grouped || {}).flat().map((s: any) => s.sym);
        allSyms.forEach(async (sym: string) => {
          try {
            const res = await fetch(`/api/quote?symbol=${sym}`);
            const d = await res.json();
            setScores(prev => ({ ...prev, [sym]: d.ecniveScore || 50 }));
          } catch {}
        });
      } catch {}
      setCalLoading(false);
    }
    loadCalendar();
  }, [refreshKey]);

  async function openDive(sym: string) {
    setSelected(sym);
    setDetailLoading(true);
    setDetail(null);
    setNews([]);
    setExpandedNews(null);
    setNewsSums({});
    setNewsSumLoading({});
    setShowCite({});
    setCitationFmt({});
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

async function handleNewsSum(idx: number, article: any) {
    if (newsSums[idx]) return;
    setNewsSumLoading(prev => ({ ...prev, [idx]: true }));
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: article.url, headline: article.headline, source: article.source }),
      });
      const data = await res.json();
      setNewsSums(prev => ({ ...prev, [idx]: data.summary }));
    } catch {
      setNewsSums(prev => ({ ...prev, [idx]: 'Could not load summary. Try opening the article directly.' }));
    }
    setNewsSumLoading(prev => ({ ...prev, [idx]: false }));
  }

  function generateCitation(article: any, format: string): string {
    const author = article.source || 'Unknown';
    const title = article.headline || 'Untitled';
    const url = article.url || '';
    const date = article.datetime ? new Date(article.datetime * 1000) : new Date();
    const year = date.getFullYear();
    const fullDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const accessDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    switch (format) {
      case 'APA': return `${author}. (${year}). ${title}. Retrieved ${accessDate}, from ${url}`;
      case 'MLA': return `"${title}." ${author}, ${fullDate}, ${url}. Accessed ${accessDate}.`;
      case 'Chicago': return `${author}. "${title}." ${fullDate}. ${url}.`;
      case 'AMA': return `${author}. ${title}. Published ${fullDate}. Accessed ${accessDate}. ${url}`;
      case 'Harvard': return `${author} (${year}) '${title}', ${fullDate}. Available at: ${url}`;
      default: return `${author}. "${title}." ${fullDate}.`;
    }
  }

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 18 }}>Earnings Radar</h1>

      {/* CALENDAR HEADER */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 0, marginBottom: 4 }}>
        {DAY_SHORT.map((d, i) => (
          <div key={d} style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '.07em', color: 'var(--text3)', textAlign: 'center',
            padding: '6px 0', borderBottom: '2px solid var(--border)',
          }}>
            {d}
            {calendar[DAY_KEYS[i]]?.[0]?.date && (
              <span style={{ marginLeft: 4, fontSize: 9, color: 'var(--text3)', fontWeight: 400 }}>
                {new Date(calendar[DAY_KEYS[i]][0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* CALENDAR GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 24 }}>
        {calLoading ? (
          DAY_KEYS.map(d => (
            <div key={d} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0,1,2].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 8 }} />)}
            </div>
          ))
        ) : (
          DAY_KEYS.map(dayKey => {
            const stocks = calendar[dayKey] || [];
            return (
              <div key={dayKey} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stocks.length === 0 ? (
                  <div style={{ padding: 10, border: '1px dashed var(--border)', borderRadius: 8, fontSize: 11, color: 'var(--text3)', textAlign: 'center' }}>
                    No earnings
                  </div>
                ) : (
                  stocks.slice(0, 6).map((s: any) => {
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
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>EPS est: {s.eps}</div>
                        <div style={{ fontSize: 10, color: 'var(--text3)' }}>Rev est: {s.rev}</div>
                        {s.hour && <div style={{ fontSize: 9, color: 'var(--text3)', marginTop: 2 }}>{s.hour === 'bmo' ? '🌅 Pre-market' : s.hour === 'amc' ? '🌙 After hours' : ''}</div>}
                      </div>
                    );
                  })
                )}
              </div>
            );
          })
        )}
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
              {news.slice(0, 8).map((n: any, i: number) => {
                const sentColor = n.sentiment === 'Positive'
                  ? { bg: 'var(--green-light)', color: '#1a6b3c' }
                  : n.sentiment === 'Negative'
                  ? { bg: 'var(--red-light)', color: '#c0392b' }
                  : { bg: 'var(--surface2)', color: 'var(--text2)' };
                const isOpen = expandedNews === i;
                const fmt = citationFmt[i] || 'APA';
                return (
                  <div key={i} style={{ border: `1px solid ${isOpen ? '#1a6b3c' : 'var(--border)'}`, borderRadius: 8, overflow: 'hidden', transition: 'border-color .12s' }}>
                    {/* ROW */}
                    <div onClick={() => setExpandedNews(prev => prev === i ? null : i)} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 11px', cursor: 'pointer' }}
                      onMouseOver={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseOut={e => (e.currentTarget.style.background = '')}
                    >
                      <div style={{ width: 3, borderRadius: 2, background: sentColor.color, flexShrink: 0, alignSelf: 'stretch', minHeight: 32 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4 }}>{n.headline}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 10, color: 'var(--text3)' }}>{n.source} · {new Date(n.datetime * 1000).toLocaleDateString()}</span>
                          <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 7px', borderRadius: 20, background: sentColor.bg, color: sentColor.color }}>{n.sentiment}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                    </div>

                    {/* EXPANDED */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 12px', background: 'var(--surface2)' }}>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                          <button onClick={() => handleNewsSum(i, n)} disabled={!!newsSumLoading[i]} style={{
                            padding: '5px 12px', borderRadius: 6, border: 'none', background: '#1a6b3c',
                            color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
                            cursor: newsSumLoading[i] ? 'not-allowed' : 'pointer', opacity: newsSumLoading[i] ? .7 : 1,
                          }}>{newsSumLoading[i] ? '⏳ Fetching...' : '✦ Summarize'}</button>
                          <a href={n.url} target="_blank" style={{
                            padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
                            background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit',
                            fontSize: 12, fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>↗ Open Article</a>
                          <button onClick={() => setShowCite(prev => ({ ...prev, [i]: !prev[i] }))} style={{
                            padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
                            background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit',
                            fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          }}>📎 Cite</button>
                        </div>

                        {/* SUMMARY SKELETON */}
                        {newsSumLoading[i] && (
                          <div style={{ padding: 12, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, marginBottom: 8 }}>
                            <div className="skeleton" style={{ height: 11, width: '90%', marginBottom: 6 }} />
                            <div className="skeleton" style={{ height: 11, width: '75%', marginBottom: 6 }} />
                            <div className="skeleton" style={{ height: 11, width: '85%' }} />
                          </div>
                        )}

                        {/* SUMMARY */}
                        {newsSums[i] && (
                          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#1a6b3c', marginBottom: 6 }}>Summary</div>
                            <pre style={{ fontFamily: 'inherit', fontSize: 12, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{newsSums[i]}</pre>
                          </div>
                        )}

                        {/* CITATION */}
                        {showCite[i] && (
                          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>Citation Format</div>
                            <div style={{ display: 'flex', gap: 5, marginBottom: 8, flexWrap: 'wrap' }}>
                              {['APA','MLA','Chicago','AMA','Harvard'].map(f => (
                                <button key={f} onClick={() => setCitationFmt(prev => ({ ...prev, [i]: f }))} style={{
                                  padding: '2px 9px', borderRadius: 20, border: '1px solid var(--border)',
                                  background: fmt === f ? '#1a6b3c' : 'var(--surface2)',
                                  color: fmt === f ? '#fff' : 'var(--text2)',
                                  fontFamily: 'inherit', fontSize: 11, cursor: 'pointer',
                                }}>{f}</button>
                              ))}
                            </div>
                            <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '8px 10px', fontSize: 11, fontFamily: 'monospace', color: 'var(--text)', wordBreak: 'break-word', marginBottom: 8, lineHeight: 1.6 }}>
                              {generateCitation(n, fmt)}
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText(generateCitation(n, fmt)); setCopied(i); setTimeout(() => setCopied(null), 2000); }} style={{
                              padding: '4px 12px', borderRadius: 6, border: 'none',
                              background: copied === i ? '#1a8c52' : '#1a6b3c',
                              color: '#fff', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            }}>{copied === i ? '✓ Copied!' : 'Copy'}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.15)' }}>
                  <Feedback context={`radar-${selected}`} label="Was this prediction helpful?" />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
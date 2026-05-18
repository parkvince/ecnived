'use client';
import { useEffect, useState, useRef } from 'react';
import ScoreRing from './ScoreRing';

interface Stock {
  sym: string;
  name: string;
  sector: string;
  dte: number;
  price: number | null;
  change: number | null;
  score: number;
  sentiment: string;
  beatStreak: number;
  avgSurprise: number;
  shortInterest: number;
  pe: number | null;
  mcap: string | null;
}

interface StockDetail {
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
}

const SECTORS = ['', 'Technology', 'Healthcare', 'Finance', 'Consumer', 'Energy', 'Industrials'];
const SENTIMENTS = ['', 'Very Bullish', 'Bullish', 'Neutral', 'Bearish', 'Very Bearish'];

export default function Screener({ refreshKey }: { refreshKey: number }) {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StockDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sortCol, setSortCol] = useState('score');
  const [sortDir, setSortDir] = useState(-1);
  const [search, setSearch] = useState('');
  const [acResults, setAcResults] = useState<any[]>([]);
  const [showAc, setShowAc] = useState(false);

  const [sector, setSector] = useState('');
  const [maxDte, setMaxDte] = useState('');
  const [minScore, setMinScore] = useState(0);
  const [minStreak, setMinStreak] = useState(0);
  const [sentFilter, setSentFilter] = useState('');

  async function fetchScreener() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sector) params.set('sector', sector);
      if (maxDte) params.set('dte', maxDte);
      if (minScore > 0) params.set('minScore', String(minScore));
      if (minStreak > 0) params.set('streak', String(minStreak));
      const res = await fetch(`/api/screener?${params}`);
      const data = await res.json();
      let result = data.stocks || [];
      if (sentFilter) result = result.filter((s: Stock) => s.sentiment === sentFilter);
      setStocks(result);
    } catch {}
    setLoading(false);
  }

  async function fetchDetail(sym: string) {
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/quote?symbol=${sym}`);
      const data = await res.json();
      setSelected(data);
    } catch {}
    setDetailLoading(false);
  }

  async function onSearchChange(v: string) {
    setSearch(v);
    if (!v) { setShowAc(false); return; }
    try {
      const res = await fetch(`/api/search?q=${v}`);
      const data = await res.json();
      setAcResults(data.result || []);
      setShowAc(true);
    } catch {}
  }

  function pickAc(sym: string) {
    setSearch(sym);
    setShowAc(false);
    fetchDetail(sym);
  }

  function sortBy(col: string) {
    if (sortCol === col) setSortDir(d => d * -1);
    else { setSortCol(col); setSortDir(-1); }
  }

  const sorted = [...stocks].sort((a: any, b: any) => {
    const va = a[sortCol], vb = b[sortCol];
    if (typeof va === 'string') return va.localeCompare(vb) * sortDir;
    return ((va ?? 0) - (vb ?? 0)) * sortDir;
  });

  useEffect(() => { fetchScreener(); }, [refreshKey]);

  function sentStyle(s: string) {
    if (s.includes('Bull')) return { background: 'var(--green-light)', color: '#1a6b3c' };
    if (s.includes('Bear')) return { background: 'var(--red-light)', color: '#c0392b' };
    return { background: 'var(--surface2)', color: 'var(--text2)' };
  }

  const th: React.CSSProperties = {
    textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '.07em',
    textTransform: 'uppercase', color: 'var(--text3)', padding: '7px 10px',
    borderBottom: '1px solid var(--border)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
  };
  const td: React.CSSProperties = {
    padding: '9px 10px', borderBottom: '1px solid var(--border)', fontSize: 12, verticalAlign: 'middle',
  };

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 18 }}>Stock Screener</h1>

      {/* SEARCH */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', pointerEvents: 'none' }}>🔍</span>
        <input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          onFocus={() => acResults.length && setShowAc(true)}
          onBlur={() => setTimeout(() => setShowAc(false), 150)}
          placeholder="Search ticker or company — e.g. AAPL, Tesla, NVDA..."
          style={{
            width: '100%', padding: '10px 12px 10px 36px',
            border: '1px solid var(--border)', borderRadius: 8,
            background: 'var(--surface)', color: 'var(--text)',
            fontSize: 14, fontFamily: 'inherit', outline: 'none', height: 42,
          }}
        />
        {showAc && acResults.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 2px)', left: 0, right: 0,
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, zIndex: 100, boxShadow: '0 4px 16px rgba(0,0,0,.08)', overflow: 'hidden',
          }}>
            {acResults.map((r, i) => (
              <div key={i} onMouseDown={() => pickAc(r.symbol)} style={{
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL CARD */}
      {(selected || detailLoading) && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '20px 22px', marginBottom: 22 }}>
          {detailLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div className="skeleton" style={{ height: 30, width: '40%' }} />
              <div className="skeleton" style={{ height: 20, width: '60%' }} />
              <div className="skeleton" style={{ height: 120 }} />
            </div>
          ) : selected && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 26, fontWeight: 700 }}>{selected.symbol}</span>
                    <ScoreRing score={selected.ecniveScore} />
                    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, ...sentStyle(selected.sentiment) }}>
                      {selected.sentiment}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                    {selected.profile?.name} · {selected.profile?.exchange} · {selected.profile?.finnhubIndustry}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selected.profile?.weburl && (
                      <a href={selected.profile.weburl} target="_blank" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--border)', textDecoration: 'none' }}>IR Page ↗</a>
                    )}
                    <a href={`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${selected.symbol}`} target="_blank" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--border)', textDecoration: 'none' }}>SEC EDGAR ↗</a>
                    <a href="https://finnhub.io" target="_blank" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'var(--surface2)', color: 'var(--text3)', border: '1px solid var(--border)', textDecoration: 'none' }}>Finnhub ↗</a>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, textAlign: 'right' }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 3 }}>Price</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 600 }}>
                      {selected.quote?.c ? `$${selected.quote.c.toFixed(2)}` : '—'}
                    </div>
                    {selected.quote?.c && selected.quote?.pc && (
                      <div style={{ fontSize: 12, color: selected.quote.c >= selected.quote.pc ? '#1a8c52' : '#c0392b' }}>
                        {selected.quote.c >= selected.quote.pc ? '▲' : '▼'} {Math.abs(((selected.quote.c - selected.quote.pc) / selected.quote.pc) * 100).toFixed(2)}%
                      </div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 3 }}>52W High</div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#1a8c52' }}>
                      {selected.metrics?.['52WeekHigh'] ? `$${selected.metrics['52WeekHigh'].toFixed(2)}` : '—'}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginTop: 6, marginBottom: 3 }}>52W Low</div>
                    <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#c0392b' }}>
                      {selected.metrics?.['52WeekLow'] ? `$${selected.metrics['52WeekLow'].toFixed(2)}` : '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 3 }}>Beat Streak</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 600 }}>{selected.beatStreak}Q</div>
                    <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginTop: 6, marginBottom: 3 }}>Avg Surprise</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, color: selected.avgSurprise >= 0 ? '#1a8c52' : '#c0392b' }}>
                      {selected.avgSurprise >= 0 ? '+' : ''}{selected.avgSurprise}%
                    </div>
                  </div>
                </div>
              </div>

              {/* EARNINGS HISTORY */}
              {selected.earningsHistory?.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Earnings History — Real Data via Finnhub</div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['Quarter', 'Period', 'Est EPS', 'Actual EPS', 'Surprise', 'Result'].map(h => (
                            <th key={h} style={th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selected.earningsHistory.map((e: any, i: number) => {
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
                                {e.actual != null && e.estimate != null && (
                                  <span style={{ fontSize: 11, fontWeight: 600, color: beat ? '#1a8c52' : '#c0392b' }}>
                                    {beat ? '✓ BEAT' : '✗ MISS'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text3)' }}>
                    Real earnings data via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* FILTERS */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Filter & Screen</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Sector</div>
            <select value={sector} onChange={e => setSector(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 12 }}>
              {SECTORS.map(s => <option key={s} value={s}>{s || 'All Sectors'}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Days to Earnings</div>
            <select value={maxDte} onChange={e => setMaxDte(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 12 }}>
              <option value="">Any</option>
              <option value="7">&lt; 7 days</option>
              <option value="14">&lt; 14 days</option>
              <option value="30">&lt; 30 days</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Sentiment</div>
            <select value={sentFilter} onChange={e => setSentFilter(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 12 }}>
              {SENTIMENTS.map(s => <option key={s} value={s}>{s || 'Any'}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Min Score: {minScore}</div>
            <input type="range" min={0} max={100} step={5} value={minScore} onChange={e => setMinScore(+e.target.value)} style={{ width: '100%', accentColor: '#1a6b3c' }} />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Min Beat Streak: {minStreak}Q</div>
            <input type="range" min={0} max={8} step={1} value={minStreak} onChange={e => setMinStreak(+e.target.value)} style={{ width: '100%', accentColor: '#1a6b3c' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <button onClick={fetchScreener} style={{ flex: 1, padding: '7px 14px', borderRadius: 6, border: 'none', background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>Apply</button>
            <button onClick={() => { setSector(''); setMaxDte(''); setMinScore(0); setMinStreak(0); setSentFilter(''); setTimeout(fetchScreener, 0); }} style={{ padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>Reset</button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            Results <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface2)', color: 'var(--text3)', marginLeft: 6 }}>{sorted.length} stocks</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>Click row to see detail · Click header to sort</div>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0,1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 40 }} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {[
                    { col: 'sym', label: 'Ticker' },
                    { col: 'name', label: 'Company' },
                    { col: 'sector', label: 'Sector' },
                    { col: 'price', label: 'Price' },
                    { col: 'score', label: 'Score' },
                    { col: 'sentiment', label: 'Sentiment' },
                    { col: 'dte', label: 'Days to Earn.' },
                    { col: 'beatStreak', label: 'Streak' },
                    { col: 'avgSurprise', label: 'Avg Surprise' },
                    { col: 'shortInterest', label: 'Short %' },
                  ].map(({ col, label }) => (
                    <th key={col} onClick={() => sortBy(col)} style={th}>
                      {label}{sortCol === col ? (sortDir === -1 ? ' ↓' : ' ↑') : ''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map(s => (
                  <tr key={s.sym} onClick={() => fetchDetail(s.sym)} style={{ cursor: 'pointer' }}
                    onMouseOver={e => Array.from(e.currentTarget.cells).forEach(c => (c.style.background = 'var(--green-light)'))}
                    onMouseOut={e => Array.from(e.currentTarget.cells).forEach(c => (c.style.background = ''))}
                  >
                    <td style={td}><strong style={{ fontFamily: 'monospace' }}>{s.sym}</strong></td>
                    <td style={td}>{s.name}</td>
                    <td style={td}><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, background: 'var(--surface2)', color: 'var(--text2)' }}>{s.sector}</span></td>
                    <td style={td}>
                      <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.price ? `$${s.price.toFixed(2)}` : '—'}</div>
                      {s.change != null && <div style={{ fontSize: 10, color: s.change >= 0 ? '#1a8c52' : '#c0392b' }}>{s.change >= 0 ? '+' : ''}{s.change}%</div>}
                    </td>
                    <td style={td}><ScoreRing score={s.score} size={32} fontSize={11} /></td>
                    <td style={td}><span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 500, ...sentStyle(s.sentiment) }}>{s.sentiment}</span></td>
                    <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.dte}d</span></td>
                    <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.beatStreak}Q</span></td>
                    <td style={td}><span style={{ fontSize: 12, color: s.avgSurprise >= 0 ? '#1a8c52' : '#c0392b' }}>{s.avgSurprise >= 0 ? '+' : ''}{s.avgSurprise}%</span></td>
                    <td style={td}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{s.shortInterest.toFixed(1)}%</span></td>
                  </tr>
                ))}
                {sorted.length === 0 && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No stocks match current filters</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';
import { useEffect, useState } from 'react';
import ScoreRing from './ScoreRing';

const FEATURED = ['NVDA', 'META', 'AAPL'];

interface QuoteData {
  price: number | null;
  change: number | null;
}

function MarketStatus() {
  const now = new Date();
  const day = now.getDay();
  const totalMins = now.getHours() * 60 + now.getMinutes();
  const isWeekday = day >= 1 && day <= 5;
  const isOpen = isWeekday && totalMins >= 570 && totalMins < 960;
  const isPreMarket = isWeekday && totalMins >= 240 && totalMins < 570;
  const isAfterHours = isWeekday && totalMins >= 960 && totalMins < 1200;

  let label = 'Market Closed';
  let color = '#c0392b';
  let bg = 'var(--red-light)';
  if (isOpen) { label = 'Market Open'; color = '#1a8c52'; bg = 'var(--green-light)'; }
  else if (isPreMarket) { label = 'Pre-Market'; color = '#c9a84c'; bg = 'var(--gold-light)'; }
  else if (isAfterHours) { label = 'After Hours'; color = '#c9a84c'; bg = 'var(--gold-light)'; }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: bg, border: `1px solid ${color}40` }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, animation: isOpen ? 'pulse 2s infinite' : 'none' }} />
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}

export default function Dashboard({ refreshKey, onNavigate }: { refreshKey: number; onNavigate: (tab: string) => void }) {
  const [indices, setIndices] = useState<Record<string, QuoteData>>({});
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState('');

  async function fetchData() {
    setLoading(true);
    try {
      const idxSyms = ['SPY', 'QQQ', 'DIA'];
      const idxResults = await Promise.all(
        idxSyms.map(s => fetch(`/api/quote?symbol=${s}`).then(r => r.json()))
      );
      const newIndices: Record<string, QuoteData> = {};
      idxSyms.forEach((s, i) => {
        const d = idxResults[i];
        newIndices[s] = {
          price: d.quote?.c || null,
          change: d.quote?.c && d.quote?.pc
            ? +((d.quote.c - d.quote.pc) / d.quote.pc * 100).toFixed(2)
            : null,
        };
      });
      setIndices(newIndices);
      const pickResults = await Promise.all(
        FEATURED.map(s => fetch(`/api/quote?symbol=${s}`).then(r => r.json()))
      );
      setPicks(pickResults);
      setUpdatedAt(new Date().toLocaleTimeString());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [refreshKey]);

  const indexMap = [
    { sym: 'SPY', label: 'S&P 500' },
    { sym: 'QQQ', label: 'NASDAQ' },
    { sym: 'DIA', label: 'DOW' },
  ];

  const earningsWeek = [
    { day: 'Mon', syms: ['AAPL', 'MSFT'] },
    { day: 'Tue', syms: ['META', 'AMZN'] },
    { day: 'Wed', syms: ['NVDA', 'AMD'] },
    { day: 'Thu', syms: ['JPM', 'GS'] },
    { day: 'Fri', syms: ['V', 'JNJ'] },
  ];

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em' }}>Market Overview</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <MarketStatus />
          {updatedAt && (
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>Updated {updatedAt}</span>
          )}
        </div>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 24 }}>

        {/* Markets */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Markets Today</div>
          {indexMap.map(({ sym, label }) => (
            <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
              <div style={{ textAlign: 'right' }}>
                {indices[sym]?.price != null ? (
                  <>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>
                      ${indices[sym].price!.toFixed(2)}
                    </div>
                    <div style={{ fontSize: 11, color: (indices[sym].change ?? 0) >= 0 ? '#1a8c52' : '#c0392b' }}>
                      {(indices[sym].change ?? 0) >= 0 ? '▲' : '▼'} {Math.abs(indices[sym].change ?? 0).toFixed(2)}%
                    </div>
                  </>
                ) : (
                  <div className="skeleton" style={{ width: 70, height: 28 }} />
                )}
              </div>
            </div>
          ))}
          <div style={{ marginTop: 8, fontSize: 10, color: 'var(--text3)' }}>
            via Finnhub · {updatedAt || 'Loading...'}
            <a href="https://finnhub.io" target="_blank" style={{ marginLeft: 6, color: '#1a6b3c', textDecoration: 'none' }}>↗</a>
          </div>
        </div>

        {/* Earnings this week */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>Earnings This Week</div>
          <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 500, marginBottom: 4 }}>
            {earningsWeek.reduce((a, d) => a + d.syms.length, 0)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 10 }}>S&P 500 companies reporting</div>
          {earningsWeek.map(d => (
            <div key={d.day} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
              <span style={{ color: 'var(--text3)' }}>{d.day}</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--text2)' }}>{d.syms.join(', ')}</span>
            </div>
          ))}
        </div>

        {/* Top pick */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Top Ecnived Pick Today</div>
          {picks[0] ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <ScoreRing score={picks[0].ecniveScore || 0} size={48} fontSize={15} />
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700 }}>{picks[0].symbol}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{picks[0].profile?.name || ''}</div>
                  {picks[0].quote?.c && (
                    <div style={{ fontSize: 12, color: '#1a8c52' }}>${picks[0].quote.c.toFixed(2)}</div>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>
                Beat streak: {picks[0].beatStreak}Q · Avg surprise: {picks[0].avgSurprise > 0 ? '+' : ''}{picks[0].avgSurprise}%
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>
                via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a> · Quantitative score
              </div>
            </div>
          ) : (
            <div className="skeleton" style={{ height: 80 }} />
          )}
        </div>
      </div>

      {/* TODAY'S PICKS */}
      <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 14 }}>
        Today's Ecnived Picks
        <span style={{
          marginLeft: 10, fontSize: 11, fontWeight: 500,
          background: 'var(--surface2)', color: 'var(--text3)',
          padding: '2px 8px', borderRadius: 20, verticalAlign: 'middle',
        }}>Informational only · Not financial advice</span>
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 28 }}>
        {loading ? (
          [0, 1, 2].map(i => (
            <div key={i} className="skeleton" style={{ height: 180, borderRadius: 14 }} />
          ))
        ) : (
          picks.map((pick, i) => (
            <div key={i} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 14, padding: '18px 20px', cursor: 'pointer', transition: 'box-shadow .15s',
            }}
              onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,107,60,.1)')}
              onMouseOut={e => (e.currentTarget.style.boxShadow = '')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 700 }}>{pick.symbol}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{pick.profile?.name || pick.symbol}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{pick.profile?.finnhubIndustry || 'Technology'}</div>
                </div>
                <ScoreRing score={pick.ecniveScore || 0} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 600 }}>
                    {pick.quote?.c ? `$${pick.quote.c.toFixed(2)}` : '—'}
                  </div>
                  {pick.quote?.c && pick.quote?.pc && (
                    <div style={{ fontSize: 11, color: pick.quote.c >= pick.quote.pc ? '#1a8c52' : '#c0392b' }}>
                      {pick.quote.c >= pick.quote.pc ? '▲' : '▼'} {Math.abs(((pick.quote.c - pick.quote.pc) / pick.quote.pc) * 100).toFixed(2)}%
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text2)' }}>
                  <div>Beat streak: <strong>{pick.beatStreak}Q</strong></div>
                  <div>Avg surprise: <strong style={{ color: pick.avgSurprise >= 0 ? '#1a8c52' : '#c0392b' }}>
                    {pick.avgSurprise >= 0 ? '+' : ''}{pick.avgSurprise}%
                  </strong></div>
                </div>
              </div>
              <div
                onClick={(e) => { e.stopPropagation(); onNavigate('Radar'); }}
                style={{
                  background: '#1a6b3c', color: '#fff', borderRadius: 6,
                  padding: '6px 12px', textAlign: 'center', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer',
                }}>View Analysis →</div>
            </div>
          ))
        )}
      </div>

      {/* DISCLAIMER */}
      <div style={{
        background: 'var(--gold-light)', border: '1px solid #e6c97a',
        borderRadius: 8, padding: '10px 14px', fontSize: 11, color: 'var(--text2)',
      }}>
        ⚠ <strong>Ecnived is not a registered investment advisor. This is not financial advice.</strong> Scores are calculated using quantitative formulas based on historical earnings patterns, beat streaks, analyst revision trends, short interest signals, and revenue growth — factors that have historically correlated with earnings predictability. Data via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a>
      </div>
    </div>
  );
}
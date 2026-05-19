'use client';
import { useEffect, useState } from 'react';
import { loadPortfolio, savePortfolio, Position } from '@/lib/storage';
import ScoreRing from './ScoreRing';
import StockChart from './StockChart';

interface EnrichedPosition extends Position {
  currentPrice: number | null;
  change: number | null;
  score: number;
  sentiment: string;
  value: number | null;
  pnl: number | null;
  pnlPct: number | null;
  sector: string;
}

export default function Portfolio({ refreshKey }: { refreshKey: number }) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [enriched, setEnriched] = useState<EnrichedPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ticker: '', shares: '', cost: '', date: '' });
  const [formError, setFormError] = useState('');
  const [rebalResult, setRebalResult] = useState('');
  const [rebalLoading, setRebalLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [chartTicker, setChartTicker] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function enrich(pos: Position[]): Promise<EnrichedPosition[]> {
    return Promise.all(pos.map(async p => {
      try {
        const res = await fetch(`/api/quote?symbol=${p.ticker}`);
        const data = await res.json();
        const curr = data.quote?.c || null;
        const prev = data.quote?.pc || null;
        const change = curr && prev ? +((curr - prev) / prev * 100).toFixed(2) : null;
        const value = curr ? curr * p.shares : null;
        const totalCost = p.cost * p.shares;
        const pnl = value ? value - totalCost : null;
        const pnlPct = pnl != null ? (pnl / totalCost * 100) : null;
        return {
          ...p,
          currentPrice: curr,
          change,
          score: data.ecniveScore || 50,
          sentiment: data.sentiment || 'Neutral',
          value,
          pnl,
          pnlPct,
          sector: data.profile?.finnhubIndustry || 'Unknown',
        };
      } catch {
        return { ...p, currentPrice: null, change: null, score: 50, sentiment: 'Neutral', value: null, pnl: null, pnlPct: null, sector: 'Unknown' };
      }
    }));
  }

  async function reload(pos?: Position[]) {
    setLoading(true);
    const p = pos ?? positions;
    const e = await enrich(p);
    setEnriched(e);
    setLoading(false);
  }

  useEffect(() => {
    const p = loadPortfolio();
    setPositions(p);
    reload(p);
  }, [refreshKey]);

  function addPosition() {
    setFormError('');
    const ticker = form.ticker.toUpperCase().trim();
    const shares = parseFloat(form.shares);
    const cost = parseFloat(form.cost);
    if (!ticker) { setFormError('Enter a ticker'); return; }
    if (!shares || shares <= 0) { setFormError('Enter valid share count'); return; }
    if (!cost || cost <= 0) { setFormError('Enter valid cost basis'); return; }
    const newPos: Position = { ticker, shares, cost, date: form.date || new Date().toISOString().split('T')[0] };
    const updated = [...positions, newPos];
    setPositions(updated);
    savePortfolio(updated);
    setForm({ ticker: '', shares: '', cost: '', date: '' });
    setShowForm(false);
    reload(updated);
    showToast(`${ticker} added to portfolio`);
  }

  function removePosition(ticker: string) {
    const updated = positions.filter(p => p.ticker !== ticker);
    setPositions(updated);
    savePortfolio(updated);
    setEnriched(enriched.filter(e => e.ticker !== ticker));
    if (chartTicker === ticker) setChartTicker(null);
    showToast(`${ticker} removed`);
  }

  function exportCSV() {
    const header = 'Ticker,Shares,Cost Basis,Current Price,Total Value,P&L ($),P&L (%),Date\n';
    const rows = enriched.map(e =>
      `${e.ticker},${e.shares},${e.cost.toFixed(2)},${e.currentPrice?.toFixed(2) || ''},${e.value?.toFixed(2) || ''},${e.pnl?.toFixed(2) || ''},${e.pnlPct?.toFixed(2) || ''},${e.date}`
    ).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(header + rows);
    a.download = `ecnived_portfolio_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('CSV exported');
  }

  async function getRebalance() {
    setRebalLoading(true);
    setRebalResult('');
    await new Promise(r => setTimeout(r, 600));

    const totalVal = enriched.reduce((a, e) => a + (e.value || 0), 0);
    const highRisk = enriched.filter(e => e.score < 50);
    const topPick = [...enriched].sort((a, b) => b.score - a.score)[0];
    const topConc = enriched
      .map(e => ({ ticker: e.ticker, pct: e.value ? (e.value / totalVal * 100) : 0 }))
      .sort((a, b) => b.pct - a.pct)[0];
    const riskScore = totalVal > 0
      ? Math.round(enriched.reduce((a, e) => a + (100 - e.score) * ((e.value || 0) / totalVal), 0))
      : 0;

    const analysis = `EARNINGS EVENT RISK
Holdings: ${enriched.map(e => `${e.ticker} (Score: ${e.score}, ${e.sentiment})`).join(', ')}

${highRisk.length > 0
      ? `Highest risk holdings: ${highRisk.map(e => `${e.ticker} (${e.score}/100)`).join(', ')}`
      : 'All holdings show acceptable Ecnived scores — no immediate red flags.'}

DETERIORATING SIGNALS
${highRisk.length > 0
      ? highRisk.map(e => `• ${e.ticker}: Score ${e.score}/100, sentiment ${e.sentiment} — monitor ahead of earnings`).join('\n')
      : '• No significant deteriorating signals detected in current holdings.'}

REBALANCING SUGGESTIONS
1. ${topConc && topConc.pct > 40
      ? `${topConc.ticker} is ${topConc.pct.toFixed(0)}% of portfolio — consider trimming for diversification`
      : 'Portfolio concentration looks reasonable — no single holding dominates'}
2. ${topPick
      ? `${topPick.ticker} has strongest Ecnived signal (${topPick.score}/100) — core holding, consider maintaining or adding`
      : 'Maintain current allocation until clearer signals emerge'}
3. ${highRisk.length > 0
      ? `Consider reducing ${highRisk[0].ticker} — below-average score suggests elevated earnings risk`
      : 'Current holdings are well-positioned — stay the course'}

OVERALL ASSESSMENT
Portfolio risk score: ${riskScore}/100 — ${riskScore > 60 ? 'High Risk' : riskScore > 40 ? 'Moderate Risk' : 'Low Risk'}. ${enriched.length} positions, combined value $${totalVal.toLocaleString('en-US', { maximumFractionDigits: 0 })}. ${highRisk.length === 0 ? 'Portfolio is well-positioned for upcoming earnings season.' : `${highRisk.length} holding(s) warrant active monitoring.`}

[Based on real Finnhub data · Not financial advice]`;

    setRebalResult(analysis);
    setRebalLoading(false);
  }

  const totalValue = enriched.reduce((a, e) => a + (e.value || 0), 0);
  const totalCost = enriched.reduce((a, e) => a + e.cost * e.shares, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost * 100) : 0;
  const todayDelta = enriched.reduce((a, e) => a + ((e.currentPrice || 0) * e.shares * ((e.change || 0) / 100)), 0);
  const riskScore = totalValue > 0
    ? Math.round(enriched.reduce((a, e) => a + (100 - e.score) * ((e.value || 0) / totalValue), 0))
    : 0;

  const sectorMap: Record<string, number> = {};
  enriched.forEach(e => {
    const sec = e.sector || 'Unknown';
    sectorMap[sec] = (sectorMap[sec] || 0) + (e.value || 0);
  });

  const td: React.CSSProperties = {
    padding: '9px 10px', borderBottom: '1px solid var(--border)', fontSize: 12, verticalAlign: 'middle',
  };

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
        <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em' }}>Portfolio Tracker</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setShowForm(!showForm)} style={{ padding: '7px 16px', borderRadius: 8, border: 'none', background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            {showForm ? 'Cancel' : '+ Add Position'}
          </button>
          <button onClick={exportCSV} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
            Export CSV
          </button>
          <button onClick={() => reload()} style={{ padding: '7px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 13, cursor: 'pointer' }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* ADD FORM */}
      {showForm && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>New Position</div>
          {formError && (
            <div style={{ padding: '8px 12px', background: 'var(--red-light)', borderRadius: 6, fontSize: 12, color: '#c0392b', marginBottom: 10 }}>{formError}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 12 }}>
            {[
              { label: 'Ticker', key: 'ticker', placeholder: 'AAPL', mono: true },
              { label: 'Shares', key: 'shares', placeholder: '100' },
              { label: 'Cost Basis ($)', key: 'cost', placeholder: '150.00' },
              { label: 'Date Purchased', key: 'date', placeholder: '2024-01-15' },
            ].map(({ label, key, placeholder, mono }) => (
              <div key={key}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>{label}</div>
                <input
                  value={form[key as keyof typeof form]}
                  onChange={e => setForm({ ...form, [key]: key === 'ticker' ? e.target.value.toUpperCase() : e.target.value })}
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontFamily: mono ? 'monospace' : 'inherit', fontSize: 13 }}
                />
              </div>
            ))}
          </div>
          <button onClick={addPosition} style={{ padding: '7px 18px', borderRadius: 6, border: 'none', background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Add Position
          </button>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 18 }}>
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`, sub: '', color: 'var(--text)' },
          { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : '-'}$${Math.abs(totalPnl).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, sub: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(1)}%`, color: totalPnl >= 0 ? '#1a8c52' : '#c0392b' },
          { label: "Today's Change", value: `${todayDelta >= 0 ? '+' : '-'}$${Math.abs(todayDelta).toFixed(0)}`, sub: `${(totalValue > 0 ? todayDelta / totalValue * 100 : 0).toFixed(2)}%`, color: todayDelta >= 0 ? '#1a8c52' : '#c0392b' },
          { label: 'Risk Score', value: `${riskScore}/100`, sub: riskScore > 60 ? 'High Risk' : riskScore > 40 ? 'Moderate Risk' : 'Low Risk', color: riskScore > 60 ? '#c0392b' : riskScore > 40 ? '#c9a84c' : '#1a8c52' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>{label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 500, color }}>{value}</div>
            {sub && <div style={{ fontSize: 11, color, marginTop: 2 }}>{sub}</div>}
          </div>
        ))}
      </div>

      {/* SECTOR ALLOCATION */}
      {Object.keys(sectorMap).length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Sector Allocation</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(sectorMap).sort((a, b) => b[1] - a[1]).map(([sector, val]) => {
              const pct = totalValue > 0 ? (val / totalValue * 100) : 0;
              return (
                <div key={sector} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 120, fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>{sector}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: '#1a6b3c', borderRadius: 3, transition: 'width .5s' }} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)', width: 40, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)', width: 80, textAlign: 'right' }}>${val.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HOLDINGS TABLE */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
          Holdings
          <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface2)', color: 'var(--text3)' }}>
            {positions.length} positions
          </span>
          <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text3)' }}>Saved in browser · persists across sessions · click ticker for chart</span>
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[0, 1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 44 }} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Ticker', 'Shares', 'Cost', 'Current', 'Value', 'P&L ($)', 'P&L (%)', 'Score', 'Alert', ''].map(h => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', padding: '7px 10px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.map(e => (
                  <>
                    <tr key={e.ticker}>
                      <td style={td}>
                        <div
                          style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1a6b3c', cursor: 'pointer', textDecoration: 'underline dotted' }}
                          onClick={() => setChartTicker(prev => prev === e.ticker ? null : e.ticker)}
                          title="Click to view chart"
                        >
                          {e.ticker} {chartTicker === e.ticker ? '▲' : '▼'}
                        </div>
                      </td>
                      <td style={td}><span style={{ fontFamily: 'monospace' }}>{e.shares}</span></td>
                      <td style={td}><span style={{ fontFamily: 'monospace' }}>${e.cost.toFixed(2)}</span></td>
                      <td style={td}>
                        <div style={{ fontFamily: 'monospace', fontSize: 12 }}>{e.currentPrice ? `$${e.currentPrice.toFixed(2)}` : '—'}</div>
                        {e.change != null && <div style={{ fontSize: 10, color: e.change >= 0 ? '#1a8c52' : '#c0392b' }}>{e.change >= 0 ? '+' : ''}{e.change}%</div>}
                      </td>
                      <td style={td}><span style={{ fontFamily: 'monospace' }}>{e.value ? `$${e.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : '—'}</span></td>
                      <td style={td}>
                        {e.pnl != null && <span style={{ fontWeight: 500, color: e.pnl >= 0 ? '#1a8c52' : '#c0392b' }}>
                          {e.pnl >= 0 ? '+' : '-'}${Math.abs(e.pnl).toFixed(0)}
                        </span>}
                      </td>
                      <td style={td}>
                        {e.pnlPct != null && <span style={{ fontSize: 12, color: e.pnlPct >= 0 ? '#1a8c52' : '#c0392b' }}>
                          {e.pnlPct >= 0 ? '+' : ''}{e.pnlPct.toFixed(1)}%
                        </span>}
                      </td>
                      <td style={td}><ScoreRing score={e.score} size={30} fontSize={10} /></td>
                      <td style={td}>
                        {e.score < 45 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--red-light)', color: '#c0392b' }}>⚠ Weak</span>}
                        {e.score >= 75 && <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'var(--green-light)', color: '#1a6b3c' }}>★ Strong</span>}
                      </td>
                      <td style={td}>
                        <button onClick={() => removePosition(e.ticker)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text3)' }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                    {chartTicker === e.ticker && (
                      <tr key={`chart-${e.ticker}`}>
                        <td colSpan={10} style={{ padding: '16px 10px', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
                          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
                            {e.ticker} Price Chart
                            <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 8 }}>via Yahoo Finance · hover to inspect</span>
                            <button onClick={() => setChartTicker(null)} style={{ marginLeft: 12, fontSize: 10, padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', color: 'var(--text3)' }}>✕ Close</button>
                          </div>
                          <StockChart symbol={e.ticker} />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
                {enriched.length === 0 && (
                  <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--text3)', fontSize: 13 }}>No positions yet — add your first holding above</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REBALANCE */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>
            Portfolio Analysis
            <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--green-light)', color: '#1a6b3c', fontWeight: 600 }}>Data-driven</span>
          </div>
          <button onClick={getRebalance} disabled={rebalLoading} style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: rebalLoading ? 'not-allowed' : 'pointer', opacity: rebalLoading ? .7 : 1 }}>
            {rebalLoading ? 'Analyzing...' : 'Analyze Portfolio →'}
          </button>
        </div>
        {rebalResult ? (
          <div style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{rebalResult}</div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Click Analyze to get rebalancing suggestions based on your real holdings and Ecnived scores.</div>
        )}
      </div>

      <div style={{ padding: '10px 14px', background: 'var(--gold-light)', border: '1px solid #e6c97a', borderRadius: 8, fontSize: 11, color: 'var(--text2)' }}>
        ⚠ <strong>Ecnived is not a registered investment advisor. This is not financial advice.</strong> Portfolio saved locally in your browser. Real prices via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a>
      </div>
    </div>
  );
}
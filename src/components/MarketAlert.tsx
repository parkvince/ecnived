'use client';
import { useEffect, useState } from 'react';

interface Alert {
  headline: string;
  ticker: string;
  source: string;
  url: string;
  datetime: number;
  type: string;
  icon: string;
  bullish: boolean | null;
  age: number;
}

export default function MarketAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch('/api/alerts');
        const data = await res.json();
        if (data.alerts?.length) {
          setAlerts(data.alerts);
          setDismissed(false);
        }
      } catch {}
      setLoading(false);
    }
    fetchAlerts();
    // Refresh every 5 minutes
    const interval = setInterval(fetchAlerts, 300000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through alerts every 8 seconds
  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent(i => (i + 1) % alerts.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  if (loading || dismissed || alerts.length === 0) return null;

  const alert = alerts[current];
  const isBullish = alert.bullish === true;
  const isBearish = alert.bullish === false;
  const bg = isBullish ? '#1a6b3c' : isBearish ? '#c0392b' : '#1a3a6b';
  const lightBg = isBullish ? 'rgba(26,107,60,0.08)' : isBearish ? 'rgba(192,57,43,0.08)' : 'rgba(26,58,107,0.08)';
  const borderColor = isBullish ? '#1a6b3c' : isBearish ? '#c0392b' : '#2563eb';

  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      zIndex: 500, width: '90%', maxWidth: 680,
      background: 'var(--surface)', border: `1px solid ${borderColor}`,
      borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
      overflow: 'hidden', animation: 'slideUp .3s ease',
    }}>
      {/* TOP BAR */}
      <div style={{
        background: bg, color: '#fff',
        padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {alert.icon} Market Alert · {alert.type}
          </span>
          {alerts.length > 1 && (
            <span style={{ fontSize: 10, opacity: .7 }}>({current + 1}/{alerts.length})</span>
          )}
        </div>
        <button onClick={() => setDismissed(true)} style={{
          background: 'transparent', border: 'none', color: '#fff',
          cursor: 'pointer', fontSize: 16, opacity: .8, padding: '0 4px',
        }}>✕</button>
      </div>

      {/* CONTENT */}
      <div style={{ padding: '14px 16px', background: lightBg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                color: bg, background: isBullish ? 'var(--green-light)' : isBearish ? 'var(--red-light)' : 'rgba(37,99,235,0.1)',
                padding: '2px 8px', borderRadius: 4,
              }}>{alert.ticker}</span>
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{alert.source} · {alert.age === 0 ? 'Just now' : `${alert.age}h ago`}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: isBullish ? 'var(--green-light)' : isBearish ? 'var(--red-light)' : 'rgba(37,99,235,0.1)',
                color: bg,
              }}>
                {isBullish ? '↑ Bullish Signal' : isBearish ? '↓ Bearish Signal' : '◆ Macro Event'}
              </span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.4, marginBottom: 8 }}>
              {alert.headline}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
              {isBullish
                ? `This type of event historically drives ${alert.ticker} shares higher. Consider monitoring for follow-through buying in the next 1–3 sessions.`
                : isBearish
                ? `This type of event can weigh on ${alert.ticker} shares. Watch for increased volatility and possible downside pressure.`
                : `Major macro event detected. Watch for broad market impact across sectors.`}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href={alert.url} target="_blank" style={{
            padding: '6px 14px', borderRadius: 6, border: 'none',
            background: bg, color: '#fff', fontFamily: 'inherit',
            fontSize: 12, fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
          }}>Read Full Story ↗</a>
          {alerts.length > 1 && (
            <button onClick={() => setCurrent(i => (i + 1) % alerts.length)} style={{
              padding: '6px 14px', borderRadius: 6,
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text2)', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
            }}>Next Alert →</button>
          )}
          <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 'auto' }}>
            ⚠ Not financial advice · Ecnived is not a registered investment advisor
          </span>
        </div>
      </div>

      {/* PROGRESS BAR for auto-cycle */}
      {alerts.length > 1 && (
        <div style={{ height: 2, background: 'var(--border)' }}>
          <div style={{
            height: '100%', background: bg,
            animation: 'progress 8s linear infinite',
          }} />
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes progress { from { width: 0% } to { width: 100% } }
      `}</style>
    </div>
  );
}
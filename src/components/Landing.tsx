'use client';
import { useState, useEffect } from 'react';

const FEATURES = [
  {
    icon: '📈',
    title: 'Earnings Radar',
    desc: 'Real EPS history, beat streaks, analyst estimates, and earnings predictions powered by a 9-signal quantitative formula.',
    tag: 'Core Feature',
  },
  {
    icon: '🔍',
    title: 'Stock Screener',
    desc: 'Filter 25+ stocks and ETFs by sector, sentiment, beat streak, and short interest. Interactive price charts with full timeframe history.',
    tag: 'Live Data',
  },
  {
    icon: '🧠',
    title: 'Sentiment Lab',
    desc: 'AI-powered analysis built from real Finnhub news data. Bullish catalysts, bearish risks, and a forward outlook for any ticker.',
    tag: 'AI-Powered',
  },
  {
    icon: '📰',
    title: 'Market Digest',
    desc: 'Infinite scroll news feed from 15 tickers. Real article summarization, academic citations in 5 formats, and daily market recaps.',
    tag: 'Education',
  },
  {
    icon: '💼',
    title: 'Portfolio Tracker',
    desc: 'Track real P&L with live prices. Sector allocation, risk scoring, inline price charts per holding, and CSV export.',
    tag: 'Persistent',
  },
  {
    icon: '💡',
    title: 'Finance 101',
    desc: '15 rotating financial concepts explained in plain English — from P/E ratios to short squeezes. Built for first-time investors.',
    tag: 'Learn',
  },
];

const SIGNALS = [
  { label: 'EPS Beat Streak', weight: 20, desc: 'Consecutive quarters beating estimates' },
  { label: 'Avg EPS Surprise', weight: 15, desc: 'Historical magnitude of beats/misses' },
  { label: 'Analyst Revisions', weight: 10, desc: 'Recent estimate changes by Wall Street' },
  { label: 'Short Interest', weight: 10, desc: 'Bearish positioning as % of float' },
  { label: 'Revenue Growth', weight: 8, desc: 'YoY top-line expansion rate' },
  { label: 'IV vs HV Ratio', weight: 5, desc: 'Options market implied vs historical vol' },
  { label: 'News Sentiment', weight: 8, desc: 'Classified from real Finnhub headlines' },
  { label: 'Reddit Mentions', weight: 8, desc: 'Social momentum signal' },
  { label: 'Insider Activity', weight: 8, desc: 'SEC Form 4 filing flags' },
];

const STATS = [
  { n: '25+', label: 'Stocks & ETFs' },
  { n: '9', label: 'Score signals' },
  { n: '8Q', label: 'Earnings history' },
  { n: '15', label: 'Finance concepts' },
];

function TickerBadge({ sym, price, change }: { sym: string; price: string; change: number }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '6px 14px', borderRadius: 20,
      background: 'var(--surface)', border: '1px solid var(--border)',
      fontSize: 12,
    }}>
      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text)' }}>{sym}</span>
      <span style={{ fontFamily: 'monospace', color: 'var(--text2)' }}>{price}</span>
      <span style={{ fontFamily: 'monospace', color: change >= 0 ? '#1a8c52' : '#c0392b', fontSize: 11 }}>
        {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
      </span>
    </div>
  );
}

export default function Landing({ onEnter, onNavigate }: { onEnter: () => void; onNavigate: (tab: string) => void }) {  const [tickers, setTickers] = useState<any[]>([]);
  const [activeSignal, setActiveSignal] = useState(0);

  useEffect(() => {
    fetch('/api/ticker').then(r => r.json()).then(d => {
      if (d.quotes?.length) setTickers(d.quotes.filter((q: any) => q.price));
    }).catch(() => {});

    const interval = setInterval(() => {
      setActiveSignal(i => (i + 1) % SIGNALS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* NAV */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 56, borderBottom: '1px solid var(--border)',
        background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="#1a6b3c"/>
            <path d="M16 26 C10 26 6 22 6 17 C6 11 10 7 16 7 C22 7 26 11 26 17 C26 21 23 24 20 25" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M20 25 C24 22 24 17 20 14 C17 11 12 12 11 16 C10 19 12 22 15 22 C17 22 19 20 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M18 18 C17 15 17 11 18 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <polygon points="18,4 13,10 23,10" fill="#86efac"/>
            <circle cx="13" cy="18" r="1.8" fill="#86efac"/>
            <circle cx="13" cy="18" r="0.7" fill="#1a6b3c"/>
          </svg>
          <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.03em' }}>ecnived</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <a href="#how" style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'none', padding: '5px 12px', borderRadius: 6 }}
            onMouseOver={e => (e.currentTarget.style.color = '#1a6b3c')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--text2)')}
          >How it works</a>
          <a href="#features" style={{ fontSize: 13, color: 'var(--text2)', textDecoration: 'none', padding: '5px 12px', borderRadius: 6 }}
            onMouseOver={e => (e.currentTarget.style.color = '#1a6b3c')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--text2)')}
          >Features</a>
          <button onClick={() => onNavigate('Dashboard')} style={{
            padding: '7px 20px', borderRadius: 8, border: 'none',
            background: '#1a6b3c', color: '#fff', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>Launch App →</button>
        </div>
      </div>

      {/* LIVE TICKER STRIP */}
      {tickers.length > 0 && (
        <div style={{
          background: 'var(--surface2)', borderBottom: '1px solid var(--border)',
          padding: '8px 40px', display: 'flex', gap: 10, overflowX: 'auto', flexWrap: 'nowrap',
        }}>
          {tickers.slice(0, 8).map((t: any) => (
            <TickerBadge key={t.sym} sym={t.sym} price={`$${t.price.toFixed(2)}`} change={t.change ?? 0} />
          ))}
          <span style={{ fontSize: 11, color: 'var(--text3)', alignSelf: 'center', flexShrink: 0 }}>
            Live · via Finnhub
          </span>
        </div>
      )}

      {/* HERO */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 40px 60px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 20,
          background: 'var(--green-light)', color: '#1a6b3c',
          fontSize: 12, fontWeight: 600, letterSpacing: '.06em', marginBottom: 28,
          border: '1px solid rgba(26,107,60,0.15)',
        }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#1a8c52', animation: 'pulse 2s infinite' }} />
          LIVE MARKET DATA · REAL EARNINGS HISTORY · FREE
        </div>

        <h1 style={{
          fontSize: 58, fontWeight: 800, letterSpacing: '-0.04em',
          lineHeight: 1.08, color: 'var(--text)', marginBottom: 24,
          fontFamily: 'monospace',
        }}>
          Predict earnings.<br />
          <span style={{ color: '#1a6b3c' }}>Beat the market.</span>
        </h1>

        <p style={{
          fontSize: 18, color: 'var(--text2)', lineHeight: 1.7,
          maxWidth: 580, margin: '0 auto 40px', fontWeight: 400,
        }}>
          Ecnived scores every stock using real earnings history, analyst revisions, short interest, and revenue trends — the signals that actually move prices after earnings.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <button onClick={() => onNavigate('Dashboard')} style={{
    padding: '15px 36px', borderRadius: 10, border: 'none',
    background: '#1a6b3c', color: '#fff', fontFamily: 'inherit',
    fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em',
    boxShadow: '0 4px 20px rgba(26,107,60,.25)',
  }}>
    Open Dashboard →
  </button>
  <button onClick={() => onNavigate('Screener')} style={{
    padding: '15px 36px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--surface)',
    color: 'var(--text)', fontFamily: 'inherit',
    fontSize: 16, fontWeight: 500, cursor: 'pointer',
  }}>
    View Screener
  </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Free · No account required · No credit card
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '28px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {STATS.map(({ n, label }, i) => (
            <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none', padding: '4px 0' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 36, fontWeight: 800, color: '#1a6b3c', letterSpacing: '-0.03em' }}>{n}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" style={{ maxWidth: 900, margin: '0 auto', padding: '80px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12 }}>
            How the Ecnived Score works
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 500, margin: '0 auto' }}>
            A reproducible quantitative formula — not a black box, not random numbers.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text3)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 16 }}>9 weighted signals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SIGNALS.map((s, i) => (
                <div key={i} onClick={() => setActiveSignal(i)} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                  border: `1px solid ${activeSignal === i ? '#1a6b3c' : 'var(--border)'}`,
                  background: activeSignal === i ? 'var(--green-light)' : 'var(--surface)',
                  transition: 'all .15s',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: activeSignal === i ? '#1a6b3c' : 'var(--text)' }}>{s.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 1 }}>{s.desc}</div>
                  </div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                    color: activeSignal === i ? '#1a6b3c' : 'var(--text3)',
                    background: activeSignal === i ? 'rgba(26,107,60,0.1)' : 'var(--surface2)',
                    padding: '2px 8px', borderRadius: 20,
                  }}>+{s.weight}pts</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '32px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 16 }}>
                Active Signal
              </div>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                background: 'var(--green-light)', border: '3px solid #1a6b3c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontSize: 22, fontWeight: 800, color: '#1a6b3c',
              }}>
                +{SIGNALS[activeSignal].weight}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em' }}>
                {SIGNALS[activeSignal].label}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 20 }}>
                {SIGNALS[activeSignal].desc}
              </div>
              <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: '#1a6b3c',
                  width: `${(SIGNALS[activeSignal].weight / 20) * 100}%`,
                  transition: 'width .4s ease',
                }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 8 }}>
                Signal weight: {SIGNALS[activeSignal].weight} / 20 max points
              </div>
            </div>

            <div style={{ marginTop: 20, padding: '16px 20px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Score → Prediction</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {[['80–100', 'Very Bullish', '#1a8c52'],['65–79', 'Bullish', '#2dd672'],['45–64', 'Neutral', '#c9a84c'],['30–44', 'Bearish', '#e05c4b'],['0–29', 'Very Bearish', '#c0392b']].map(([range, label, color]) => (
                  <div key={range} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ fontFamily: 'monospace', color: 'var(--text3)' }}>{range}</span>
                    <span style={{ fontWeight: 600, color }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '80px 40px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 12 }}>
              Six tools. One platform.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text2)' }}>Everything you need to research earnings — free, no account required.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} onClick={() => onNavigate(['Dashboard','Screener','Lab','Digest','Portfolio','Digest'][i])} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '24px 22px', cursor: 'pointer',
                transition: 'border-color .15s, box-shadow .15s, transform .15s',
              }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#1a6b3c'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,107,60,.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 28 }}>{f.icon}</div>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: 'var(--green-light)', color: '#1a6b3c', letterSpacing: '.04em' }}>{f.tag}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.01em' }}>{f.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 16, fontFamily: 'monospace' }}>
          Ready to research smarter?
        </h2>
        <p style={{ fontSize: 16, color: 'var(--text2)', marginBottom: 36, lineHeight: 1.6 }}>
          No sign-up. No credit card. Built with real market data.
        </p>
        <button onClick={() => onNavigate('Dashboard')} style={{
          padding: '18px 48px', borderRadius: 12, border: 'none',
          background: '#1a6b3c', color: '#fff', fontFamily: 'inherit',
          fontSize: 18, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em',
          boxShadow: '0 4px 24px rgba(26,107,60,.3)',
        }}>
          Launch ecnived →
        </button>
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
          Data via Finnhub · Yahoo Finance · SEC EDGAR
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--text3)' }}>ecnived</span>
  <span style={{ fontSize: 11, color: 'var(--text3)' }}>
    Built by <strong style={{ color: 'var(--text)' }}>Vince Park</strong> · Not financial advice · Data via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub</a> · <a href="https://finance.yahoo.com" target="_blank" style={{ color: '#1a6b3c' }}>Yahoo Finance</a>
  </span>
</div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  );
}
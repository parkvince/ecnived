'use client';

const FEATURES = [
  { icon: '📈', title: 'Earnings Radar', desc: 'Real EPS history, beat streaks, and analyst estimates pulled live from Finnhub.' },
  { icon: '🔍', title: 'Stock Screener', desc: 'Filter by sector, sentiment, beat streak, and short interest. Sort by any column.' },
  { icon: '🧠', title: 'Sentiment Lab', desc: 'AI analysis built from real news and quantitative signals — not made-up scores.' },
  { icon: '💼', title: 'Portfolio Tracker', desc: 'Track holdings with real P&L. Persists across sessions. Export to CSV.' },
];

export default function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', fontFamily: 'inherit' }}>

      {/* NAV */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: 54, borderBottom: '1px solid var(--border)', background: 'var(--surface)', position: 'sticky', top: 0, zIndex: 100 }}>
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
        <button onClick={onEnter} style={{ padding: '7px 20px', borderRadius: 8, border: 'none', background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
          Launch App →
        </button>
      </div>

      {/* HERO */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '90px 32px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: 20, background: 'var(--green-light)', color: '#1a6b3c', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', marginBottom: 24 }}>
          LIVE MARKET DATA · REAL EARNINGS HISTORY
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.1, color: 'var(--text)', marginBottom: 22, fontFamily: 'monospace' }}>
          Predict earnings.<br />
          <span style={{ color: '#1a6b3c' }}>Beat the market.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--text2)', lineHeight: 1.7, maxWidth: 560, margin: '0 auto 36px', fontWeight: 400 }}>
          Ecnived scores every S&P 500 stock using real earnings history, analyst revisions, short interest, and revenue trends — the signals that actually move prices.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onEnter} style={{ padding: '14px 32px', borderRadius: 10, border: 'none', background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}>
            Open Dashboard →
          </button>
          <button onClick={onEnter} style={{ padding: '14px 32px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
            View Screener
          </button>
        </div>
        <div style={{ marginTop: 20, fontSize: 11, color: 'var(--text3)' }}>
          Free · No account required · Data via Finnhub
        </div>
      </div>

      {/* STATS BAR */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '20px 32px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {[
            { n: '15+', label: 'Stocks tracked' },
            { n: '8Q', label: 'Earnings history' },
            { n: '100', label: 'Ecnived score scale' },
            { n: 'Live', label: 'Finnhub data feed' },
          ].map(({ n, label }, i) => (
            <div key={i} style={{ textAlign: 'center', borderRight: i < 3 ? '1px solid var(--border)' : 'none', padding: '4px 0' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color: '#1a6b3c' }}>{n}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '64px 32px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 8, textAlign: 'center' }}>Everything you need to research earnings</h2>
        <p style={{ fontSize: 14, color: 'var(--text3)', textAlign: 'center', marginBottom: 40 }}>Four tools. Real data. No fluff.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} onClick={onEnter} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 22px', cursor: 'pointer', transition: 'border-color .15s, box-shadow .15s' }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#1a6b3c'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(26,107,60,.08)'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 6, letterSpacing: '-0.01em' }}>{f.title}</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 780, margin: '0 auto' }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 8, textAlign: 'center' }}>How the Ecnived Score works</h2>
          <p style={{ fontSize: 14, color: 'var(--text3)', textAlign: 'center', marginBottom: 40 }}>A quantitative formula — not AI guessing.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { step: '01', title: 'Earnings history', desc: 'Beat streak and average EPS surprise over 8 quarters from Finnhub.' },
              { step: '02', title: 'Market signals', desc: 'Short interest, revenue growth, and analyst revision trends.' },
              { step: '03', title: 'Score 0–100', desc: 'Weighted formula outputs a score. Higher = historically stronger setup.' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 16px' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 32, fontWeight: 800, color: '#1a6b3c', opacity: .25, marginBottom: 10 }}>{s.step}</div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 34, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 16, fontFamily: 'monospace' }}>
          Ready to research smarter?
        </h2>
        <p style={{ fontSize: 15, color: 'var(--text2)', marginBottom: 32 }}>No sign-up. No credit card. Just open it.</p>
        <button onClick={onEnter} style={{ padding: '16px 40px', borderRadius: 10, border: 'none', background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 16, fontWeight: 700, cursor: 'pointer', letterSpacing: '-0.01em' }}>
          Launch ecnived →
        </button>
      </div>

      {/* FOOTER */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '20px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14, color: 'var(--text3)' }}>ecnived</span>
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>Not financial advice · Data via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub</a></span>
      </div>
    </div>
  );
}
'use client';

const TIMELINE = [
  { step: '01', title: 'Data Collection', desc: 'Real-time quotes, earnings history, and news pulled from Finnhub API and Yahoo Finance. No fake numbers — every price, beat/miss, and headline is live.' },
  { step: '02', title: 'Signal Processing', desc: 'Nine quantitative signals are extracted per stock — beat streak, average EPS surprise, analyst revisions, short interest, revenue growth, IV/HV ratio, news sentiment, social momentum, and insider activity.' },
  { step: '03', title: 'Score Calculation', desc: 'Each signal is weighted and summed into the Ecnived Score (0–100). Higher scores indicate historically stronger pre-earnings setups — not a guarantee, but a repeatable, data-driven framework.' },
  { step: '04', title: 'Prediction Output', desc: 'Scores above 55 generate a BEAT prediction, below a MISS. Confidence is derived from a logistic mapping of the score. Every prediction includes the top 3 contributing signals for full transparency.' },
];

const TECH = [
  { name: 'Next.js 14', role: 'Full-stack framework — frontend React + backend API routes in one project' },
  { name: 'TypeScript', role: 'Type-safe codebase across all components and API routes' },
  { name: 'Finnhub API', role: 'Live stock quotes, earnings surprises, company profiles, news feed' },
  { name: 'Yahoo Finance', role: 'Historical OHLC price data for interactive charts (1D → 5Y)' },
  { name: 'Vercel', role: 'Zero-config deployment with automatic CI/CD from GitHub pushes' },
  { name: 'localStorage', role: 'Client-side persistence for portfolio positions and watchlist — no backend needed' },
  { name: 'Canvas API', role: 'Custom price charts drawn natively — no chart library overhead' },
  { name: 'IntersectionObserver', role: 'Infinite scroll in Market Digest without a third-party library' },
];

const DISCLAIMERS = [
  'Ecnived is not a registered investment advisor.',
  'Nothing on this platform constitutes financial advice.',
  'Past earnings patterns do not predict future results.',
  'Ecnived Scores are quantitative estimates, not guarantees.',
  'Always do your own research before making investment decisions.',
  'Market data is provided by Finnhub and Yahoo Finance.',
];

export default function About({ onEnter }: { onEnter: () => void }) {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1a6b3c', marginBottom: 10 }}>About Ecnived</div>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 16, lineHeight: 1.1 }}>
          A quantitative earnings<br />intelligence platform
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text2)', lineHeight: 1.75, maxWidth: 600 }}>
          Ecnived was built to answer one question: <strong style={{ color: 'var(--text)' }}>what signals actually predict whether a company beats earnings?</strong> Instead of guessing, it runs a weighted formula across nine real data inputs and outputs a reproducible score for every stock.
        </p>
      </div>

      {/* WHY */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '24px 28px', marginBottom: 32 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>Why this exists</div>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8, marginBottom: 12 }}>
          Most retail investors go into earnings with no framework — just vibes, Reddit posts, and analyst price targets. Meanwhile, institutional desks run systematic models that score earnings setups across hundreds of signals.
        </p>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.8 }}>
          Ecnived closes that gap. It's a transparent, open-source-style platform that shows you the exact signals, exact weights, and exact logic behind every prediction. No black boxes. No premium paywalls. No fake scores.
        </p>
      </div>

      {/* HOW IT WORKS */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 24 }}>How it works</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {TIMELINE.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: i < TIMELINE.length - 1 ? 28 : 0, position: 'relative' }}>
              {/* Line */}
              {i < TIMELINE.length - 1 && (
                <div style={{ position: 'absolute', left: 19, top: 40, width: 2, height: 'calc(100% - 12px)', background: 'var(--border)' }} />
              )}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: 'var(--green-light)', border: '2px solid #1a6b3c',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontSize: 11, fontWeight: 800, color: '#1a6b3c',
                zIndex: 1,
              }}>{t.step}</div>
              <div style={{ paddingTop: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{t.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{t.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TECH STACK */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}>Tech stack</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {TECH.map((t, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
              <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#1a6b3c', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{t.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DATA SOURCES */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 20 }}>Data sources</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Finnhub', url: 'https://finnhub.io', desc: 'Real-time quotes, earnings surprises, company profiles, news headlines, analyst recommendations. Free tier: 60 API calls/min.' },
            { name: 'Yahoo Finance', url: 'https://finance.yahoo.com', desc: 'Historical OHLC price data for all chart timeframes (1D, 5D, 1M, 3M, 6M, 1Y, 5Y). Unofficial API — no key required.' },
            { name: 'SEC EDGAR', url: 'https://www.sec.gov/edgar', desc: 'Linked directly for insider filings (Form 4) and quarterly reports (10-Q). Not fetched programmatically — linked per stock.' },
          ].map((s, i) => (
            <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
              <a href={s.url} target="_blank" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', color: '#1a6b3c', textDecoration: 'none', flexShrink: 0, alignSelf: 'center' }}>Visit ↗</a>
            </div>
          ))}
        </div>
      </div>

      {/* DISCLAIMER */}
      <div style={{ background: 'var(--gold-light)', border: '1px solid #e6c97a', borderRadius: 14, padding: '24px 28px', marginBottom: 40 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>⚠ Important Disclaimers</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {DISCLAIMERS.map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
              <span style={{ color: '#c9a84c', flexShrink: 0, marginTop: 1 }}>•</span>
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '20px 0 40px' }}>
        <button onClick={onEnter} style={{
          padding: '14px 36px', borderRadius: 10, border: 'none',
          background: '#1a6b3c', color: '#fff', fontFamily: 'inherit',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(26,107,60,.2)',
        }}>
          Launch the App →
        </button>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 12 }}>Free · No account required</div>
      </div>
    </div>
  );
}
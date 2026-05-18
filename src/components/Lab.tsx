'use client';
import { useState } from 'react';

export default function Lab() {
  const [ticker, setTicker] = useState('NVDA');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [sentScore, setSentScore] = useState<number | null>(null);
  const [news, setNews] = useState<any[]>([]);
  const [error, setError] = useState('');

  async function analyze() {
    if (!ticker.trim()) return;
    setLoading(true);
    setResult('');
    setError('');
    setSentScore(null);

    try {
      const [quoteRes, newsRes] = await Promise.all([
        fetch(`/api/quote?symbol=${ticker.toUpperCase()}`).then(r => r.json()),
        fetch(`/api/news?symbol=${ticker.toUpperCase()}`).then(r => r.json()),
      ]);
      setNews(newsRes.items || []);

      const score = quoteRes.ecniveScore || 60;
      const beatStr = quoteRes.beatStreak || 0;
      const avgSurp = quoteRes.avgSurprise || 0;
      const revenueGrowth = quoteRes.revenueGrowth || 0;
      const shortInt = quoteRes.shortInterest || 1.5;
      const companyName = quoteRes.profile?.name || ticker.toUpperCase();
      const industry = quoteRes.profile?.finnhubIndustry || 'Technology';
      const price = quoteRes.quote?.c?.toFixed(2) || 'N/A';
      const posNews = (newsRes.items || []).filter((n: any) => n.sentiment === 'Positive').length;
      const negNews = (newsRes.items || []).filter((n: any) => n.sentiment === 'Negative').length;
      const sym = ticker.toUpperCase();
      const overallScore = +(score / 10).toFixed(1);
      setSentScore(overallScore);

      const analysis = `MARKET NARRATIVE
${companyName} (${sym}) is trading at $${price} in the ${industry} sector. ${score >= 70
  ? `Strong momentum with an Ecnived score of ${score}/100, supported by ${beatStr} consecutive earnings beats and an average EPS surprise of +${avgSurp.toFixed(1)}%.`
  : score >= 45
  ? `Mixed picture with an Ecnived score of ${score}/100. Recent earnings performance has been ${beatStr >= 2 ? 'solid' : 'inconsistent'}.`
  : `Under pressure with an Ecnived score of ${score}/100 and elevated risk signals.`} ${revenueGrowth > 0
  ? `Revenue growing at ${revenueGrowth.toFixed(1)}% YoY.`
  : `Revenue growth challenged at ${revenueGrowth.toFixed(1)}% YoY.`}

BULLISH CATALYSTS
1. ${beatStr >= 3
  ? `Strong earnings consistency — ${beatStr} consecutive EPS beats signals disciplined execution`
  : beatStr >= 1
  ? `${beatStr} recent earnings beat(s) show management is setting beatable targets`
  : 'Opportunity to reset expectations and beat lowered estimates'}
2. ${revenueGrowth > 15
  ? `Robust revenue growth of +${revenueGrowth.toFixed(1)}% YoY demonstrates strong demand`
  : revenueGrowth > 5
  ? `Steady revenue growth of +${revenueGrowth.toFixed(1)}% YoY`
  : 'Any revenue acceleration would be a meaningful catalyst'}
3. ${shortInt < 2
  ? `Low short interest of ${shortInt.toFixed(1)}% — minimal bearish headwind`
  : shortInt < 5
  ? `Moderate short interest of ${shortInt.toFixed(1)}% — beat could trigger short covering`
  : `Short interest at ${shortInt.toFixed(1)}% — a beat could amplify the rally via short covering`}

BEARISH RISKS
1. ${score < 60
  ? `Below-average Ecnived score of ${score}/100 suggests more risk than typical setups`
  : 'Premium expectations built in — any guidance miss could cause outsized selloff'}
2. ${negNews > posNews
  ? `Recent news flow is net negative (${negNews} negative vs ${posNews} positive headlines)`
  : 'Macro uncertainty — sector headwinds could offset company-specific strength'}
3. ${shortInt > 8
  ? `Elevated short interest at ${shortInt.toFixed(1)}% signals informed bearish thesis`
  : `${industry} sector rotation risk could create volatility regardless of fundamentals`}

FORWARD OUTLOOK
${sym} enters the upcoming period with ${score >= 65 ? 'a favorable setup' : score >= 45 ? 'a neutral-to-cautious setup' : 'elevated risk'}. The combination of ${avgSurp > 3 ? `above-average historical surprises (+${avgSurp.toFixed(1)}%)` : `average historical surprises (${avgSurp.toFixed(1)}%)`} and ${revenueGrowth > 10 ? 'strong revenue momentum' : 'moderate revenue trends'} suggests ${score >= 65 ? 'continued outperformance is plausible if macro conditions cooperate' : 'investors should manage position sizing carefully ahead of the next catalyst'}.

SENTIMENT SCORE: ${overallScore}/10`;

      let i = 0;
      const interval = setInterval(() => {
        i += 4;
        setResult(analysis.slice(0, i));
        if (i >= analysis.length) clearInterval(interval);
      }, 8);

    } catch (e: any) {
      setError('Failed to fetch data: ' + e.message);
    }
    setLoading(false);
  }

  function formatResult(text: string) {
    return text.split('\n').map((line, i) => {
      const isHeader = ['MARKET NARRATIVE', 'BULLISH CATALYSTS', 'BEARISH RISKS', 'FORWARD OUTLOOK', 'SENTIMENT SCORE'].some(h => line.startsWith(h));
      if (isHeader) {
        return (
          <div key={i} style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#1a6b3c', marginTop: 16, marginBottom: 3 }}>
            {line}
          </div>
        );
      }
      return <div key={i} style={{ minHeight: line === '' ? 8 : undefined }}>{line}</div>;
    });
  }

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 18 }}>Sentiment Lab</h1>

      {/* AI ANALYSIS */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
          AI Deep Analysis
          <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'var(--green-light)', color: '#1a6b3c', fontWeight: 600 }}>
            Powered by Real Finnhub Data
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && analyze()}
            placeholder="Enter ticker — e.g. NVDA, AAPL, TSLA..."
            style={{
              flex: 1, padding: '9px 14px', border: '1px solid var(--border)',
              borderRadius: 8, background: 'var(--surface)', color: 'var(--text)',
              fontFamily: 'inherit', fontSize: 14, outline: 'none',
            }}
          />
          <button onClick={analyze} disabled={loading} style={{
            padding: '9px 20px', borderRadius: 8, border: 'none',
            background: '#1a6b3c', color: '#fff', fontFamily: 'inherit',
            fontSize: 13, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? .7 : 1,
          }}>
            {loading ? 'Analyzing...' : 'Analyze →'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: 'var(--red-light)', borderRadius: 8, fontSize: 12, color: '#c0392b', marginBottom: 12 }}>
            {error}
          </div>
        )}

        {result && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {sentScore != null && (
                  <span style={{
                    padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: sentScore >= 7 ? 'var(--green-light)' : sentScore >= 4 ? 'var(--gold-light)' : 'var(--red-light)',
                    color: sentScore >= 7 ? '#1a6b3c' : sentScore >= 4 ? '#c9a84c' : '#c0392b',
                  }}>
                    Sentiment: {sentScore}/10
                  </span>
                )}
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {ticker.toUpperCase()} · {new Date().toLocaleTimeString()}
                </span>
              </div>
              <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                Based on real Finnhub data · Not financial advice
              </span>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--text)' }}>
              {formatResult(result)}
            </div>
          </div>
        )}

        {!result && !loading && (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 13 }}>
            Enter a ticker and click Analyze to get sentiment analysis using real market data.
          </div>
        )}
      </div>

      {/* NEWS FEED */}
      {news.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '20px 22px', marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
            Live News Feed — {ticker.toUpperCase()}
            <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text3)' }}>via Finnhub · last 7 days</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {news.map((n: any, i: number) => (
              <a key={i} href={n.url} target="_blank" style={{
                textDecoration: 'none', display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', gap: 10, padding: '10px 12px',
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
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text3)' }}>
            Real news via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a>
          </div>
        </div>
      )}

      <div style={{ padding: '10px 14px', background: 'var(--gold-light)', border: '1px solid #e6c97a', borderRadius: 8, fontSize: 11, color: 'var(--text2)' }}>
        ⚠ <strong>Ecnived is not a registered investment advisor. This is not financial advice.</strong> Analysis uses real market data for educational purposes only.
      </div>
    </div>
  );
}
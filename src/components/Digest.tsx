'use client';
import { useState, useEffect, useRef } from 'react';

const CATEGORIES = ['All', 'Earnings', 'Markets', 'Economy', 'Technology', 'Energy'];

const FINANCE_CONCEPTS = [
  { term: 'P/E Ratio', def: 'Price-to-Earnings ratio. Tells you how much investors pay per $1 of earnings. A P/E of 20 means you\'re paying $20 for every $1 the company earns. High P/E = high growth expectations. Low P/E = value or slow growth.' },
  { term: 'EPS Beat', def: 'When a company reports higher earnings per share than analysts expected. Stocks often jump after a beat because it signals the business is doing better than Wall Street thought.' },
  { term: 'Short Interest', def: 'The percentage of shares that investors have borrowed and sold, betting the price will fall. High short interest (>10%) means many smart investors are bearish. If the stock rises instead, shorts must buy to cover — causing a "short squeeze."' },
  { term: 'Implied Volatility', def: 'How much the options market expects a stock to move. High IV before earnings means traders expect a big move. It\'s like insurance pricing — the more uncertain, the more expensive.' },
  { term: 'Market Cap', def: 'Total value of a company = share price × shares outstanding. Under $2B = small cap. $2B–$10B = mid cap. Over $10B = large cap. Over $200B = mega cap (think Apple, Microsoft).' },
  { term: 'Analyst Revision', def: 'When Wall Street analysts change their EPS or revenue estimates. Upward revisions before earnings are bullish — they mean insiders and analysts see improving business conditions.' },
  { term: 'Put/Call Ratio', def: 'Compares the number of put options (bets on decline) to call options (bets on rise). Below 0.7 = bullish sentiment. Above 1.2 = bearish sentiment. Extreme readings often signal reversals.' },
  { term: 'Revenue Growth', def: 'How fast a company\'s sales are growing year-over-year. The most important top-line metric. A company can cut costs to boost earnings temporarily, but only real demand drives revenue growth.' },
  { term: 'Guidance', def: 'Management\'s forecast for future revenue and earnings. Often more important than the actual results. A company can beat estimates but still fall if their guidance disappoints — called "sell the news."' },
  { term: 'Short Squeeze', def: 'When a heavily shorted stock rises sharply, forcing short sellers to buy to limit losses — pushing the price even higher. GameStop in 2021 is the most famous example.' },
  { term: 'Beta', def: 'Measures how much a stock moves relative to the market. Beta of 1.5 means if the S&P drops 10%, this stock typically drops 15%. High beta = more volatile. Defensive stocks like utilities have beta below 1.' },
  { term: 'Free Cash Flow', def: 'Cash a company generates after paying for operations and capital expenditures. Unlike earnings, it\'s hard to fake. Buffett considers it the most important metric for valuing a business.' },
  { term: 'EBITDA', def: 'Earnings Before Interest, Taxes, Depreciation, and Amortization. Used to compare profitability across companies with different debt structures. Often used in acquisition pricing as a multiple.' },
  { term: 'Dividend Yield', def: 'Annual dividend divided by stock price. A 4% yield means you earn $4 per year for every $100 invested. High yields can signal either a great income stock or a company in trouble with a falling price.' },
  { term: 'Moving Average', def: 'Average price over a set period (e.g. 50-day, 200-day). When a stock crosses above its 200-day moving average, it\'s often seen as a bullish signal. Below = bearish.' },
];

const CITATION_FORMATS = ['APA', 'MLA', 'Chicago', 'AMA', 'Harvard'];

function sentimentColor(s: string) {
  if (s === 'Positive') return { bg: 'var(--green-light)', color: '#1a6b3c' };
  if (s === 'Negative') return { bg: 'var(--red-light)', color: '#c0392b' };
  return { bg: 'var(--surface2)', color: 'var(--text2)' };
}

function sentimentFromHeadline(h: string): string {
  const lower = h.toLowerCase();
  if (lower.match(/beat|surge|rise|strong|record|growth|upgrade|rally|profit|gain|bull|jump|soar/)) return 'Positive';
  if (lower.match(/miss|fall|drop|weak|cut|downgrade|loss|decline|crash|bear|layoff|recession|fear/)) return 'Negative';
  return 'Neutral';
}

function timeAgo(timestamp: number): string {
  const seconds = Math.floor(Date.now() / 1000 - timestamp);
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function generateCitation(article: any, format: string): string {
  const author = article.source || 'Unknown Author';
  const title = article.headline || 'Untitled';
  const site = article.source || 'Financial News';
  const url = article.url || '';
  const date = article.datetime ? new Date(article.datetime * 1000) : new Date();
  const year = date.getFullYear();
  const fullDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const accessDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  switch (format) {
    case 'APA':
      return `${author}. (${year}, ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}). ${title}. ${site}. Retrieved ${accessDate}, from ${url}`;
    case 'MLA':
      return `"${title}." ${site}, ${fullDate}, ${url}. Accessed ${accessDate}.`;
    case 'Chicago':
      return `${author}. "${title}." ${site}. ${fullDate}. ${url}.`;
    case 'AMA':
      return `${author}. ${title}. ${site}. Published ${fullDate}. Accessed ${accessDate}. ${url}`;
    case 'Harvard':
      return `${author} (${year}) '${title}', ${site}, ${fullDate}. Available at: ${url} (Accessed: ${accessDate}).`;
    default:
      return `${author}. "${title}." ${site}, ${fullDate}.`;
  }
}

function summarizeArticle(article: any): string {
  const sent = sentimentFromHeadline(article.headline);
  const ticker = article.ticker || 'the market';
  const date = article.datetime ? new Date(article.datetime * 1000).toLocaleDateString() : 'recently';

  return `ARTICLE SUMMARY\n\n"${article.headline}"\n— ${article.source}, ${date}\n\nSENTIMENT: ${sent}\n\nKEY TAKEAWAY\nThis ${sent.toLowerCase()} story from ${article.source} covers developments related to ${ticker}. ${sent === 'Positive' ? `The headline signals strength — words like "beat," "growth," or "surge" indicate upward momentum or better-than-expected results.` : sent === 'Negative' ? `The headline signals weakness — words like "miss," "fall," or "decline" suggest deteriorating conditions or disappointing results.` : `The story appears factual or mixed in tone — no strong directional signal from the headline alone.`}\n\nWHY IT MATTERS\n${ticker !== 'the market' ? `For $${ticker}: news sentiment is one of the inputs to the Ecnived score. A cluster of ${sent.toLowerCase()} headlines can shift the score and signal upcoming price movement.` : `Market-wide news affects broad indices and sector ETFs. Watch for follow-through in futures and opening price action.'`}\n\nNOTE: This summary is generated from the headline only. Click "Open Article" to read the full piece.\nData via Finnhub · Not financial advice`;
}

export default function Digest() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchTicker, setSearchTicker] = useState('');
  const [searchNews, setSearchNews] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchDetail, setSearchDetail] = useState<any>(null);
  const [conceptIdx, setConceptIdx] = useState(0);
  const [recap, setRecap] = useState('');
  const [recapLoading, setRecapLoading] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [summaries, setSummaries] = useState<Record<number, string>>({});
  const [citationFormat, setCitationFormat] = useState<Record<number, string>>({});
  const [showCitation, setShowCitation] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<number | null>(null);

  async function loadNews() {
    setLoading(true);
    try {
      const tickers = ['AAPL', 'NVDA', 'MSFT', 'JPM', 'XOM', 'AMZN', 'TSLA', 'META', 'AMD', 'GS'];
      const results = await Promise.all(
        tickers.map(t => fetch(`/api/news?symbol=${t}`).then(r => r.json()))
      );
      const all: any[] = [];
      const seen = new Set();
      results.forEach((r, i) => {
        (r.items || []).forEach((item: any) => {
          if (!seen.has(item.headline)) {
            seen.add(item.headline);
            all.push({ ...item, ticker: tickers[i] });
          }
        });
      });
      all.sort((a, b) => b.datetime - a.datetime);
      setNews(all);
    } catch {}
    setLoading(false);
  }

  async function searchCompany() {
    if (!searchTicker.trim()) return;
    setSearchLoading(true);
    setSearchNews([]);
    setSearchDetail(null);
    try {
      const [newsRes, quoteRes] = await Promise.all([
        fetch(`/api/news?symbol=${searchTicker.toUpperCase()}`).then(r => r.json()),
        fetch(`/api/quote?symbol=${searchTicker.toUpperCase()}`).then(r => r.json()),
      ]);
      setSearchNews(newsRes.items || []);
      setSearchDetail(quoteRes);
    } catch {}
    setSearchLoading(false);
  }

  async function generateRecap() {
    setRecapLoading(true);
    setRecap('');
    setShowRecap(true);
    const posCount = news.filter(n => sentimentFromHeadline(n.headline) === 'Positive').length;
    const negCount = news.filter(n => sentimentFromHeadline(n.headline) === 'Negative').length;
    const total = news.length;
    const sentimentBias = posCount > negCount ? 'broadly positive' : negCount > posCount ? 'broadly negative' : 'mixed';

    const summary = `MARKET RECAP — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}

OVERALL SENTIMENT
Today's news flow was ${sentimentBias} across ${total} headlines analyzed. ${posCount} positive signals vs ${negCount} negative signals detected across major S&P 500 components.

KEY THEMES TODAY
${news.slice(0, 3).map((n, i) => `${i + 1}. ${n.headline} — ${n.source}`).join('\n')}

SECTOR BREAKDOWN
- Technology (AAPL, NVDA, MSFT, AMD): ${news.filter(n => ['AAPL','NVDA','MSFT','AMD','META'].includes(n.ticker)).length} stories
- Finance (JPM, GS): ${news.filter(n => ['JPM','GS'].includes(n.ticker)).length} stories
- Consumer (TSLA, AMZN): ${news.filter(n => ['TSLA','AMZN'].includes(n.ticker)).length} stories
- Energy (XOM): ${news.filter(n => n.ticker === 'XOM').length} stories

WHAT TO WATCH TOMORROW
- Monitor overnight futures for gap risk
- Fed speakers scheduled — watch for rate commentary
- Any after-hours earnings reactions carrying into open

[Generated from ${total} real Finnhub headlines · ${new Date().toLocaleTimeString()}]`;

    let i = 0;
    const interval = setInterval(() => {
      i += 5;
      setRecap(summary.slice(0, i));
      if (i >= summary.length) { clearInterval(interval); setRecapLoading(false); }
    }, 10);
  }

  function toggleExpand(idx: number) {
    setExpandedIdx(prev => prev === idx ? null : idx);
  }

  function handleSummarize(idx: number, article: any) {
    if (!summaries[idx]) {
      setSummaries(prev => ({ ...prev, [idx]: summarizeArticle(article) }));
    }
  }

  function handleCopy(idx: number, article: any) {
    const fmt = citationFormat[idx] || 'APA';
    const text = generateCitation(article, fmt);
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  useEffect(() => {
    loadNews();
    // Random concept on each page load
    setConceptIdx(Math.floor(Math.random() * FINANCE_CONCEPTS.length));
  }, []);

  const filtered = news.filter(n => {
    if (category !== 'All') {
      const map: Record<string, string[]> = {
        Earnings: ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'META', 'TSLA', 'AMD', 'GS', 'JPM'],
        Markets: ['SPY', 'QQQ', 'AAPL', 'MSFT'],
        Economy: ['JPM', 'GS', 'XOM'],
        Technology: ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'META', 'AMD'],
        Energy: ['XOM'],
      };
      if (!map[category]?.includes(n.ticker)) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const inHeadline = n.headline?.toLowerCase().includes(q);
      const inSource = n.source?.toLowerCase().includes(q);
      const inTicker = n.ticker?.toLowerCase().includes(q);
      if (!inHeadline && !inSource && !inTicker) return false;
    }
    return true;
  });

  const concept = FINANCE_CONCEPTS[conceptIdx];

  const tdStyle: React.CSSProperties = { padding: '6px 8px', fontSize: 11, borderBottom: '1px solid var(--border)' };

  return (
    <div style={{ maxWidth: 1160, margin: '0 auto', padding: '24px 20px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 4 }}>Market Digest</h1>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <button onClick={generateRecap} disabled={recapLoading || loading} style={{
          padding: '8px 18px', borderRadius: 8, border: 'none', background: '#1a6b3c',
          color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
          cursor: recapLoading ? 'not-allowed' : 'pointer', opacity: recapLoading ? .7 : 1,
        }}>
          {recapLoading ? 'Generating...' : '✦ Daily Recap'}
        </button>
      </div>

      {/* DAILY RECAP — dismissable */}
      {showRecap && recap && (
        <div style={{ background: '#1a6b3c', borderRadius: 14, padding: '20px 22px', marginBottom: 20, color: '#fff', position: 'relative' }}>
          <button onClick={() => setShowRecap(false)} style={{
            position: 'absolute', top: 12, right: 12, width: 26, height: 26,
            borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)', background: 'transparent',
            color: '#fff', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center',
          }}>✕</button>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .7, marginBottom: 10 }}>
            Daily Recap · {new Date().toLocaleDateString()}
          </div>
          <pre style={{ fontFamily: 'inherit', fontSize: 12, lineHeight: 1.8, whiteSpace: 'pre-wrap', margin: 0, opacity: .95 }}>{recap}</pre>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18 }}>

        {/* LEFT — NEWS FEED */}
        <div>
          {/* FILTERS */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search headlines, sources, tickers..."
                style={{ width: '100%', padding: '7px 12px 7px 30px', border: '1px solid var(--border)', borderRadius: 8, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)} style={{
                  padding: '5px 12px', borderRadius: 20, border: '1px solid var(--border)',
                  background: category === c ? '#1a6b3c' : 'var(--surface)',
                  color: category === c ? '#fff' : 'var(--text2)',
                  fontFamily: 'inherit', fontSize: 12, fontWeight: 500, cursor: 'pointer',
                }}>{c}</button>
              ))}
            </div>
          </div>

          {/* NEWS LIST */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {loading ? (
              [0,1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 10 }} />)
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 13 }}>No stories match your filters</div>
            ) : (
              filtered.slice(0, 40).map((n, i) => {
                const sent = sentimentFromHeadline(n.headline);
                const sc = sentimentColor(sent);
                const isExpanded = expandedIdx === i;
                const fmt = citationFormat[i] || 'APA';

                return (
                  <div key={i} style={{ background: 'var(--surface)', border: `1px solid ${isExpanded ? '#1a6b3c' : 'var(--border)'}`, borderRadius: 10, overflow: 'hidden', transition: 'border-color .12s' }}>
                    {/* ARTICLE ROW */}
                    <div
                      onClick={() => toggleExpand(i)}
                      style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 14px', cursor: 'pointer' }}
                      onMouseOver={e => (e.currentTarget.style.background = 'var(--surface2)')}
                      onMouseOut={e => (e.currentTarget.style.background = '')}
                    >
                      <div style={{ width: 3, borderRadius: 2, background: sc.color, flexShrink: 0, alignSelf: 'stretch', minHeight: 36 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.45, marginBottom: 5 }}>{n.headline}</div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 700, color: '#1a6b3c', background: 'var(--green-light)', padding: '1px 6px', borderRadius: 4 }}>{n.ticker}</span>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{n.source}</span>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>{timeAgo(n.datetime)}</span>
                          <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 7px', borderRadius: 20, ...sc }}>{sent}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text3)', flexShrink: 0, marginTop: 2 }}>{isExpanded ? '▲' : '▼'}</span>
                    </div>

                    {/* EXPANDED PANEL */}
                    {isExpanded && (
                      <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', background: 'var(--surface2)' }}>
                        {/* ACTION BUTTONS */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                          <button onClick={() => handleSummarize(i, n)} style={{
                            padding: '6px 14px', borderRadius: 6, border: 'none', background: '#1a6b3c',
                            color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}>✦ Summarize</button>
                          <a href={n.url} target="_blank" style={{
                            padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
                            background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit',
                            fontSize: 12, fontWeight: 500, cursor: 'pointer', textDecoration: 'none',
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                          }}>↗ Open Article</a>
                          <button onClick={() => setShowCitation(prev => ({ ...prev, [i]: !prev[i] }))} style={{
                            padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
                            background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit',
                            fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          }}>📎 Cite Article</button>
                          <button onClick={() => { setSearch(n.ticker); setExpandedIdx(null); }} style={{
                            padding: '6px 14px', borderRadius: 6, border: '1px solid var(--border)',
                            background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit',
                            fontSize: 12, fontWeight: 500, cursor: 'pointer',
                          }}>🔍 More from {n.ticker}</button>
                        </div>

                        {/* SUMMARY */}
                        {summaries[i] && (
                          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px', marginBottom: 10 }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#1a6b3c', marginBottom: 8 }}>AI Summary</div>
                            <pre style={{ fontFamily: 'inherit', fontSize: 12, lineHeight: 1.75, whiteSpace: 'pre-wrap', margin: 0, color: 'var(--text)' }}>{summaries[i]}</pre>
                            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 8 }}>Generated from headline · Not financial advice</div>
                          </div>
                        )}

                        {/* CITATION */}
                        {showCitation[i] && (
                          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>Citation Format</div>
                            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                              {CITATION_FORMATS.map(f => (
                                <button key={f} onClick={() => setCitationFormat(prev => ({ ...prev, [i]: f }))} style={{
                                  padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)',
                                  background: fmt === f ? '#1a6b3c' : 'var(--surface2)',
                                  color: fmt === f ? '#fff' : 'var(--text2)',
                                  fontFamily: 'inherit', fontSize: 11, fontWeight: 500, cursor: 'pointer',
                                }}>{f}</button>
                              ))}
                            </div>
                            <div style={{ background: 'var(--surface2)', borderRadius: 6, padding: '10px 12px', fontSize: 11, color: 'var(--text)', lineHeight: 1.6, fontFamily: 'monospace', wordBreak: 'break-word', marginBottom: 8 }}>
                              {generateCitation(n, fmt)}
                            </div>
                            <button onClick={() => handleCopy(i, n)} style={{
                              padding: '5px 14px', borderRadius: 6, border: 'none',
                              background: copied === i ? '#1a8c52' : '#1a6b3c',
                              color: '#fff', fontFamily: 'inherit', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            }}>{copied === i ? '✓ Copied!' : 'Copy Citation'}</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
          <div style={{ marginTop: 10, fontSize: 10, color: 'var(--text3)' }}>
            Real news via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a> · Last 7 days
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* CONCEPT OF THE DAY */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#1a6b3c', marginBottom: 8 }}>💡 Concept of the Day</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 8 }}>{concept.term}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.65 }}>{concept.def}</div>
            <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => setConceptIdx(i => (i - 1 + FINANCE_CONCEPTS.length) % FINANCE_CONCEPTS.length)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--text2)', fontFamily: 'inherit' }}>← Prev</button>
              <button onClick={() => setConceptIdx(i => (i + 1) % FINANCE_CONCEPTS.length)} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--text2)', fontFamily: 'inherit' }}>Next →</button>
              <span style={{ fontSize: 10, color: 'var(--text3)', marginLeft: 2 }}>{conceptIdx + 1}/{FINANCE_CONCEPTS.length}</span>
            </div>
          </div>

          {/* COMPANY SEARCH */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>🔎 Company Deep Dive</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
              <input
                value={searchTicker}
                onChange={e => setSearchTicker(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && searchCompany()}
                placeholder="AAPL, TSLA, NVDA..."
                style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 13, outline: 'none' }}
              />
              <button onClick={searchCompany} disabled={searchLoading} style={{ padding: '7px 12px', borderRadius: 6, border: 'none', background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {searchLoading ? '...' : 'Go'}
              </button>
            </div>

            {searchDetail?.profile && (
              <div style={{ marginBottom: 12, padding: '10px 12px', background: 'var(--surface2)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{searchTicker}</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 600, color: '#1a8c52' }}>
                    {searchDetail.quote?.c ? `$${searchDetail.quote.c.toFixed(2)}` : '—'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>{searchDetail.profile?.name}</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text3)' }}>
                  <span>Score: <strong style={{ color: '#1a6b3c' }}>{searchDetail.ecniveScore}/100</strong></span>
                  <span>Streak: <strong>{searchDetail.beatStreak}Q</strong></span>
                  <span>Surprise: <strong style={{ color: searchDetail.avgSurprise >= 0 ? '#1a8c52' : '#c0392b' }}>{searchDetail.avgSurprise >= 0 ? '+' : ''}{searchDetail.avgSurprise}%</strong></span>
                </div>
              </div>
            )}

            {searchNews.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto' }}>
                {searchNews.map((n: any, i: number) => {
                  const sent = sentimentFromHeadline(n.headline);
                  const sc = sentimentColor(sent);
                  return (
                    <a key={i} href={n.url} target="_blank" style={{
                      textDecoration: 'none', padding: '8px 10px', border: '1px solid var(--border)',
                      borderRadius: 8, display: 'block', transition: 'border-color .12s',
                    }}
                      onMouseOver={e => (e.currentTarget.style.borderColor = '#1a6b3c')}
                      onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4, marginBottom: 4 }}>{n.headline}</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 10, color: 'var(--text3)' }}>{n.source} · {timeAgo(n.datetime)}</span>
                        <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 20, ...sc }}>{sent}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {!searchLoading && !searchDetail && (
              <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '12px 0' }}>
                Enter a ticker to see recent news and data
              </div>
            )}
          </div>

          {/* TRENDING TOPICS */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 10 }}>🔥 Trending Topics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {['Federal Reserve rates', 'S&P 500 earnings season', 'AI semiconductor demand', 'Consumer spending trends', 'Oil and energy markets', 'Inflation and CPI data'].map((t, i) => (
                <div key={i} onClick={() => setSearch(t)} style={{
                  padding: '7px 10px', borderRadius: 8, border: '1px solid var(--border)',
                  fontSize: 12, color: 'var(--text2)', cursor: 'pointer', transition: 'all .12s',
                }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#1a6b3c'; e.currentTarget.style.color = '#1a6b3c'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text2)'; }}
                >{t}</div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div style={{ marginTop: 20, padding: '10px 14px', background: 'var(--gold-light)', border: '1px solid #e6c97a', borderRadius: 8, fontSize: 11, color: 'var(--text2)' }}>
        ⚠ <strong>Not financial advice.</strong> News and analysis are for educational purposes only. Data via <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a>
      </div>
    </div>
  );
}
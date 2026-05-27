'use client';
import { useEffect, useState } from 'react';

const SEARCH_KEY = 'ecnived_searches_v1';
const FEEDBACK_KEY = 'ecnived_feedback_v1';
const SESSION_KEY = 'ecnived_sessions_v1';
const FEATURE_KEY = 'ecnived_features_v1';

export function trackSearch(sym: string) {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.parse(localStorage.getItem(SEARCH_KEY) || '{}');
    data[sym] = (data[sym] || 0) + 1;
    localStorage.setItem(SEARCH_KEY, JSON.stringify(data));
  } catch {}
}

export function trackFeature(feature: string) {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.parse(localStorage.getItem(FEATURE_KEY) || '{}');
    data[feature] = (data[feature] || 0) + 1;
    localStorage.setItem(FEATURE_KEY, JSON.stringify(data));
  } catch {}
}

export function trackSession() {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.parse(localStorage.getItem(SESSION_KEY) || '{"total":0,"dates":[]}');
    const today = new Date().toISOString().split('T')[0];
    if (!data.dates.includes(today)) {
      data.dates.push(today);
      data.total = (data.total || 0) + 1;
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }
  } catch {}
}

export default function Metrics() {
  const [searches, setSearches] = useState<[string, number][]>([]);
  const [features, setFeatures] = useState<[string, number][]>([]);
  const [feedback, setFeedback] = useState<{ total: number; positive: number; negative: number }>({ total: 0, positive: 0, negative: 0 });
  const [sessions, setSessions] = useState<{ total: number; dates: string[] }>({ total: 0, dates: [] });

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(SEARCH_KEY) || '{}');
      setSearches(Object.entries(s).sort((a: any, b: any) => b[1] - a[1]).slice(0, 10) as [string, number][]);

      const f = JSON.parse(localStorage.getItem(FEATURE_KEY) || '{}');
      setFeatures(Object.entries(f).sort((a: any, b: any) => b[1] - a[1]) as [string, number][]);

      const fb = JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '{}');
      let pos = 0, neg = 0;
      Object.values(fb).forEach((v: any) => { pos += v.up || 0; neg += v.down || 0; });
      setFeedback({ total: pos + neg, positive: pos, negative: neg });

      const sess = JSON.parse(localStorage.getItem(SESSION_KEY) || '{"total":0,"dates":[]}');
      setSessions(sess);
    } catch {}
  }, []);

  const maxSearch = searches[0]?.[1] || 1;
  const maxFeature = features[0]?.[1] || 1;
  const satisfactionPct = feedback.total > 0 ? Math.round(feedback.positive / feedback.total * 100) : null;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 6 }}>Usage Metrics</h1>
        <p style={{ fontSize: 13, color: 'var(--text2)' }}>
          Tracked locally in your browser. Shows activity from this device only.
        </p>
      </div>

      {/* KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Sessions', value: sessions.total || 0, sub: 'unique days used', color: '#1a6b3c' },
          { label: 'Searches', value: searches.reduce((a, s) => a + s[1], 0), sub: 'total ticker lookups', color: '#2563eb' },
          { label: 'Feedback Given', value: feedback.total, sub: 'ratings submitted', color: '#c9a84c' },
          { label: 'Satisfaction', value: satisfactionPct !== null ? `${satisfactionPct}%` : 'N/A', sub: 'positive feedback rate', color: satisfactionPct !== null && satisfactionPct >= 70 ? '#1a8c52' : '#c0392b' },
        ].map(({ label, value, sub, color }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 8 }}>{label}</div>
            <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* TOP SEARCHES */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Top Searched Tickers
            <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text3)', fontWeight: 400 }}>this device</span>
          </div>
          {searches.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>
              No searches yet — use the Screener or Radar to start tracking
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {searches.map(([sym, count], i) => (
                <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', width: 16, flexShrink: 0 }}>#{i + 1}</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, width: 56, flexShrink: 0, color: '#1a6b3c' }}>{sym}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / maxSearch) * 100}%`, background: '#1a6b3c', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)', width: 28, textAlign: 'right' }}>{count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FEATURE USAGE */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
            Feature Usage
            <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text3)', fontWeight: 400 }}>tab visits</span>
          </div>
          {features.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>
              No feature usage tracked yet — navigate between tabs to start
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {features.map(([feature, count]) => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)', width: 90, flexShrink: 0 }}>{feature}</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count / maxFeature) * 100}%`, background: '#2563eb', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)', width: 28, textAlign: 'right' }}>{count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FEEDBACK BREAKDOWN */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Feedback Breakdown</div>
        {feedback.total === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'center', padding: '20px 0' }}>
            No feedback submitted yet — use the 👍 👎 buttons on predictions and analysis
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Positive 👍', count: feedback.positive, color: '#1a6b3c', bg: 'var(--green-light)' },
              { label: 'Negative 👎', count: feedback.negative, color: '#c0392b', bg: 'var(--red-light)' },
            ].map(({ label, count, color, bg }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)', width: 100, flexShrink: 0 }}>{label}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--surface2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${feedback.total > 0 ? (count / feedback.total) * 100 : 0}%`, background: color, borderRadius: 4, transition: 'width .5s' }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text3)', width: 40, textAlign: 'right' }}>{count}</span>
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, background: bg, color, width: 40, textAlign: 'center' }}>
                  {feedback.total > 0 ? `${Math.round(count / feedback.total * 100)}%` : '0%'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECENT SESSIONS */}
      {sessions.dates?.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Session History</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[...sessions.dates].reverse().slice(0, 30).map((date: string) => (
              <div key={date} style={{
                padding: '4px 10px', borderRadius: 20, fontSize: 11,
                background: 'var(--green-light)', color: '#1a6b3c',
                fontFamily: 'monospace', fontWeight: 500,
              }}>
                {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
        All metrics are stored locally in your browser and never sent to any server. This page is for product development insight only.
      </div>
    </div>
  );
}
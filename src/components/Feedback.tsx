'use client';
import { useState } from 'react';

const STORAGE_KEY = 'ecnived_feedback_v1';

function loadFeedback(): Record<string, { up: number; down: number }> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
}

function saveFeedback(data: Record<string, { up: number; down: number }>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

interface FeedbackProps {
  context: string;
  label?: string;
}

export default function Feedback({ context, label = 'Was this useful?' }: FeedbackProps) {
  const stored = loadFeedback();
  const [voted, setVoted] = useState<'up' | 'down' | null>(
    localStorage.getItem(`ecnived_voted_${context}`) as 'up' | 'down' | null
  );
  const [counts, setCounts] = useState(stored[context] || { up: 0, down: 0 });

  function vote(type: 'up' | 'down') {
    if (voted) return;
    const all = loadFeedback();
    const current = all[context] || { up: 0, down: 0 };
    const updated = { ...current, [type]: current[type] + 1 };
    all[context] = updated;
    saveFeedback(all);
    localStorage.setItem(`ecnived_voted_${context}`, type);
    setVoted(type);
    setCounts(updated);
  }

  const total = counts.up + counts.down;
  const pct = total > 0 ? Math.round(counts.up / total * 100) : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 12, color: 'var(--text3)' }}>{label}</span>
      <button onClick={() => vote('up')} style={{
        padding: '4px 12px', borderRadius: 20, border: `1px solid ${voted === 'up' ? '#1a6b3c' : 'var(--border)'}`,
        background: voted === 'up' ? 'var(--green-light)' : 'transparent',
        color: voted === 'up' ? '#1a6b3c' : 'var(--text2)',
        fontFamily: 'inherit', fontSize: 12, cursor: voted ? 'default' : 'pointer',
        transition: 'all .12s',
      }}>👍 {counts.up > 0 ? counts.up : ''}</button>
      <button onClick={() => vote('down')} style={{
        padding: '4px 12px', borderRadius: 20, border: `1px solid ${voted === 'down' ? '#c0392b' : 'var(--border)'}`,
        background: voted === 'down' ? 'var(--red-light)' : 'transparent',
        color: voted === 'down' ? '#c0392b' : 'var(--text2)',
        fontFamily: 'inherit', fontSize: 12, cursor: voted ? 'default' : 'pointer',
        transition: 'all .12s',
      }}>👎 {counts.down > 0 ? counts.down : ''}</button>
      {voted && pct !== null && (
        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{pct}% found this useful</span>
      )}
      {voted && (
        <span style={{ fontSize: 11, color: '#1a6b3c' }}>Thanks for the feedback!</span>
      )}
    </div>
  );
}
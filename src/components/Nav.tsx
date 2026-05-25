'use client';
import { useState, useEffect } from 'react';
import { loadTheme, saveTheme } from '@/lib/storage';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  onHome: () => void;
}

const TABS = ['Dashboard', 'Digest', 'Screener', 'Radar', 'Lab', 'Portfolio', 'Watchlist', 'Alerts', 'Compare', 'About'];

function Logo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill="#1a6b3c"/>
      <path d="M16 26 C10 26 6 22 6 17 C6 11 10 7 16 7 C22 7 26 11 26 17 C26 21 23 24 20 25" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M20 25 C24 22 24 17 20 14 C17 11 12 12 11 16 C10 19 12 22 15 22 C17 22 19 20 18 18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18 18 C17 15 17 11 18 8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="18,4 13,10 23,10" fill="#86efac"/>
      <circle cx="13" cy="18" r="1.8" fill="#86efac"/>
      <circle cx="13" cy="18" r="0.7" fill="#1a6b3c"/>
    </svg>
  );
}

export default function Nav({ activeTab, setActiveTab, onRefresh, onHome }: NavProps) {
  const [dark, setDark] = useState(false);
  const [clock, setClock] = useState('');

  useEffect(() => {
    const theme = loadTheme();
    if (theme === 'dark') {
      setDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
    saveTheme(next ? 'dark' : '');
  }

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      height: 54, display: 'flex', alignItems: 'center', padding: '0 20px',
    }}>
      <div
        onClick={onHome}
        style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 28, flexShrink: 0, cursor: 'pointer' }}
      >
        <Logo />
        <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>ecnived</span>
      </div>

      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '5px 14px', borderRadius: 6, border: 'none',
            background: activeTab === tab ? 'var(--green-light)' : 'transparent',
            color: activeTab === tab ? '#1a6b3c' : 'var(--text2)',
            fontWeight: activeTab === tab ? 600 : 400,
            fontSize: 13, cursor: 'pointer', transition: 'all .15s',
            fontFamily: 'inherit',
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a8c52' }} />
          <span style={{ fontSize: 11, color: 'var(--text3)' }}>Live</span>
        </div>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text3)' }}>{clock}</span>
        <button onClick={onRefresh} style={{
          width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border)',
          background: 'transparent', cursor: 'pointer', color: 'var(--text2)',
          display: 'grid', placeItems: 'center', fontSize: 14,
        }}>↻</button>
        <button onClick={toggleDark} style={{
          width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border)',
          background: 'transparent', cursor: 'pointer', color: 'var(--text2)',
          display: 'grid', placeItems: 'center', fontSize: 14,
        }}>{dark ? '☀' : '◐'}</button>
      </div>
    </nav>
  );
}
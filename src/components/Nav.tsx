'use client';
import { useState, useEffect, useRef } from 'react';
import { loadTheme, saveTheme } from '@/lib/storage';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onRefresh: () => void;
  onHome: () => void;
}

const PRIMARY_TABS = ['Dashboard', 'Digest', 'Screener', 'Radar', 'Lab', 'Portfolio'];
const MORE_TABS = ['Watchlist', 'Alerts', 'Compare', 'Metrics', 'About'];

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
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setShowMore(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : '');
    saveTheme(next ? 'dark' : '');
  }

  const isMoreActive = MORE_TABS.includes(activeTab);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 200,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      height: 54, display: 'flex', alignItems: 'center', padding: '0 20px',
    }}>
      <div onClick={onHome} style={{ display: 'flex', alignItems: 'center', gap: 9, marginRight: 24, flexShrink: 0, cursor: 'pointer' }}>
        <Logo />
        <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.03em', fontFamily: 'monospace' }}>ecnived</span>
      </div>

      <div style={{ display: 'flex', gap: 2, flex: 1, alignItems: 'center' }}>
        {PRIMARY_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: '5px 12px', borderRadius: 6, border: 'none',
            background: activeTab === tab ? 'var(--green-light)' : 'transparent',
            color: activeTab === tab ? '#1a6b3c' : 'var(--text2)',
            fontWeight: activeTab === tab ? 600 : 400,
            fontSize: 13, cursor: 'pointer', transition: 'all .15s',
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>{tab}</button>
        ))}

        {/* MORE DROPDOWN */}
        <div ref={moreRef} style={{ position: 'relative' }}>
          <button onClick={() => setShowMore(v => !v)} style={{
            padding: '5px 12px', borderRadius: 6, border: 'none',
            background: isMoreActive ? 'var(--green-light)' : 'transparent',
            color: isMoreActive ? '#1a6b3c' : 'var(--text2)',
            fontWeight: isMoreActive ? 600 : 400,
            fontSize: 13, cursor: 'pointer', transition: 'all .15s',
            fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4,
          }}>
            {isMoreActive ? activeTab : 'More'} {showMore ? '▲' : '▼'}
          </button>
          {showMore && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0,
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,.1)',
              overflow: 'hidden', zIndex: 300, minWidth: 140,
            }}>
              {MORE_TABS.map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab); setShowMore(false); }} style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 16px', border: 'none',
                  background: activeTab === tab ? 'var(--green-light)' : 'transparent',
                  color: activeTab === tab ? '#1a6b3c' : 'var(--text)',
                  fontWeight: activeTab === tab ? 600 : 400,
                  fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                  borderBottom: '1px solid var(--border)',
                }}
                  onMouseOver={e => { if (activeTab !== tab) e.currentTarget.style.background = 'var(--surface2)'; }}
                  onMouseOut={e => { if (activeTab !== tab) e.currentTarget.style.background = 'transparent'; }}
                >{tab}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1a8c52', animation: 'pulse 2s infinite' }} />
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
        <a href="https://github.com/parkvince/ecnived" target="_blank" style={{
          width: 30, height: 30, borderRadius: 6, border: '1px solid var(--border)',
          background: 'transparent', cursor: 'pointer', color: 'var(--text2)',
          display: 'grid', placeItems: 'center', fontSize: 14, textDecoration: 'none',
        }}>⌥</a>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </nav>
  );
}
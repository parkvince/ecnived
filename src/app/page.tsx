'use client';
import { useState } from 'react';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import Dashboard from '@/components/Dashboard';
import Screener from '@/components/Screener';
import Radar from '@/components/Radar';
import Lab from '@/components/Lab';
import Portfolio from '@/components/Portfolio';
import Landing from '@/components/Landing';
import Digest from '@/components/Digest';
import About from '@/components/About';
import MarketAlert from '@/components/MarketAlert';
import Watchlist from '@/components/Watchlist';
import PriceAlerts from '@/components/PriceAlerts';
import Compare from '@/components/Compare';

export default function Home() {
  const [tab, setTab] = useState('Home');
  const [refreshKey, setRefreshKey] = useState(0);

  function refresh() { setRefreshKey(k => k + 1); }

if (tab === 'Home') {
  return <Landing onEnter={() => setTab('Dashboard')} onNavigate={setTab} onAbout={() => setTab('About')} />;
}

if (tab === 'About') {
  return (
    <>
      <Nav activeTab={tab} setActiveTab={setTab} onRefresh={refresh} onHome={() => setTab('Home')} />
      <MarketAlert />
      <About onEnter={() => setTab('Dashboard')} />
    </>
  );
}

  return (
    <>
      <Nav activeTab={tab} setActiveTab={setTab} onRefresh={refresh} onHome={() => setTab('Home')} />
      <MarketAlert />
      <Ticker />
      {tab === 'Dashboard' && <Dashboard refreshKey={refreshKey} onNavigate={setTab} />}
      {tab === 'Screener' && <Screener refreshKey={refreshKey} />}
      {tab === 'Radar' && <Radar refreshKey={refreshKey} />}
      {tab === 'Lab' && <Lab />}
      {tab === 'Portfolio' && <Portfolio refreshKey={refreshKey} />}
      {tab === 'Digest' && <Digest />}
      {tab === 'Watchlist' && <Watchlist refreshKey={refreshKey} />}
      {tab === 'Alerts' && <PriceAlerts />}
      {tab === 'Compare' && <Compare />}
      <div style={{
  fontSize: 11, color: 'var(--text3)', textAlign: 'center',
  padding: '18px 20px', borderTop: '1px solid var(--border)', marginTop: 40, lineHeight: 1.7,
}}>
  ecnived · AI-powered earnings intelligence ·{' '}
  <strong>Not a registered investment advisor. This is not financial advice.</strong><br />
  Data: <a href="https://finnhub.io" target="_blank" style={{ color: '#1a6b3c' }}>Finnhub ↗</a> ·{' '}
  <a href="https://www.sec.gov" target="_blank" style={{ color: '#1a6b3c' }}>SEC EDGAR ↗</a><br />
  <span style={{ marginTop: 4, display: 'inline-block' }}>Built by <strong style={{ color: 'var(--text)' }}>Vince, Ethan & Alex</strong></span>
</div>
    </>
  );
}

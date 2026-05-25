'use client';
import { useEffect, useState } from 'react';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'above' | 'below';
  createdAt: string;
  triggered: boolean;
  currentPrice?: number;
}

const STORAGE_KEY = 'ecnived_price_alerts_v1';

function loadAlerts(): PriceAlert[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveAlerts(alerts: PriceAlert[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
}

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [form, setForm] = useState({ symbol: '', price: '', condition: 'above' as 'above' | 'below' });
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState('');
  const [triggered, setTriggered] = useState<PriceAlert[]>([]);
  const [checking, setChecking] = useState(false);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function checkAlerts(alertList: PriceAlert[]) {
    setChecking(true);
    const updated = await Promise.all(alertList.map(async alert => {
      if (alert.triggered) return alert;
      try {
        const res = await fetch(`/api/quote?symbol=${alert.symbol}`);
        const data = await res.json();
        const price = data.quote?.c;
        if (!price) return alert;
        const isTriggered = alert.condition === 'above'
          ? price >= alert.targetPrice
          : price <= alert.targetPrice;
        return { ...alert, currentPrice: price, triggered: isTriggered };
      } catch { return alert; }
    }));
    setAlerts(updated);
    saveAlerts(updated);
    const newlyTriggered = updated.filter((a, i) => a.triggered && !alertList[i].triggered);
    if (newlyTriggered.length) setTriggered(prev => [...prev, ...newlyTriggered]);
    setChecking(false);
  }

  useEffect(() => {
    const saved = loadAlerts();
    setAlerts(saved);
    if (saved.length) checkAlerts(saved);
    const interval = setInterval(() => {
      const current = loadAlerts();
      if (current.length) checkAlerts(current);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  function addAlert() {
    setFormError('');
    const symbol = form.symbol.toUpperCase().trim();
    const price = parseFloat(form.price);
    if (!symbol) { setFormError('Enter a ticker symbol'); return; }
    if (!price || price <= 0) { setFormError('Enter a valid price target'); return; }
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol,
      targetPrice: price,
      condition: form.condition,
      createdAt: new Date().toISOString(),
      triggered: false,
    };
    const updated = [...alerts, newAlert];
    setAlerts(updated);
    saveAlerts(updated);
    setForm({ symbol: '', price: '', condition: 'above' });
    showToast(`Alert set: ${symbol} ${form.condition} $${price}`);
    checkAlerts(updated);
  }

  function removeAlert(id: string) {
    const updated = alerts.filter(a => a.id !== id);
    setAlerts(updated);
    saveAlerts(updated);
    showToast('Alert removed');
  }

  function clearTriggered() {
    const updated = alerts.filter(a => !a.triggered);
    setAlerts(updated);
    saveAlerts(updated);
    setTriggered([]);
    showToast('Triggered alerts cleared');
  }

  const active = alerts.filter(a => !a.triggered);
  const done = alerts.filter(a => a.triggered);

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 20px' }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 999,
          padding: '10px 16px', borderRadius: 8, background: 'var(--text)',
          color: 'var(--bg)', fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 16px rgba(0,0,0,.15)',
        }}>{toast}</div>
      )}

      {/* TRIGGERED NOTIFICATION */}
      {triggered.length > 0 && (
        <div style={{
          background: '#1a6b3c', color: '#fff', borderRadius: 14,
          padding: '16px 20px', marginBottom: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10,
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
              🎯 {triggered.length} Price Alert{triggered.length > 1 ? 's' : ''} Triggered!
            </div>
            {triggered.map(a => (
              <div key={a.id} style={{ fontSize: 13, opacity: .9 }}>
                {a.symbol} hit ${a.currentPrice?.toFixed(2)} — target was {a.condition} ${a.targetPrice}
              </div>
            ))}
          </div>
          <button onClick={() => setTriggered([])} style={{
            padding: '6px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.3)',
            background: 'transparent', color: '#fff', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
          }}>Dismiss</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h1 style={{ fontWeight: 700, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 4 }}>Price Alerts</h1>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>
            {active.length} active · Checks every 60 seconds · {checking ? '🔄 Checking now...' : 'Saved in browser'}
          </div>
        </div>
        {done.length > 0 && (
          <button onClick={clearTriggered} style={{
            padding: '7px 14px', borderRadius: 6, border: '1px solid var(--border)',
            background: 'var(--surface)', color: 'var(--text2)', fontFamily: 'inherit', fontSize: 12, cursor: 'pointer',
          }}>Clear Triggered</button>
        )}
      </div>

      {/* ADD FORM */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '3px solid #1a6b3c', borderRadius: 14, padding: '18px 20px', marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Set New Price Alert</div>
        {formError && (
          <div style={{ padding: '8px 12px', background: 'var(--red-light)', borderRadius: 6, fontSize: 12, color: '#c0392b', marginBottom: 10 }}>{formError}</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Ticker</div>
            <input
              value={form.symbol}
              onChange={e => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
              onKeyDown={e => e.key === 'Enter' && addAlert()}
              placeholder="AAPL"
              style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'monospace', fontSize: 13 }}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Condition</div>
            <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value as 'above' | 'below' })} style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13 }}>
              <option value="above">Price goes above</option>
              <option value="below">Price drops below</option>
            </select>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 5 }}>Target Price ($)</div>
            <input
              type="number"
              value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addAlert()}
              placeholder="150.00"
              step="0.01" min="0"
              style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--surface)', color: 'var(--text)', fontFamily: 'inherit', fontSize: 13 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button onClick={addAlert} style={{
              width: '100%', padding: '7px 14px', borderRadius: 6, border: 'none',
              background: '#1a6b3c', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>Set Alert</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text3)' }}>
          Alerts check every 60 seconds while the app is open. Browser must be open for alerts to trigger.
        </div>
      </div>

      {/* ACTIVE ALERTS */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
          Active Alerts
          <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--surface2)', color: 'var(--text3)' }}>{active.length}</span>
        </div>
        {active.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text3)', fontSize: 13 }}>
            No active alerts — set one above
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.map(alert => {
              const progress = alert.currentPrice && alert.targetPrice
                ? alert.condition === 'above'
                  ? Math.min(100, (alert.currentPrice / alert.targetPrice) * 100)
                  : Math.min(100, (alert.targetPrice / alert.currentPrice) * 100)
                : 0;
              return (
                <div key={alert.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10,
                  background: 'var(--surface2)',
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 14 }}>{alert.symbol}</span>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                        background: alert.condition === 'above' ? 'var(--green-light)' : 'var(--red-light)',
                        color: alert.condition === 'above' ? '#1a6b3c' : '#c0392b',
                      }}>
                        {alert.condition === 'above' ? '↑ Above' : '↓ Below'} ${alert.targetPrice.toFixed(2)}
                      </span>
                      {alert.currentPrice && (
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                          Current: <strong style={{ fontFamily: 'monospace' }}>${alert.currentPrice.toFixed(2)}</strong>
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 2, transition: 'width .5s',
                          background: alert.condition === 'above' ? '#1a6b3c' : '#c0392b',
                          width: `${progress}%`,
                        }} />
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text3)', flexShrink: 0 }}>
                        {progress.toFixed(0)}% to target
                      </span>
                    </div>
                  </div>
                  <button onClick={() => removeAlert(alert.id)} style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 4,
                    border: '1px solid var(--border)', background: 'transparent',
                    cursor: 'pointer', color: 'var(--text3)', flexShrink: 0,
                  }}>Remove</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TRIGGERED */}
      {done.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
            Triggered ✓
            <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--green-light)', color: '#1a6b3c' }}>{done.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {done.map(alert => (
              <div key={alert.id} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '10px 14px', border: '1px solid var(--green-light)', borderRadius: 10,
                background: 'var(--green-light)',
              }}>
                <div style={{ flex: 1, fontSize: 13 }}>
                  <strong style={{ fontFamily: 'monospace' }}>{alert.symbol}</strong>
                  <span style={{ color: 'var(--text2)', marginLeft: 8 }}>
                    triggered at ${alert.currentPrice?.toFixed(2)} — target was {alert.condition} ${alert.targetPrice}
                  </span>
                </div>
                <span style={{ fontSize: 18 }}>✓</span>
                <button onClick={() => removeAlert(alert.id)} style={{
                  fontSize: 10, padding: '3px 8px', borderRadius: 4,
                  border: '1px solid var(--border)', background: 'transparent',
                  cursor: 'pointer', color: 'var(--text3)',
                }}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '10px 14px', background: 'var(--gold-light)', border: '1px solid #e6c97a', borderRadius: 8, fontSize: 11, color: 'var(--text2)' }}>
        ⚠ <strong>Not financial advice.</strong> Price alerts are for informational purposes only. Alerts only work while this page is open in your browser.
      </div>
    </div>
  );
}
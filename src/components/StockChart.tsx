'use client';
import { useEffect, useState, useRef, useCallback } from 'react';

interface Point { time: number; price: number; open: number; }
const RANGES = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y'];

export default function StockChart({ symbol }: { symbol: string }) {
  const [range, setRange] = useState('1M');
  const [points, setPoints] = useState<Point[]>([]);
  const [change, setChange] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hover, setHover] = useState<{ x: number; y: number; point: Point } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  async function fetchChart(sym: string, r: string) {
    setLoading(true);
    setError('');
    setHover(null);
    try {
      const res = await fetch(`/api/chart?symbol=${sym}&range=${r}`);
      const data = await res.json();
      if (data.error || !data.points?.length) throw new Error(data.error || 'No data');
      setPoints(data.points);
      setChange(data.change);
    } catch (e: any) {
      setError('Could not load chart data');
      setPoints([]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchChart(symbol, range); }, [symbol, range]);

  // Draw chart on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const prices = points.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const pad = { top: 16, bottom: 28, left: 8, right: 52 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;
    const isPositive = change >= 0;
    const lineColor = isPositive ? '#1a8c52' : '#c0392b';
    const fillColor = isPositive ? 'rgba(26,140,82,0.08)' : 'rgba(192,57,43,0.08)';

    const xScale = (i: number) => pad.left + (i / (points.length - 1)) * chartW;
    const yScale = (p: number) => pad.top + chartH - ((p - min) / (max - min || 1)) * chartH;

    ctx.clearRect(0, 0, W, H);

    // Grid lines
    const gridCount = 4;
    ctx.strokeStyle = 'rgba(128,128,128,0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridCount; i++) {
      const y = pad.top + (i / gridCount) * chartH;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(W - pad.right, y); ctx.stroke();
      const price = max - (i / gridCount) * (max - min);
      ctx.fillStyle = 'rgba(128,128,128,0.55)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('$' + price.toFixed(price > 100 ? 0 : 2), W - pad.right + 4, y + 4);
    }

    // Fill area
    ctx.beginPath();
    ctx.moveTo(xScale(0), yScale(points[0].price));
    points.forEach((p, i) => {
      if (i === 0) return;
      const x0 = xScale(i - 1), y0 = yScale(points[i - 1].price);
      const x1 = xScale(i), y1 = yScale(p.price);
      const cpx = (x0 + x1) / 2;
      ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
    });
    ctx.lineTo(xScale(points.length - 1), H - pad.bottom);
    ctx.lineTo(xScale(0), H - pad.bottom);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(xScale(0), yScale(points[0].price));
    points.forEach((p, i) => {
      if (i === 0) return;
      const x0 = xScale(i - 1), y0 = yScale(points[i - 1].price);
      const x1 = xScale(i), y1 = yScale(p.price);
      const cpx = (x0 + x1) / 2;
      ctx.bezierCurveTo(cpx, y0, cpx, y1, x1, y1);
    });
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // X-axis labels
    const labelCount = Math.min(6, points.length);
    ctx.fillStyle = 'rgba(128,128,128,0.6)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.floor(i / (labelCount - 1) * (points.length - 1));
      const p = points[idx];
      const d = new Date(p.time);
      const label = range === '1D' || range === '5D'
        ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      ctx.fillText(label, xScale(idx), H - pad.bottom + 14);
    }

    // Hover crosshair
    if (hover) {
      const hx = hover.x;
      const hy = yScale(hover.point.price);
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(128,128,128,0.35)';
      ctx.lineWidth = 1;
      ctx.moveTo(hx, pad.top); ctx.lineTo(hx, H - pad.bottom);
      ctx.moveTo(pad.left, hy); ctx.lineTo(W - pad.right, hy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }, [points, change, hover]);

  function onMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const W = canvas.offsetWidth;
    const pad = { left: 8, right: 52 };
    const chartW = W - pad.left - pad.right;
    const idx = Math.round(((x - pad.left) / chartW) * (points.length - 1));
    const clamped = Math.max(0, Math.min(points.length - 1, idx));
    const prices = points.map(p => p.price);
    const min = Math.min(...prices), max = Math.max(...prices);
    const H = canvas.offsetHeight;
    const pad2 = { top: 16, bottom: 28 };
    const chartH = H - pad2.top - pad2.bottom;
    const y = pad2.top + chartH - ((points[clamped].price - min) / (max - min || 1)) * chartH;
    setHover({ x: pad.left + (clamped / (points.length - 1)) * chartW, y, point: points[clamped] });
  }

  const isPositive = change >= 0;
  const lineColor = isPositive ? '#1a8c52' : '#c0392b';

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      {/* Range tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '4px 10px', borderRadius: 6,
              border: `1px solid ${range === r ? lineColor : 'var(--border)'}`,
              background: range === r ? (isPositive ? 'var(--green-light)' : 'var(--red-light)') : 'transparent',
              color: range === r ? lineColor : 'var(--text3)',
              fontFamily: 'monospace', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}>{r}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: lineColor, fontFamily: 'monospace' }}>
          {isPositive ? '▲ +' : '▼ '}{Math.abs(change).toFixed(2)}%
        </div>
      </div>

        {/* Hover tooltip — always reserve space so chart doesn't jump */}
      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6, fontFamily: 'monospace', display: 'flex', gap: 14, height: 16, alignItems: 'center' }}>
        {hover ? (
          <>
            <span style={{ color: lineColor, fontWeight: 700 }}>${hover.point.price.toFixed(2)}</span>
            <span>{new Date(hover.point.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {(range === '1D' || range === '5D') && ` ${new Date(hover.point.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </>
        ) : (
          <span style={{ color: 'var(--text3)' }}>Hover to inspect price</span>
        )}
      </div>
      {/* Canvas */}
      <div style={{ position: 'relative', height: 200, width: '100%' }}>
        {loading && (
          <div className="skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 8 }} />
        )}
        {error && !loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text3)' }}>
            {error}
          </div>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', display: loading || error ? 'none' : 'block', cursor: 'crosshair' }}
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHover(null)}
        />
      </div>
    </div>
  );
}
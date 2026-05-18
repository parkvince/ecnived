export interface Position {
  ticker: string;
  shares: number;
  cost: number;
  date: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
}

const PORTFOLIO_KEY = 'ecnived_portfolio_v2';
const WATCHLIST_KEY = 'ecnived_watchlist_v2';
const THEME_KEY = 'ecnived_theme';

export function loadPortfolio(): Position[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PORTFOLIO_KEY);
    return raw ? JSON.parse(raw) : getDefaultPortfolio();
  } catch {
    return getDefaultPortfolio();
  }
}

export function savePortfolio(positions: Position[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(positions));
}

export function loadWatchlist(): WatchlistItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWatchlist(items: WatchlistItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(items));
}

export function loadTheme(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(THEME_KEY) || '';
}

export function saveTheme(theme: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(THEME_KEY, theme);
}

function getDefaultPortfolio(): Position[] {
  return [
    { ticker: 'AAPL', shares: 50, cost: 165.20, date: '2024-01-10' },
    { ticker: 'NVDA', shares: 20, cost: 620.00, date: '2024-03-15' },
    { ticker: 'META', shares: 15, cost: 420.50, date: '2024-02-20' },
    { ticker: 'MSFT', shares: 25, cost: 380.00, date: '2024-01-05' },
  ];
}
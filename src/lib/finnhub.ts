const BASE = 'https://finnhub.io/api/v1';
const KEY = process.env.FINNHUB_API_KEY || '';

async function get(path: string) {
  const url = `${BASE}${path}&token=${KEY}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Finnhub error: ${res.status}`);
  return res.json();
}

export async function getQuote(symbol: string) {
  try { return await get(`/quote?symbol=${symbol}`); } catch { return null; }
}

export async function getCompanyProfile(symbol: string) {
  try { return await get(`/stock/profile2?symbol=${symbol}`); } catch { return null; }
}

export async function getNews(symbol: string) {
  try {
    const to = new Date().toISOString().split('T')[0];
    const from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    return await get(`/company-news?symbol=${symbol}&from=${from}&to=${to}`);
  } catch { return []; }
}

export async function getEarningsSurprises(symbol: string) {
  try { return await get(`/stock/earnings?symbol=${symbol}&limit=8`); } catch { return []; }
}

export async function getBasicFinancials(symbol: string) {
  try { return await get(`/stock/metric?symbol=${symbol}&metric=all`); } catch { return null; }
}

export async function searchSymbol(query: string) {
  try { return await get(`/search?q=${query}`); } catch { return { result: [] }; }
}

export async function getRecommendationTrends(symbol: string) {
  try { return await get(`/stock/recommendation?symbol=${symbol}`); } catch { return []; }
}

export async function getEarningsCalendar() {
  try {
    const to = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    const from = new Date().toISOString().split('T')[0];
    return await get(`/calendar/earnings?from=${from}&to=${to}`);
  } catch {
    return { earningsCalendar: [] };
  }
}
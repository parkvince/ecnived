# ecnived

A financial intelligence platform I built to learn full-stack development. It pulls real market data and runs a quantitative scoring formula to predict whether a company will beat or miss earnings.

Live: **[ecnived.vercel.app](https://ecnived.vercel.app)**

---

## What it does

Most retail investors go into earnings blind. This app tries to fix that by scoring every stock 0-100 based on 9 real signals pulled from actual market data. Higher score = historically stronger pre-earnings setup.

The score is based on:
- EPS beat streak (how many quarters in a row they beat estimates)
- Average EPS surprise magnitude
- Analyst revision trends
- Short interest as % of float
- Revenue growth YoY
- Implied vs historical volatility ratio
- News sentiment from real headlines
- Social momentum
- Insider activity flags

No fake data. Every price, earnings history and news headline is live from Finnhub and Yahoo Finance.

---

## Features

**Dashboard** — Live S&P 500, NASDAQ and DOW prices. Top picks of the day with real beat streaks and surprise history.

**Market Digest** — Infinite scroll news feed across 15 major tickers. Click any article to summarize it, cite it in APA/MLA/Chicago/AMA/Harvard or open the original. Daily market recap generated from real headlines.

**Stock Screener** — Filter 25+ stocks and ETFs by sector, sentiment, beat streak and short interest. Interactive price charts with 1D to 5Y timeframes. Hover to inspect any price point.

**Earnings Radar** — Real upcoming earnings calendar pulled from Finnhub. Click any stock for the deep dive: price chart, signal breakdown, earnings history, live news feed and a BEAT or MISS prediction with confidence score.

**Sentiment Lab** — Type any ticker and get a full analysis: market narrative, 3 bullish catalysts, 3 bearish risks and a forward outlook. All built from real news data. Includes a sentiment breakdown chart showing positive vs neutral vs negative coverage.

**Portfolio Tracker** — Add any holdings manually. Tracks real P&L with live prices, sector allocation, risk scoring and earnings impact calendar. Click any ticker to expand an inline price chart. Exports to CSV. Persists across browser sessions.

**Watchlist** — Track any stock or ETF. Search any ticker (not just the preloaded ones). Same inline charts and Ecnived scores.

**Price Alerts** — Set a price target for any stock. The app checks every 60 seconds and notifies you when it triggers. Progress bar shows how close you are to target.

**Compare** — Side by side comparison of any two stocks across 7 metrics with an automatic verdict.

**Finance 101** — 15 rotating financial concepts explained in plain English. Rotates randomly each session.

---

## Tech stack

- **Next.js 15** with TypeScript — frontend and backend API routes in one project
- **Finnhub API** — live quotes, earnings history, company profiles, news
- **Yahoo Finance** — historical OHLC data for all chart timeframes
- **Canvas API** — custom price charts, no chart library
- **localStorage** — portfolio, watchlist and price alerts persist across sessions
- **Vercel** — deployed with automatic CI/CD from GitHub

---

## Running it locally

```bash
git clone https://github.com/parkvince/ecnived.git
cd ecnived
npm install
```

Create a `.env.local` file:

```
FINNHUB_API_KEY=your_key_here
```

Get a free Finnhub key at [finnhub.io/register](https://finnhub.io/register) — free tier gives 60 API calls per minute which is enough.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Disclaimer

Ecnived is not a registered investment advisor. Nothing on this platform is financial advice. All scores are quantitative estimates for educational purposes only.

---

Built by [Vince Park](mailto:vp332@cornell.edu)
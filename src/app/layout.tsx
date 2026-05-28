import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ecnived — Earnings Intelligence',
  description: 'AI-powered earnings surprise predictor and market sentiment platform. Real earnings history, quantitative scoring, live stock data.',
  keywords: 'earnings prediction, stock analysis, EPS beat, sentiment analysis, fintech',
  authors: [{ name: 'Vince, Ethan & Alex' }],
  openGraph: {
    title: 'ecnived — Earnings Intelligence',
    description: 'Predict earnings with a 9-signal quantitative formula. Real data. No guessing.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
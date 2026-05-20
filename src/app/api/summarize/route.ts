import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { url, headline, source } = await req.json();
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 });

  try {
    // Fetch the article content
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    });

    let articleText = '';

    if (res.ok) {
      const html = await res.text();
      // Strip HTML tags and extract readable text
      articleText = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim()
        .slice(0, 3000); // first 3000 chars is enough
    }

    // Build summary from real content or headline
    const hasContent = articleText.length > 200;
    const sentiment = detectSentiment(headline);
    const ticker = extractTicker(headline + ' ' + articleText);

    let summary = '';

    if (hasContent) {
      // Extract key sentences from real content
      const sentences = articleText
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 40 && s.length < 300)
        .slice(0, 8);

      const topSentences = sentences.slice(0, 3).join('. ') + '.';

      summary = `ARTICLE SUMMARY
"${headline}"
— ${source}

WHAT IT SAYS
${topSentences}

KEY CONTEXT
${sentences.slice(3, 5).join('. ') || 'See full article for additional context.'}.

MARKET RELEVANCE
${ticker ? `This story relates to $${ticker}. ` : ''}Sentiment: ${sentiment}. ${sentiment === 'Positive' ? 'Stories like this often correlate with short-term buying pressure as retail investors react to positive headlines.' : sentiment === 'Negative' ? 'Negative news flow can weigh on price action, particularly in the days before or after an earnings event.' : 'Neutral coverage — monitor for follow-up stories that may shift sentiment in either direction.'}

WHAT TO WATCH
- Follow-up analyst commentary in the next 24–48 hours
- Options flow for unusual activity around the mentioned company
- Whether management responds or updates guidance

[Summarized from real article content · Not financial advice]`;
    } else {
      // Fallback — honest about what we have
      summary = `ARTICLE SUMMARY
"${headline}"
— ${source}

NOTE
This article is behind a paywall or could not be fully loaded. The summary below is based on the headline only.

HEADLINE ANALYSIS
${sentimentExplainer(sentiment, headline, ticker)}

WHAT TO WATCH
- Click "Open Article" to read the full piece
- Search for related coverage on Google News
- Check the company's investor relations page for official statements

[Headline-only summary — full content unavailable · Not financial advice]`;
    }

    return NextResponse.json({ summary, hasContent, sentiment });
  } catch (err: any) {
    // Always return something useful
    const sentiment = detectSentiment(headline);
    const ticker = extractTicker(headline);
    return NextResponse.json({
      summary: `ARTICLE SUMMARY\n"${headline}"\n— ${source}\n\nNOTE\nCould not fetch full article (may be paywalled or blocked).\n\nHEADLINE ANALYSIS\n${sentimentExplainer(sentiment, headline, ticker)}\n\n[Headline-only summary · Not financial advice]`,
      hasContent: false,
      sentiment,
    });
  }
}

function detectSentiment(text: string): string {
  const lower = text.toLowerCase();
  if (lower.match(/beat|surge|rise|strong|record|growth|upgrade|rally|profit|gain|bull|jump|soar|exceed|top/)) return 'Positive';
  if (lower.match(/miss|fall|drop|weak|cut|downgrade|loss|decline|crash|bear|layoff|recession|fear|warn|below/)) return 'Negative';
  return 'Neutral';
}

function extractTicker(text: string): string {
  const match = text.match(/\b([A-Z]{2,5})\b/g);
  const common = ['CEO', 'CFO', 'IPO', 'GDP', 'CPI', 'ETF', 'USA', 'SEC', 'FED', 'AI'];
  if (!match) return '';
  return match.find(m => !common.includes(m)) || '';
}

function sentimentExplainer(sentiment: string, headline: string, ticker: string): string {
  if (sentiment === 'Positive') {
    return `The headline carries a positive tone — words suggesting strength, growth, or outperformance. ${ticker ? `For $${ticker}, this type of coverage often precedes increased buying interest.` : 'Positive macro headlines typically support broad market indices.'} Historically, strong headline sentiment ahead of earnings correlates with elevated expectations.`;
  }
  if (sentiment === 'Negative') {
    return `The headline carries a negative tone — words suggesting weakness, cuts, or underperformance. ${ticker ? `For $${ticker}, watch for options put activity and potential analyst downgrades following this coverage.` : 'Negative macro headlines can trigger risk-off behavior across sectors.'} Weak sentiment before earnings often sets a lower bar, which can paradoxically lead to relief rallies.`;
  }
  return `The headline is factual and neutral in tone. ${ticker ? `For $${ticker}, neutral coverage typically has minimal immediate price impact.` : 'Neutral macro news is often a non-event for markets unless combined with other catalysts.'} Watch for analyst interpretation of the underlying data.`;
}
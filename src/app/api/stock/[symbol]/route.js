import { NextResponse } from 'next/server';

function generateHistory(basePrice, days) {
  const data = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000);
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    const change = (Math.random() - 0.49) * price * 0.02;
    const open = price;
    price = Math.max(price + change, 1);
    const high = Math.max(open, price) * (1 + Math.random() * 0.005);
    const low = Math.min(open, price) * (1 - Math.random() * 0.005);
    data.push({ date: date.toISOString().split('T')[0], open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +price.toFixed(2), volume: Math.floor(Math.random() * 5000000 + 500000) });
  }
  return data;
}

const DEMO_STOCKS = {
  'RELIANCE.NS': { name: 'Reliance Industries Ltd', price: 2934.5, changePct: 1.20, marketCap: 2935e9, pe: 20.72, pb: 2.3, roe: 11.2, dividendYield: 0.34, week52High: 3217.9, week52Low: 2220.3, sector: 'Energy', eps: 141.7, debtToEquity: 0.44 },
  'TCS.NS': { name: 'Tata Consultancy Services', price: 3856.40, changePct: 0.85, marketCap: 1401e9, pe: 28.4, pb: 13.2, roe: 46.5, dividendYield: 1.55, week52High: 4255.3, week52Low: 3311.7, sector: 'IT', eps: 135.8, debtToEquity: 0.01 },
  'HDFCBANK.NS': { name: 'HDFC Bank Ltd', price: 1687.25, changePct: -0.32, marketCap: 1284e9, pe: 18.9, pb: 2.8, roe: 17.4, dividendYield: 1.22, week52High: 1880.0, week52Low: 1363.55, sector: 'Banking', eps: 89.3, debtToEquity: 8.2 },
  'INFY.NS': { name: 'Infosys Ltd', price: 1789.60, changePct: 1.15, marketCap: 743e9, pe: 25.1, pb: 8.4, roe: 33.5, dividendYield: 2.45, week52High: 2000.3, week52Low: 1358.35, sector: 'IT', eps: 71.3, debtToEquity: 0.02 },
};

function getDemoStock(symbol) {
  const known = DEMO_STOCKS[symbol] || DEMO_STOCKS['RELIANCE.NS'];
  const base = known.price;
  return { ...known, symbol, history: generateHistory(base * 0.9, 365) };
}

export async function GET(request, { params }) {
  const { symbol } = await params;
  try {
    const yf = await import('yahoo-finance2').then(m => m.default ?? m);
    const [quote, hist] = await Promise.all([
      yf.quote(symbol),
      yf.historical(symbol, { period1: new Date(Date.now() - 365 * 86400000), interval: '1d' }).catch(() => []),
    ]);
    const data = {
      symbol,
      name: quote.longName || quote.shortName || symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePct: quote.regularMarketChangePercent,
      open: quote.regularMarketOpen,
      prevClose: quote.regularMarketPreviousClose,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      week52High: quote.fiftyTwoWeekHigh,
      week52Low: quote.fiftyTwoWeekLow,
      pe: quote.trailingPE,
      eps: quote.epsTrailingTwelveMonths,
      dividendYield: quote.dividendYield ? quote.dividendYield * 100 : null,
      beta: quote.beta,
      sector: quote.sector || 'N/A',
      history: hist.map(h => ({ date: h.date?.toISOString?.().split('T')[0] ?? '', open: h.open, high: h.high, low: h.low, close: h.close, volume: h.volume })),
    };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(getDemoStock(symbol));
  }
}

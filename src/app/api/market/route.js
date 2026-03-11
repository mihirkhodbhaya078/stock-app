import { NextResponse } from 'next/server';

const DEMO_MARKET = {
  indices: [
    { symbol: 'NIFTY 50', price: 22438.25, change: 149.35, changePct: 0.69, high: 22512.35, low: 22301.20 },
    { symbol: 'SENSEX', price: 73985.16, change: 426.94, changePct: 0.53, high: 74120.50, low: 73601.40 },
    { symbol: 'BANK NIFTY', price: 47885.81, change: -110.42, changePct: -0.26, high: 48100.25, low: 47721.65 },
  ],
  gainers: [
    { symbol: 'TATAMOTORS', price: 954.30, changePct: 3.45, volume: 12500000 },
    { symbol: 'ADANIENT', price: 3142.50, changePct: 2.89, volume: 8900000 },
    { symbol: 'MARUTI', price: 12456.70, changePct: 2.34, volume: 450000 },
    { symbol: 'SUNPHARMA', price: 1623.40, changePct: 1.98, volume: 3200000 },
    { symbol: 'WIPRO', price: 478.90, changePct: 1.67, volume: 9800000 },
  ],
  losers: [
    { symbol: 'TATASTEEL', price: 162.35, changePct: -2.34, volume: 45000000 },
    { symbol: 'ONGC', price: 264.80, changePct: -1.89, volume: 18000000 },
    { symbol: 'ITC', price: 432.50, changePct: -1.23, volume: 22000000 },
    { symbol: 'AXISBANK', price: 1089.60, changePct: -0.98, volume: 7600000 },
    { symbol: 'NTPC', price: 356.20, changePct: -0.76, volume: 12300000 },
  ],
  sectors: [
    { name: 'IT', changePct: 1.23 },
    { name: 'Banking', changePct: -0.45 },
    { name: 'FMCG', changePct: 0.78 },
    { name: 'Auto', changePct: 1.56 },
    { name: 'Pharma', changePct: -0.32 },
    { name: 'Energy', changePct: 0.95 },
    { name: 'Metal', changePct: -1.23 },
    { name: 'Realty', changePct: 2.14 },
    { name: 'Infra', changePct: 0.67 },
    { name: 'Media', changePct: -0.89 },
  ],
  breadth: { advances: 1234, declines: 867, unchanged: 145 },
};

export async function GET() {
  try {
    const yf = await import('yahoo-finance2').then(m => m.default ?? m);
    const [nifty, sensex, banknifty] = await Promise.all([
      yf.quote('^NSEI'), yf.quote('^BSESN'), yf.quote('^NSEBANK')
    ]);
    const indices = [
      { symbol: 'NIFTY 50', price: nifty.regularMarketPrice, change: nifty.regularMarketChange, changePct: nifty.regularMarketChangePercent, high: nifty.regularMarketDayHigh, low: nifty.regularMarketDayLow },
      { symbol: 'SENSEX', price: sensex.regularMarketPrice, change: sensex.regularMarketChange, changePct: sensex.regularMarketChangePercent, high: sensex.regularMarketDayHigh, low: sensex.regularMarketDayLow },
      { symbol: 'BANK NIFTY', price: banknifty.regularMarketPrice, change: banknifty.regularMarketChange, changePct: banknifty.regularMarketChangePercent, high: banknifty.regularMarketDayHigh, low: banknifty.regularMarketDayLow },
    ];
    return NextResponse.json({ ...DEMO_MARKET, indices });
  } catch {
    return NextResponse.json(DEMO_MARKET);
  }
}

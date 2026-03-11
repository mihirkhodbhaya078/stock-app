// Technical Indicators
export function sma(data, period) {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

export function ema(data, period) {
  const k = 2 / (period + 1);
  const result = [];
  let prev = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) { result.push(null); continue; }
    if (prev === null) {
      prev = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(prev); continue;
    }
    prev = data[i] * k + prev * (1 - k);
    result.push(prev);
  }
  return result;
}

export function rsi(data, period = 14) {
  const result = Array(period).fill(null);
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period, avgLoss = losses / period;
  result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(diff, 0)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(-diff, 0)) / period;
    result.push(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss));
  }
  return result;
}

export function macd(data, fast = 12, slow = 26, signal = 9) {
  const fastEma = ema(data, fast);
  const slowEma = ema(data, slow);
  const macdLine = fastEma.map((v, i) => (v != null && slowEma[i] != null) ? v - slowEma[i] : null);
  const validMacd = macdLine.filter(v => v !== null);
  const signalLine = ema(validMacd, signal);
  const fullSignal = macdLine.map((v, i) => {
    if (v === null) return null;
    const idx = macdLine.slice(0, i + 1).filter(x => x !== null).length - 1;
    return signalLine[idx] ?? null;
  });
  return { macd: macdLine, signal: fullSignal, histogram: macdLine.map((v, i) => (v != null && fullSignal[i] != null) ? v - fullSignal[i] : null) };
}

export function bollingerBands(data, period = 20, stdDev = 2) {
  const middle = sma(data, period);
  return middle.map((mid, i) => {
    if (mid === null) return { upper: null, middle: null, lower: null };
    const slice = data.slice(i - period + 1, i + 1);
    const std = Math.sqrt(slice.reduce((acc, v) => acc + Math.pow(v - mid, 2), 0) / period);
    return { upper: mid + stdDev * std, middle: mid, lower: mid - stdDev * std };
  });
}

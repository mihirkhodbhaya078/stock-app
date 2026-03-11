export function sharpeRatio(returns, riskFreeRate = 0.06) {
  const daily = returns;
  const mean = daily.reduce((a, b) => a + b, 0) / daily.length;
  const std = Math.sqrt(daily.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / daily.length);
  const annualReturn = mean * 252;
  const annualStd = std * Math.sqrt(252);
  return annualStd === 0 ? 0 : (annualReturn - riskFreeRate) / annualStd;
}

export function maxDrawdown(prices) {
  let peak = prices[0], maxDD = 0;
  for (const p of prices) {
    if (p > peak) peak = p;
    const dd = (peak - p) / peak;
    if (dd > maxDD) maxDD = dd;
  }
  return maxDD;
}

export function monteCarlo(currentPrice, volatility, drift, days = 252, simulations = 100) {
  const results = [];
  for (let s = 0; s < simulations; s++) {
    let price = currentPrice;
    const path = [price];
    for (let d = 0; d < days; d++) {
      const rand = boxMuller();
      price = price * Math.exp((drift - 0.5 * volatility * volatility) / 252 + volatility * rand / Math.sqrt(252));
      path.push(price);
    }
    results.push(path[path.length - 1]);
  }
  results.sort((a, b) => a - b);
  return {
    mean: results.reduce((a, b) => a + b, 0) / results.length,
    p5: results[Math.floor(results.length * 0.05)],
    p95: results[Math.floor(results.length * 0.95)],
    distribution: results,
  };
}

function boxMuller() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

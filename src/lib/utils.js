export function formatCurrency(val) {
  if (val == null || isNaN(val)) return '—';
  return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatLargeNumber(val) {
  if (val == null || isNaN(val)) return '—';
  const n = Number(val);
  if (n >= 1e12) return '₹' + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return '₹' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e7) return '₹' + (n / 1e7).toFixed(2) + 'Cr';
  if (n >= 1e5) return '₹' + (n / 1e5).toFixed(2) + 'L';
  return '₹' + n.toLocaleString('en-IN');
}

export function formatPercent(val) {
  if (val == null || isNaN(val)) return '—';
  const n = Number(val);
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

export function formatVolume(val) {
  if (val == null || isNaN(val)) return '—';
  const n = Number(val);
  if (n >= 1e7) return (n / 1e7).toFixed(1) + 'Cr';
  if (n >= 1e5) return (n / 1e5).toFixed(1) + 'L';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return String(n);
}

export function colorClass(val) {
  if (val == null || isNaN(val)) return 'text-gray-400';
  return Number(val) >= 0 ? 'text-green-400' : 'text-red-400';
}

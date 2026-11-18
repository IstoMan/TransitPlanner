export function nowHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function validTime(value) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value || '');
}

export function money(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return '₹' + Math.round(Number(value)).toLocaleString('en-IN');
}

export function minutes(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return String(Math.round(Number(value)));
}

export function speed(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toFixed(1);
}

export function count(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Math.round(Number(value)).toLocaleString('en-IN');
}

export function fastestId(options) {
  let best = null;
  for (const option of options || []) {
    if (!option.available || option.minutes == null) continue;
    if (best == null || option.minutes < best.minutes) best = option;
  }
  return best ? best.id : options?.[0]?.id ?? null;
}

export function optionColor(option) {
  if (option?.id === 'metro') return 'var(--metro)';
  if (option?.id === 'cab') return 'var(--cab)';
  if (option?.id === 'auto') return 'var(--auto)';
  return 'var(--bus)';
}

export function optionIcon(option) {
  if (option?.id === 'metro') return 'M';
  if (option?.id === 'cab') return 'C';
  if (option?.id === 'auto') return 'A';
  return 'B';
}

export function rainLevel(chance) {
  const rain = Number(chance);
  if (rain >= 60) return 'stormy';
  if (rain >= 30) return 'rainy';
  return 'fair';
}

export function rainMood(chance) {
  const level = rainLevel(chance);
  if (level === 'stormy') return 'Rain likely';
  if (level === 'rainy') return 'Rain possible';
  return 'Pleasant';
}

export function project(lat, lon) {
  return {
    x: (((Number(lon) - 73.72) / 0.28) * 800).toFixed(1),
    y: (((18.64 - Number(lat)) / 0.20) * 600).toFixed(1),
  };
}

export function projectChain(coords) {
  return (coords || [])
    .map(([lat, lon]) => {
      const point = project(lat, lon);
      return `${point.x},${point.y}`;
    })
    .join(' ');
}

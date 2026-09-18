'use client';
import Link from 'next/link';

const COLORS = ['#7c3aed', '#ec4899', '#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

export function colorFor(name = '?') {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const c1 = COLORS[h % COLORS.length], c2 = COLORS[(h >> 3) % COLORS.length];
  return `linear-gradient(135deg, ${c1}, ${c2})`;
}

export function Avatar({ user, size = 44 }) {
  const nm = user?.username || user?.name || '?';
  return (
    <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.42, background: colorFor(nm) }}>
      {nm[0].toUpperCase()}
    </div>
  );
}

export function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return s + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  if (s < 604800) return Math.floor(s / 86400) + 'd';
  return new Date(iso).toLocaleDateString();
}

// caption -> JSX with clickable hashtags
export function tagify(caption = '') {
  const parts = String(caption).split(/(#[\p{L}\p{N}_]+)/gu);
  return parts.map((p, i) =>
    /^#[\p{L}\p{N}_]+$/u.test(p)
      ? <Link key={i} href={`/explore?q=${encodeURIComponent(p)}`} className="tag">{p}</Link>
      : <span key={i}>{p}</span>
  );
}

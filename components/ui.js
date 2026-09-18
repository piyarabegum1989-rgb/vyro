'use client';
import Link from 'next/link';

const COLORS = ['#7a5cff', '#e745c5', '#1599ff', '#24c77b', '#f38b33', '#e95669', '#9163f7', '#12b9b2'];

export function colorFor(name = '?') {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return `linear-gradient(135deg, ${COLORS[h % COLORS.length]}, ${COLORS[(h >> 3) % COLORS.length]})`;
}

export function Avatar({ user, size = 44, className = '' }) {
  const nm = user?.username || user?.name || '?';
  const style = { width: size, height: size, fontSize: size * 0.39, background: colorFor(nm) };
  if (user?.avatarUrl) return <img className={'avatar avatar-image ' + className} src={user.avatarUrl} alt={user.name || user.username || 'Profile'} style={style} />;
  return <div className={'avatar ' + className} style={style}>{nm[0].toUpperCase()}</div>;
}

export function timeAgo(iso) {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  if (s < 86400) return Math.floor(s / 3600) + 'h';
  if (s < 604800) return Math.floor(s / 86400) + 'd';
  return new Date(iso).toLocaleDateString();
}

export function tagify(caption = '') {
  const parts = String(caption).split(/(#[\p{L}\p{N}_]+)/gu);
  return parts.map((p, i) => /^#[\p{L}\p{N}_]+$/u.test(p)
    ? <Link key={i} href={`/explore?q=${encodeURIComponent(p)}`} className="tag">{p}</Link>
    : <span key={i}>{p}</span>);
}

export function ViroMark({ size = 38, word = true, compact = false }) {
  return <div className={'viro-mark ' + (compact ? 'compact' : '')}>
    <img src="/viro-v-mark.png" width={size} height={size} alt="VIRO" />
    {word && <b>VIRO</b>}
  </div>;
}

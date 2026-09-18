import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { table } from '@/lib/db';

const FEATS = [
  { e: '📸', t: 'Photo & Video Posts', d: 'ছবি আর ভিডিও শেয়ার করো', b: ['ok', '✅ Live'] },
  { e: '🎬', t: 'Short Videos / Reels', d: 'ভার্টিকাল শর্ট ভিডিও ফিড', b: ['ok', '✅ Live'] },
  { e: '💬', t: 'Messaging', d: 'বন্ধুদের সাথে চ্যাট', b: ['ok', '✅ Live'] },
  { e: '👥', t: 'Follow / Friends', d: 'ফলো + private follow request', b: ['ok', '✅ Live'] },
  { e: '❤️', t: 'Like / Comment', d: 'রিয়্যাক্ট আর আলোচনা', b: ['ok', '✅ Live'] },
  { e: '🔔', t: 'Notifications', d: 'লাইক, কমেন্ট, ফলো, মেসেজ', b: ['ok', '✅ Live'] },
  { e: '🔎', t: 'Explore + Trending Hashtags', d: 'সার্চ + ট্রেন্ডিং ট্যাগ chips', b: ['ok', '✅ Live'] },
  { e: '👤', t: 'Profile', d: 'Posts/Reels tabs, edit, stats', b: ['ok', '✅ Live'] },
  { e: '🔐', t: 'Privacy & Security', d: 'Private account, block, password, sessions', b: ['new', '✨ Notun!'] },
  { e: '🤖', t: 'AI Hashtag Assist', d: 'Caption থেকে smart hashtag suggest', b: ['beta', 'Beta'] },
  { e: '✍️', t: 'AI Captions', d: 'ছবি দেখে auto caption', b: ['soon', '🕒 Coming soon'] },
  { e: '🧠', t: 'Smart Explore', d: 'তোমার পছন্দমতো ফিড', b: ['soon', '🕒 Coming soon'] },
];

export default async function Landing() {
  const c = cookies().get('vyro_session');
  if (c) {
    const s = (await table('sessions')).find(x => x.token === c.value);
    if (s && (await table('users')).some(u => u.id === s.userId)) redirect('/feed');
  }
  return (
    <main>
      <div className="hero">
        <h1><span>vyro</span></h1>
        <p className="tag">Connect. Create. Share.</p>
        <p className="mut" style={{ maxWidth: 560, margin: '0 auto 24px' }}>
          বাংলাদেশের নিজস্ব social app — ছবি, reels, চ্যাট আর প্রাইভেসি, সব এক জায়গায়। 🔐
        </p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <Link href="/signup" className="btn">🚀 শুরু করো</Link>
          <Link href="/login" className="btn ghost">লগ ইন</Link>
        </div>
        <div className="card" style={{ maxWidth: 420, margin: '26px auto 0', fontSize: 14 }}>
          <b>🎭 Demo account:</b> <code>demo@vyro.app</code> / <code>password123</code>
          <div className="mut" style={{ fontSize: 12, marginTop: 6 }}>লগ ইন করে সব ফিচার ঘুরে দেখো!</div>
        </div>
      </div>
      <div className="feat">
        {FEATS.map(f => (
          <div className="f" key={f.t}>
            <div className="e">{f.e}</div>
            <h3>{f.t} <span className={`badge ${f.b[0]}`}>{f.b[1]}</span></h3>
            <p>{f.d}</p>
          </div>
        ))}
      </div>
      <footer className="center mut" style={{ padding: '30px 16px 50px', fontSize: 13 }}>
        Made with ❤️ in Bangladesh • VYRO v1.0 • 📲 Home screen-এ add করলে VYRO icon পাবে
      </footer>
    </main>
  );
}

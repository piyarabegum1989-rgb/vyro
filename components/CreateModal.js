'use client';
import { useState } from 'react';

export default function CreateModal({ onClose, onDone }) {
  const [type, setType] = useState('post');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [upBusy, setUpBusy] = useState(false);

  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUpBusy(true); setErr('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const d = await res.json();
    setUpBusy(false);
    if (!res.ok) return setErr(d.error || 'Upload failed');
    setMediaUrl(d.url);
    if (file.type.startsWith('video')) setType('reel');
  }

  async function assist() {
    setAiBusy(true);
    const res = await fetch('/api/ai/hashtags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption, location }) });
    const d = await res.json();
    setAiBusy(false);
    setAi(d.suggestions || []);
  }

  function autoAdd() {
    if (!ai?.length) return;
    const fresh = ai.filter(t => !caption.includes(t));
    setCaption(c => (c ? c.trimEnd() + ' ' : '') + fresh.join(' '));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, mediaUrl, caption, location }) });
    const d = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(d.error || 'Post failed');
    onDone && onDone();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>✨ নতুন {type === 'reel' ? 'Reel 🎬' : 'Post 📸'}</h2>
        {err && <div className="err">{err}</div>}
        <form onSubmit={submit}>
          <div className="field">
            <label>Type</label>
            <div className="seg">
              <button type="button" className={type === 'post' ? 'on' : ''} onClick={() => setType('post')}>📸 Post</button>
              <button type="button" className={type === 'reel' ? 'on' : ''} onClick={() => setType('reel')}>🎬 Reel</button>
            </div>
          </div>
          <div className="field">
            <label>ছবি/ভিডিও {upBusy && '(uploading...)'}</label>
            <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="https://... ছবি/ভিডিও link" />
            <div className="mut" style={{ fontSize: 12, margin: '6px 0' }}>অথবা ফোন থেকে আপলোড করো:</div>
            <input type="file" accept="image/*,video/*" onChange={upload} disabled={upBusy} />
          </div>
          {mediaUrl && (
            <div className="field">
              {type === 'reel' || mediaUrl.match(/\.(mp4|webm|mov)(\?|$)/) || mediaUrl.includes('gtv-videos')
                ? <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 220, borderRadius: 10, background: '#000' }} />
                : <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10 }} />}
            </div>
          )}
          <div className="field">
            <label>Caption</label>
            <textarea rows={3} value={caption} onChange={e => setCaption(e.target.value)} placeholder="কিছু লেখো... #vyro" />
          </div>
          <div className="field">
            <label>📍 Location (optional)</label>
            <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Dhaka, Bangladesh" />
          </div>
          <div className="field">
            <button type="button" className="btn ghost sm" onClick={assist} disabled={aiBusy} style={{ width: '100%' }}>
              {aiBusy ? '...' : '✨ AI hashtag assist'} <span className="badge beta">Beta</span>
            </button>
            {ai && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {ai.map(t => <span key={t} className="chip" onClick={() => setCaption(c => c + (c.endsWith(' ') || !c ? '' : ' ') + t + ' ')}>{t}</span>)}
                </div>
                <button type="button" className="btn sm" style={{ marginTop: 8 }} onClick={autoAdd}>＋ সব auto-add করো</button>
              </div>
            )}
          </div>
          <div className="row">
            <button type="button" className="btn ghost" style={{ flex: 1 }} onClick={onClose}>বাতিল</button>
            <button className="btn" style={{ flex: 2 }} disabled={busy || !mediaUrl}>{busy ? '...' : 'পোস্ট করো 🚀'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

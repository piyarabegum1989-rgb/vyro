'use client';
import { useState } from 'react';

export default function CreateModal({ onClose, onDone }) {
  const [type, setType] = useState('post');
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [audience, setAudience] = useState('public');
  const [musicUrl, setMusicUrl] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [ai, setAi] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [uploading, setUploading] = useState('');

  async function upload(file, kind) {
    if (!file) return;
    setUploading(kind); setErr('');
    const form = new FormData();
    form.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    const data = await res.json();
    setUploading('');
    if (!res.ok) return setErr(data.error || 'Upload failed');
    if (kind === 'music') {
      setMusicUrl(data.url);
      setMusicTitle(file.name.replace(/\.[^.]+$/, ''));
    } else {
      setMediaUrl(data.url);
      if (file.type.startsWith('video')) setType('reel');
    }
  }

  async function assist() {
    setAiBusy(true);
    const res = await fetch('/api/ai/hashtags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ caption, location }) });
    const data = await res.json();
    setAiBusy(false); setAi(data.suggestions || []);
  }

  function autoAdd() {
    if (!ai?.length) return;
    const fresh = ai.filter(tag => !caption.includes(tag));
    setCaption(value => (value ? value.trimEnd() + ' ' : '') + fresh.join(' '));
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const res = await fetch('/api/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, mediaUrl, caption, location, audience, music: musicUrl ? { url: musicUrl, title: musicTitle || 'Original audio' } : null }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return setErr(data.error || 'Post failed');
    onDone && onDone(data.post);
  }

  const video = type === 'reel' || /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl) || mediaUrl.includes('gtv-videos');
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Create a post</h2>
        <p className="mut" style={{ fontSize: 13, margin: '3px 0 16px' }}>Share a thought, photo, video or your original music.</p>
        {err && <div className="err">{err}</div>}
        <form onSubmit={submit}>
          <div className="field"><label>Post type</label><div className="seg"><button type="button" className={type === 'post' ? 'on' : ''} onClick={() => setType('post')}>Post</button><button type="button" className={type === 'reel' ? 'on' : ''} onClick={() => setType('reel')}>Reel</button></div></div>
          <div className="field"><label>Who can see this?</label><select value={audience} onChange={e => setAudience(e.target.value)}><option value="public">Public</option><option value="friends">Friends</option><option value="onlyme">Only me</option></select></div>
          <div className="field"><label>Photo or video (optional)</label><input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)} placeholder="Paste a photo/video URL" /><div className="uploadline"><label className="filebtn">{uploading === 'media' ? 'Uploading...' : 'Upload photo/video'}<input type="file" hidden accept="image/*,video/*" onChange={e => upload(e.target.files?.[0], 'media')} disabled={Boolean(uploading)} /></label></div></div>
          {mediaUrl && <div className="field">{video ? <video src={mediaUrl} controls style={{ width: '100%', maxHeight: 220, borderRadius: 10, background: '#000' }} /> : <img src={mediaUrl} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 10 }} />}</div>}
          <div className="musicbox"><div><b>Music on this post</b><span>Upload your own audio or paste an audio URL.</span></div><input value={musicTitle} onChange={e => setMusicTitle(e.target.value)} placeholder="Song title" /><input value={musicUrl} onChange={e => setMusicUrl(e.target.value)} placeholder="Audio URL (MP3/M4A/WAV)" /><div className="uploadline"><label className="filebtn">{uploading === 'music' ? 'Uploading music...' : 'Upload original music'}<input type="file" hidden accept="audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/aac,audio/flac,audio/*" onChange={e => upload(e.target.files?.[0], 'music')} disabled={Boolean(uploading)} /></label><small>Only audio you own or can share.</small></div>{musicUrl && <audio controls src={musicUrl} style={{ width: '100%', marginTop: 8 }} />}</div>
          <div className="field"><label>Caption</label><textarea rows={3} value={caption} onChange={e => setCaption(e.target.value)} placeholder="What is on your mind?" /></div>
          <div className="field"><label>Location (optional)</label><input value={location} onChange={e => setLocation(e.target.value)} placeholder="Dhaka, Bangladesh" /></div>
          <div className="field"><button type="button" className="btn ghost sm" onClick={assist} disabled={aiBusy} style={{ width: '100%' }}>{aiBusy ? 'Finding ideas...' : 'AI hashtag assist'} <span className="badge beta">Beta</span></button>{ai && <div style={{ marginTop: 8 }}><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{ai.map(tag => <span key={tag} className="chip" onClick={() => setCaption(value => value + (value.endsWith(' ') || !value ? '' : ' ') + tag + ' ')}>{tag}</span>)}</div><button type="button" className="btn sm" style={{ marginTop: 8 }} onClick={autoAdd}>Add all</button></div>}</div>
          <div className="row"><button type="button" className="btn ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button><button className="btn" style={{ flex: 2 }} disabled={busy || Boolean(uploading) || (!mediaUrl && !caption.trim() && !musicUrl)}>{busy ? 'Publishing...' : 'Post to VYRO'}</button></div>
        </form>
      </div>
    </div>
  );
}

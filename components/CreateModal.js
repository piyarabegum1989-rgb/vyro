'use client';
import { useRef, useState } from 'react';
import Icon from './Icons';
import { uploadFromDevice } from '@/lib/client-upload';

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
  const [uploading, setUploading] = useState('');
  const [musicPicker, setMusicPicker] = useState(false);
  const [musicLoading, setMusicLoading] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [musicSearch, setMusicSearch] = useState('');
  const mediaInput = useRef(null);
  const musicInput = useRef(null);

  async function upload(file, kind) {
    if (!file) return;
    setUploading(kind); setErr('');
    try {
      const url = await uploadFromDevice(file);
      if (kind === 'music') {
        setMusicUrl(url);
        setMusicTitle(file.name.replace(/\.[^.]+$/, ''));
      } else {
        setMediaUrl(url);
        if (file.type.startsWith('video')) setType('reel');
      }
    } catch (error) { setErr(error?.message || 'Upload failed.'); }
    finally { setUploading(''); }
  }

  async function openMusicPicker() {
    setMusicPicker(true); setMusicLoading(true); setErr('');
    try {
      const res = await fetch('/api/music');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not open VIRO Music.');
      setTracks(data.tracks || []);
    } catch (error) { setErr(error?.message || 'Could not open VIRO Music.'); }
    finally { setMusicLoading(false); }
  }

  async function submit(e) {
    e.preventDefault();
    if (!mediaUrl && !caption.trim() && !musicUrl) return setErr('Add a photo, video, music, or write something first.');
    setBusy(true); setErr('');
    const res = await fetch('/api/posts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, mediaUrl, caption, location, audience, music: musicUrl ? { url: musicUrl, title: musicTitle || 'Original audio' } : null }) });
    const data = await res.json(); setBusy(false);
    if (!res.ok) return setErr(data.error || 'Could not publish.');
    onDone?.(data.post);
  }

  const video = type === 'reel' || /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl);
  const shownTracks = tracks.filter(track => `${track.title} ${track.author?.name || ''} ${track.author?.username || ''}`.toLowerCase().includes(musicSearch.toLowerCase()));

  return <div className="overlay" onClick={onClose}>
    <section className="modal" onClick={e => e.stopPropagation()}>
      <header className="composer-head"><button onClick={onClose} aria-label="Close"><Icon name="x" /></button><h2>Create post</h2><button type="button" className="next-publish" onClick={() => document.getElementById('viro-create-form')?.requestSubmit()} disabled={busy}>{busy ? '…' : 'Next'}</button></header>
      {err && <div className="err">{err}</div>}
      <form id="viro-create-form" onSubmit={submit}>
        <div className="seg composer-types">{[['post', 'Post'], ['reel', 'Reel'], ['story', 'Story']].map(([id, label]) => <button key={id} type="button" className={type === id ? 'on' : ''} onClick={() => setType(id)}>{label}</button>)}</div>
        {mediaUrl ? <div className="selected-media">{video ? <video src={mediaUrl} controls /> : <img src={mediaUrl} alt="Selected media" />}<button type="button" onClick={() => setMediaUrl('')} aria-label="Remove media"><Icon name="x" size={16} /></button></div> : <button type="button" className="media-placeholder" onClick={() => mediaInput.current?.click()}><Icon name="image" size={32} /><span>{uploading === 'media' ? 'Uploading…' : 'Choose from gallery'}</span></button>}
        <textarea id="viro-post-text" rows="3" value={caption} onChange={e => setCaption(e.target.value)} placeholder="What’s on your mind?" className="composer-caption" />
        <div className="create-tools">
          <button type="button" onClick={() => mediaInput.current?.click()}><Icon name="image" /><span>Gallery</span></button>
          <button type="button" onClick={() => mediaInput.current?.click()}><Icon name="camera" /><span>Camera</span></button>
          <button type="button" onClick={() => document.querySelector('#viro-post-text')?.focus()}><b>Aa</b><span>Text</span></button>
          <button type="button" onClick={() => document.querySelector('#viro-location')?.focus()}><Icon name="pin" /><span>Location</span></button>
          <button type="button" onClick={openMusic}><b>♫</b><span>Add music</span></button>
        </div>
        <input ref={mediaInput} type="file" hidden accept="image/*,video/*" onChange={e => upload(e.target.files?.[0], 'media')} />
        <input ref={musicInput} type="file" hidden accept="audio/*" onChange={e => upload(e.target.files?.[0], 'music')} />
        <div className="create-details"><div className="field"><label>Location</label><input id="viro-location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Add a location" /></div><div className="field"><label>Audience</label><select value={audience} onChange={e => setAudience(e.target.value)}><option value="public">Public</option><option value="friends">Friends</option><option value="onlyme">Only me</option></select></div></div>
        {musicUrl && <div className="musicbox"><div><b>{musicTitle || 'Original audio'}</b><span>Added from VIRO Music</span></div><audio controls src={musicUrl} /><button type="button" onClick={() => { setMusicUrl(''); setMusicTitle(''); }} className="remove-music">Remove music</button></div>}
        <button className="btn" style={{ width: '100%', marginTop: 3 }} disabled={busy || Boolean(uploading)}>{busy ? 'Publishing…' : type === 'reel' ? 'Share reel' : type === 'story' ? 'Share story' : 'Post'}</button>
      </form>

      {musicPicker && <div className="music-picker-overlay" onClick={() => setMusicPicker(false)}><section className="music-picker" onClick={e => e.stopPropagation()}><header><button onClick={() => setMusicPicker(false)}><Icon name="x" /></button><div><b>Add music</b><span>Choose a sound for this {type}.</span></div></header><div className="searchbar"><Icon name="search" size={17} /><input value={musicSearch} onChange={e => setMusicSearch(e.target.value)} placeholder="Search VIRO Music" /></div><button type="button" className="own-audio" onClick={() => { setMusicPicker(false); musicInput.current?.click(); }}><Icon name="mic" size={20} /><span><b>Upload your original sound</b><small>Add a track from your device to VIRO Music</small></span></button><div className="track-list">{musicLoading ? <p className="mut center">Loading sounds…</p> : shownTracks.length === 0 ? <p className="mut center">No public sounds yet. Upload your original sound first.</p> : shownTracks.map(track => <button className="track" type="button" key={track.id} onClick={() => { setMusicUrl(track.url); setMusicTitle(track.title); setMusicPicker(false); }}><span className="track-art">♫</span><span className="track-info"><b>{track.title}</b><small>{track.author?.name || track.author?.username || 'VIRO creator'} · Original sound</small></span><audio controls onClick={e => e.stopPropagation()} src={track.url} /></button>)}</div></section></div>}
    </section>
  </div>;
}

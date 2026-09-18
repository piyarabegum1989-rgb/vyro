'use client';
import { useEffect, useRef, useState } from 'react';
import Shell from '@/components/Shell';
import { Avatar, timeAgo } from '@/components/ui';

export default function Messages() {
  const [convos, setConvos] = useState(null);
  const [cur, setCur] = useState(null);
  const [thread, setThread] = useState(null);
  const [txt, setTxt] = useState('');
  const [newU, setNewU] = useState('');
  const [err, setErr] = useState('');
  const bottom = useRef(null);

  const loadConvos = () => fetch('/api/conversations').then(r => r.json()).then(d => setConvos(d.conversations || []));

  useEffect(() => { loadConvos(); }, []);
  useEffect(() => {
    if (!cur) return;
    const load = () => fetch(`/api/conversations/${cur}/messages`).then(r => r.json()).then(d => {
      if (d.messages) { setThread(d); setTimeout(() => bottom.current?.scrollIntoView({ behavior: 'smooth' }), 100); }
    });
    load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [cur]);

  async function send(e) {
    e.preventDefault();
    if (!txt.trim()) return;
    setErr('');
    const res = await fetch(`/api/conversations/${cur}/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: txt }) });
    const d = await res.json();
    if (!res.ok) return setErr(d.error || 'পাঠানো যায়নি');
    setTxt('');
    const t = await (await fetch(`/api/conversations/${cur}/messages`)).json();
    if (t.messages) setThread(t);
    loadConvos();
  }

  async function start(e) {
    e.preventDefault();
    if (!newU.trim()) return;
    setErr('');
    const res = await fetch('/api/conversations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: newU.trim() }) });
    const d = await res.json();
    if (!res.ok) return setErr(d.error || 'শুরু করা যায়নি');
    setNewU('');
    setCur(d.conversation.id);
    loadConvos();
  }

  return (
    <Shell>
      <h2 style={{ marginBottom: 12 }}>💬 Messages</h2>
      {err && <div className="err">{err}</div>}
      <form onSubmit={start} className="row" style={{ marginBottom: 12 }}>
        <input value={newU} onChange={e => setNewU(e.target.value)} placeholder="username দিয়ে নতুন চ্যাট... (e.g. arif)" />
        <button className="btn">＋</button>
      </form>
      {convos === null ? <div className="spin">লোড হচ্ছে...</div> : (
        <div className="msgwrap">
          <div className="clist">
            {convos.length === 0 && <div className="mut" style={{ padding: 16 }}>কোনো চ্যাট নেই</div>}
            {convos.map(c => (
              <div key={c.id} className={'citem' + (cur === c.id ? ' on' : '')} onClick={() => setCur(c.id)}>
                <Avatar user={c.peer} size={40} />
                <div style={{ minWidth: 0 }}>
                  <b style={{ fontSize: 14 }}>@{c.peer?.username}</b>
                  <div className="mut" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last?.text || '...'}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="thread">
            {!cur ? <div className="center mut" style={{ padding: 40 }}>একটা চ্যাট সিলেক্ট করো 💬</div> :
              !thread ? <div className="spin">লোড হচ্ছে...</div> : <>
                <div className="citem" style={{ cursor: 'default' }}>
                  <Avatar user={thread.peer} size={36} />
                  <b>@{thread.peer?.username}</b>
                </div>
                <div className="tmsgs">
                  {thread.messages.map(m => (
                    <div key={m.id} className={'bubble ' + (m.senderId === thread.peer?.id ? 'them' : 'me')} title={timeAgo(m.createdAt)}>
                      {m.text}
                    </div>
                  ))}
                  <div ref={bottom} />
                </div>
                {thread.blocked
                  ? <div className="center mut" style={{ padding: 14, fontSize: 13 }}>🚫 Blocked — মেসেজ পাঠানো যাবে না</div>
                  : <form onSubmit={send} className="tsend">
                      <input value={txt} onChange={e => setTxt(e.target.value)} placeholder="মেসেজ লেখো..." />
                      <button className="btn">➤</button>
                    </form>}
              </>}
          </div>
        </div>
      )}
    </Shell>
  );
}

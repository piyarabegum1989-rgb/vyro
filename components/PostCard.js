'use client';
import { useState } from 'react';
import Link from 'next/link';
import Icon from './Icons';
import { Avatar, timeAgo, tagify } from './ui';

function isVideo(p){return p.type==='reel'||/\.(mp4|webm|mov)(\?|$)/i.test(p.mediaUrl||'')||(p.mediaUrl||'').includes('gtv-videos');}
export default function PostCard({post,me,onDeleted}){
 const [p,setP]=useState(post);const [showC,setShowC]=useState(false);const [comments,setComments]=useState(null);const [txt,setTxt]=useState('');const [busy,setBusy]=useState(false);
 async function toggleLike(){const r=await fetch(`/api/posts/${p.id}/like`,{method:p.liked?'DELETE':'POST'});if(r.ok){const d=await r.json();setP({...p,liked:d.liked,likes:d.count});}}
 async function loadComments(){if(showC){setShowC(false);return;}setShowC(true);if(comments)return;const r=await fetch(`/api/posts/${p.id}/comments`);if(r.ok)setComments((await r.json()).comments);}
 async function send(e){e.preventDefault();if(!txt.trim())return;setBusy(true);const r=await fetch(`/api/posts/${p.id}/comments`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:txt})});const d=await r.json();setBusy(false);if(!r.ok)return;setComments([...(comments||[]),d.comment]);setTxt('');setP({...p,comments:p.comments+1});}
 async function del(){if(!confirm('Delete this post?'))return;const r=await fetch(`/api/posts/${p.id}`,{method:'DELETE'});if(r.ok)onDeleted?.(p.id);}
 const video=isVideo(p);
 return <article className="post"><header className="ph"><Link href={`/u/${p.author?.username}`}><Avatar user={p.author} size={36}/></Link><div><Link href={`/u/${p.author?.username}`} className="nm">{p.author?.username}</Link>{p.location&&<div className="loc">{p.location}</div>}</div><span className="time">{timeAgo(p.createdAt)}</span>{me?.id===p.author?.id&&<button className="delete-post" onClick={del} aria-label="Delete"><Icon name="dots" size={19}/></button>}</header>
 {p.mediaUrl&&(video?<video className="media" src={p.mediaUrl} controls playsInline preload="metadata"/>:<img className="media" src={p.mediaUrl} alt={p.caption||'VIRO post'} loading="lazy"/>)}
 {p.music?.url&&<div className="musicpost"><div className="musicnote">♫</div><div><b>{p.music.title||'Original audio'}</b><span>Original sound · VIRO Music</span></div><audio controls preload="metadata" src={p.music.url}/></div>}
 <div className="pa"><button onClick={toggleLike} className={p.liked?'liked':''} aria-label="Like"><Icon name="heart" size={22} stroke={p.liked?2.5:1.8}/></button><button onClick={loadComments} aria-label="Comments"><Icon name="comment" size={22}/></button><button aria-label="Share"><Icon name="send" size={21}/></button><button className="save" aria-label="Save"><Icon name="bookmark" size={21}/></button></div>
 <div className="pb"><div className="likes">{p.likes||0} likes</div>{p.caption&&<div><b>{p.author?.username}</b>{tagify(p.caption)}</div>}{p.comments>0&&<button onClick={loadComments} style={{border:0,background:'none',color:'#8d9bb1',padding:'7px 0 0',fontSize:12}}>View all {p.comments} comments</button>}
 {showC&&<div className="comment-open">{comments===null?<span className="mut">Loading comments…</span>:comments.map(c=><div className="cmt" key={c.id}><Avatar user={c.author} size={25}/><div><Link href={`/u/${c.author?.username}`}><b>{c.author?.username}</b></Link> {c.text}</div></div>)}<form className="row" onSubmit={send}><input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Add a comment…"/><button className="btn sm" disabled={busy}><Icon name="send" size={15}/></button></form></div>}</div></article>;
}

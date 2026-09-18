'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import PostCard from '@/components/PostCard';
import { Avatar } from '@/components/ui';

export default function Feed() {
  const [posts,setPosts]=useState(null); const [me,setMe]=useState(null); const [people,setPeople]=useState([]); const [create,setCreate]=useState(false);
  useEffect(()=>{ fetch('/api/auth/me').then(r=>r.json()).then(d=>setMe(d.user)); fetch('/api/posts').then(r=>r.json()).then(d=>setPosts(d.posts||[])); fetch('/api/explore').then(r=>r.json()).then(d=>setPeople(d.users||[])); },[]);
  return <Shell>
    <section className="stories" aria-label="Stories">
      {me&&<button className="story add"><span className="story-ring"><Avatar user={me} size={50}/></span><span>Your story</span></button>}
      {people.slice(0,7).map(u=><button className="story" key={u.id}><span className="story-ring"><Avatar user={u} size={50}/></span><span>{u.name?.split(' ')[0]||u.username}</span></button>)}
    </section>
    <div className="feed-create"><Avatar user={me} size={33}/><button onClick={()=>setCreate(true)}>Share something with VIRO…</button></div>
    {posts===null?<div className="app-loading" style={{minHeight:220,background:'transparent'}}><span>Loading your feed</span></div>:posts.length===0?<div className="card center mut">Your feed is ready for the first post.</div>:posts.map(p=><PostCard key={p.id} post={p} me={me} onDeleted={id=>setPosts(posts.filter(x=>x.id!==id))}/>)}
    {create&&<div className="overlay" onClick={()=>setCreate(false)}><div className="modal" onClick={e=>e.stopPropagation()}><h2>Quick post</h2><p className="mut center">Use the plus button below to share a photo, reel, music or story.</p><button className="btn" style={{width:'100%',marginTop:12}} onClick={()=>setCreate(false)}>Got it</button></div></div>}
  </Shell>;
}

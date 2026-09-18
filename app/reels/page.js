'use client';
import { useEffect,useState } from 'react';
import Shell from '@/components/Shell';
import PostCard from '@/components/PostCard';

export default function Reels(){const [posts,setPosts]=useState(null);const [me,setMe]=useState(null);useEffect(()=>{fetch('/api/auth/me').then(r=>r.json()).then(d=>setMe(d.user));fetch('/api/posts?type=reel').then(r=>r.json()).then(d=>setPosts(d.posts||[]));},[]);return <Shell><h1 className="page-title">Reels</h1>{posts===null?<div className="app-loading" style={{minHeight:260,background:'transparent'}}><span>Loading reels</span></div>:posts.length===0?<div className="card center mut">No reels yet. Be the first to share one.</div>:posts.map(p=><PostCard key={p.id} post={p} me={me} onDeleted={id=>setPosts(posts.filter(x=>x.id!==id))}/>)}</Shell>}

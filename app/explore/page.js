'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Shell from '@/components/Shell';
import Icon from '@/components/Icons';
import { Avatar } from '@/components/ui';

const filters=['For you','Trending','Photography','Art'];
function ExploreInner(){const sp=useSearchParams();const [q,setQ]=useState(sp.get('q')||'');const [data,setData]=useState(null);const [filter,setFilter]=useState('For you');async function load(v=''){const r=await fetch('/api/explore?q='+encodeURIComponent(v));setData(await r.json());}useEffect(()=>{load(sp.get('q')||'');},[sp]);return <Shell><h1 className="page-title">Explore</h1><form onSubmit={e=>{e.preventDefault();load(q)}} className="searchbar"><Icon name="search" size={18}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search people, posts, tags…"/><button type="submit" aria-label="Search" style={{display:'none'}}>Search</button></form><div className="explore-chips">{filters.map(f=><button className={'chip '+(filter===f?'on':'')} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div>{!data?<div className="app-loading" style={{minHeight:250,background:'transparent'}}><span>Finding inspiration</span></div>:<>{data.users?.length>0&&<section className="explore-people"><h3>People you may know</h3><div className="people-row">{data.users.slice(0,5).map(u=><Link href={`/u/${u.username}`} key={u.id}><Avatar user={u} size={34}/><b>{u.name||u.username}</b><span className="mut">@{u.username}</span></Link>)}</div></section>}<h2 className="explore-heading">{q?`Results for “${q}”`:filter==='For you'?'For you':'Trending now'}</h2><div className="masonry">{data.posts.map(p=><Link href={`/u/${p.author?.username}`} className="cell" key={p.id}>{p.type==='reel'?<video src={p.mediaUrl} preload="metadata"/>:<img src={p.mediaUrl} alt={p.caption||'VIRO post'} loading="lazy"/>}{p.type==='reel'&&<span className="rtype"><Icon name="play" size={15}/></span>}</Link>)}</div>{data.posts.length===0&&<div className="card center mut">Nothing found yet.</div>}</>}</Shell>}

export default function Explore(){return <Suspense fallback={<div className="app-loading"><span>Loading VIRO</span></div>}><ExploreInner/></Suspense>}

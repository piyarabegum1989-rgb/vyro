'use client';
import { useEffect, useState } from 'react';
import Shell from '@/components/Shell';
import PostCard from '@/components/PostCard';

export default function Reels() {
  const [posts, setPosts] = useState(null);
  const [me, setMe] = useState(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => setMe(d.user));
    fetch('/api/posts?type=reel').then(r => r.json()).then(d => setPosts(d.posts || []));
  }, []);

  return (
    <Shell>
      <h2 style={{ marginBottom: 14 }}>🎬 Reels</h2>
      {posts === null ? <div className="spin">লোড হচ্ছে...</div> :
        posts.length === 0 ? <div className="card center">কোনো reel নেই — প্রথম reel বানাও! 🎬</div> :
          posts.map(p => <PostCard key={p.id} post={p} me={me} onDeleted={id => setPosts(posts.filter(x => x.id !== id))} />)}
    </Shell>
  );
}

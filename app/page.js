'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    const go = async () => {
      try {
        const res = await fetch('/api/auth/me');
        router.replace(res.ok ? '/feed' : '/login');
      } catch { router.replace('/login'); }
    };
    const timer = setTimeout(go, 1250);
    return () => clearTimeout(timer);
  }, [router]);
  return <main className="splash" aria-label="VIRO"><div className="splash-inner"><img className="splash-logo" src="/viro-v-mark.png" alt="VIRO" /><div className="splash-word">VIRO</div><div className="splash-tagline">Connect <span>·</span> Share <span>·</span> Be Real</div></div></main>;
}

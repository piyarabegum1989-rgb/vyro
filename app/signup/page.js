'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [form, setForm] = useState({ name:'',username:'',email:'',password:'' });
  const [err,setErr] = useState(''); const [busy,setBusy] = useState(false);
  const set = (key,value) => setForm(old => ({...old,[key]:value}));
  useEffect(() => { fetch('/api/auth/me').then(r => { if (r.ok) router.replace('/feed'); }); }, [router]);
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const res = await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});
    const d=await res.json(); setBusy(false); if(!res.ok) return setErr(d.error || 'Could not create account.');
    router.replace('/feed'); router.refresh();
  }
  return <main className="authwrap"><div className="authbox"><div className="authbrand"><img src="/viro-v-mark.png" alt="VIRO" /><b>VIRO</b><p>Connect &nbsp;·&nbsp; Share &nbsp;·&nbsp; Be Real</p></div><section className="authcard"><h1>Create your account</h1><p>Your VIRO profile starts here.</p>{err&&<div className="err">{err}</div>}<form onSubmit={go}><div className="field"><label>Full name</label><input value={form.name} onChange={e=>set('name',e.target.value)} autoComplete="name" placeholder="Your name" required /></div><div className="field"><label>Username</label><input value={form.username} onChange={e=>set('username',e.target.value)} autoComplete="username" placeholder="username" required /></div><div className="field"><label>Email address</label><input value={form.email} onChange={e=>set('email',e.target.value)} autoComplete="email" placeholder="you@gmail.com" required /></div><div className="field"><label>Password</label><input type="password" value={form.password} onChange={e=>set('password',e.target.value)} autoComplete="new-password" placeholder="At least 6 characters" minLength="6" required /></div><button className="btn" style={{width:'100%'}} disabled={busy}>{busy?'Creating account…':'Create account'}</button></form><p className="center mut" style={{margin:'18px 0 0',fontSize:13}}>Already have an account? <Link href="/login">Log in</Link></p></section></div></main>;
}

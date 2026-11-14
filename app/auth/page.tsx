import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
const Embedded=lazy(()=>import('./embedded'));
class Boundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true};}render(){return this.state.failed?<p role="alert">Authentication could not load. Reload to try again, or return to the playground.</p>:this.props.children;}}
export function AuthPage({mode}:{mode:'sign-in'|'sign-up'}){
 const [mounted,setMounted]=useState(false);useEffect(()=>setMounted(true),[]);
 const key=import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();const configured=Boolean(key&&/^pk_(test|live)_/.test(key));
 return <section className="auth-page" data-pagefind-ignore><header><p className="technical-label">Lumen account</p><h1>{mode==='sign-in'?'Welcome back.':'Start with Lumen.'}</h1><p>Sign in to prepare for the connected playground. Video processing is not available in this preview.</p></header><div className="auth-form">
 {!configured?<p>Authentication is not configured. Public pages remain available.</p>:!mounted?<p>Authentication loads in your browser.</p>:<Boundary><Suspense fallback={<p role="status">Loading authentication…</p>}><Embedded mode={mode}/></Suspense></Boundary>}
 </div><p className="auth-note">Your video stays on your device. Select it again when you return.</p><Link className="text-link" to="/#playground">Back to the playground</Link></section>;
}

import { Component, lazy, Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
const ClientAuth = lazy(() => import('../auth/client'));
export function meta() { return [{ title: 'Authentication compatibility POC | Lumen' }, { name: 'robots', content: 'noindex' }]; }
class AuthBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
 state = {failed:false};
 static getDerivedStateFromError() { return {failed:true}; }
 render() { return this.state.failed ? <p role="alert">Authentication could not load. Check configuration and reload this page.</p> : this.props.children; }
}
export default function AuthPoc() {
 const [mounted,setMounted]=useState(false);
 useEffect(()=>setMounted(true),[]);
 const key=import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
 const configured=Boolean(key && /^pk_(test|live)_/.test(key));
 return <section className="home-content" data-pagefind-ignore>
  <h1>Authentication compatibility POC</h1>
  <p>This isolated test uses Clerk for authentication. It does not connect to the Lumen API.</p>
  {!configured ? <p>Authentication is not configured. Public pages remain available.</p> : !mounted ? <p>Authentication loads in your browser.</p> :
   <AuthBoundary><Suspense fallback={<p role="status">Loading authentication…</p>}><ClientAuth/></Suspense></AuthBoundary>}
  <p><Link to="/docs/" className="text-link">Return to documentation</Link></p>
 </section>;
}

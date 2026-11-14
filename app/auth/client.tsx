import { useAuth, useClerk } from '@clerk/react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { basePath } from '../../site.config';
const returnPath = `${basePath}auth-poc/`;
function SessionCheck() {
 const {isLoaded,isSignedIn,getToken,signOut}=useAuth();
 const clerk=useClerk();
 const [status,setStatus]=useState('');
 const [busy,setBusy]=useState(false);
 async function checkToken() {
  setBusy(true);
  try { const token=await getToken();setStatus(token ? 'Session token available. It was not displayed, stored or sent.' : 'No active session token.'); }
  catch {setStatus('Could not retrieve a session token. Try signing in again.');}
  finally {setBusy(false);}
 }
 if(!isLoaded)return <p role="status">Loading authentication. If this persists, check the Clerk configuration and your connection.</p>;
 return <div>
  <p>{isSignedIn ? 'Signed in to Clerk.' : 'Signed out.'}</p>
  {isSignedIn ? <><Button onClick={checkToken} disabled={busy}>Check session token</Button>{' '}<Button onClick={()=>{setStatus('');void signOut({redirectUrl:returnPath}).catch(()=>setStatus('Sign out failed. Please retry.'));}}>Sign out</Button></> :
   <Button variant="primary" onClick={()=>{void clerk.redirectToSignIn({signInForceRedirectUrl:returnPath,signUpForceRedirectUrl:returnPath}).catch(()=>setStatus('Sign in could not start. Check configuration and retry.'));}}>Sign in or create account</Button>}
  <p role="status">{status}</p>
 </div>;
}
export default function ClientAuth() { return <SessionCheck/>; }

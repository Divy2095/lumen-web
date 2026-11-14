import { useAuth, useClerk } from '@clerk/react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { basePath } from '../../site.config';
const returnPath=`${basePath}#playground`;
function Actions(){
 const {isLoaded,isSignedIn}=useAuth();const clerk=useClerk();const [error,setError]=useState('');
 if(!isLoaded)return <p role="status">Checking sign-in status. If this persists, check your connection and try again.</p>;
 if(isSignedIn)return <p role="status">Your video is ready. Processing will be available when the playground is connected to Lumen. Nothing has been uploaded.</p>;
 async function authenticate(signUp:boolean){try{if(signUp)await clerk.redirectToSignUp({signUpForceRedirectUrl:returnPath,signInForceRedirectUrl:returnPath});else await clerk.redirectToSignIn({signUpForceRedirectUrl:returnPath,signInForceRedirectUrl:returnPath});}catch{setError('Authentication could not start. Please try again.');}}
 return <><p>Sign in or create an account to prepare for the connected playground. Processing is not available in this preview.</p><p>You will need to select your file again after authentication. Your video stays on this device.</p><div className="landing-actions"><Button variant="primary" onClick={()=>void authenticate(true)}>Create free account</Button><Button onClick={()=>void authenticate(false)}>Sign in</Button></div><p role="alert">{error}</p></>;
}
export default function PlaygroundAuth(){return <Actions/>;}

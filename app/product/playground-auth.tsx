import { useAuth, useClerk } from '@clerk/react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { basePath } from '../../site.config';
import { PlaygroundProcessing } from './playground-processing';
const returnPath=`${basePath}#playground`;
function Actions({file}:{file:File}){
 const {isLoaded,isSignedIn,getToken,userId,sessionId}=useAuth();const clerk=useClerk();const [error,setError]=useState('');
 if(!isLoaded)return <p role="status">Checking sign-in status. If this persists, check your connection and try again.</p>;
 if(isSignedIn)return <PlaygroundProcessing key={`${userId}:${sessionId}`} file={file} getToken={getToken}/>;
 async function authenticate(signUp:boolean){try{if(signUp)await clerk.redirectToSignUp({signUpForceRedirectUrl:returnPath,signInForceRedirectUrl:returnPath});else await clerk.redirectToSignIn({signUpForceRedirectUrl:returnPath,signInForceRedirectUrl:returnPath});}catch{setError('Authentication could not start. Please try again.');}}
 return <><p>Sign in or create an account to send this video to the configured Lumen API for processing.</p><p>You will need to select your file again after authentication. Nothing is uploaded while you are signed out.</p><div className="landing-actions"><Button variant="primary" onClick={()=>void authenticate(true)}>Create free account</Button><Button onClick={()=>void authenticate(false)}>Sign in</Button></div><p role="alert">{error}</p></>;
}
export default function PlaygroundAuth({file}:{file:File}){return <Actions file={file}/>;}

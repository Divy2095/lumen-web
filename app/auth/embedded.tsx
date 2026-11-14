import { SignIn, SignUp, useAuth } from '@clerk/react';
import { basePath } from '../../site.config';
import { Link } from 'react-router';
function Form({mode}:{mode:'sign-in'|'sign-up'}){
 const {isLoaded,isSignedIn}=useAuth();
 if(!isLoaded)return <p role="status">Loading authentication. Check your connection if this persists.</p>;
 if(isSignedIn)return <><p>You are signed in.</p><Link className="button button-primary" to="/#playground">Return to the playground</Link></>;
 return mode==='sign-in'?<SignIn routing="hash" signUpUrl={`${basePath}sign-up/`} forceRedirectUrl={`${basePath}#playground`}/>:<SignUp routing="hash" signInUrl={`${basePath}sign-in/`} forceRedirectUrl={`${basePath}#playground`}/>;
}
export default function Embedded({mode}:{mode:'sign-in'|'sign-up'}){return <Form mode={mode}/>;}

import { UserButton, useAuth } from '@clerk/react';
import { Link } from 'react-router';
import { clerkConfigured } from './provider';
import { useClerkAppearance } from './appearance';
function ConfiguredAccount(){
 const {isLoaded,isSignedIn}=useAuth();const appearance=useClerkAppearance();
 if(!isLoaded)return <span className="account-loading" role="status"><span className="sr-only">Loading account</span></span>;
 return <div className="account-control">{isSignedIn?<UserButton userProfileMode="modal" appearance={{elements:{userButtonTrigger:{minWidth:'44px',minHeight:'44px'},avatarBox:{width:'30px',height:'30px'}}}} userProfileProps={{appearance}}/>:
 <Link className="button button-ghost account-sign-in" to="/sign-in/">Sign in</Link>}</div>;
}
export function AccountControl(){return clerkConfigured?<ConfiguredAccount/>:null;}

import { ClerkProvider } from '@clerk/react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router';
import { basePath } from '../../site.config';
import { useClerkAppearance } from './appearance';
export const clerkConfigured=Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim().match(/^pk_(test|live)_/));
export function AuthProvider({children}:{children:ReactNode}) {
 const {pathname}=useLocation();const appearance=useClerkAppearance();
 const key=import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.trim();
 if(!clerkConfigured)return <>{children}</>;
 const returnPath=pathname.includes('/auth-poc')?`${basePath}auth-poc/`:`${basePath}#playground`;
 return <ClerkProvider publishableKey={key!} appearance={appearance} afterSignOutUrl={basePath} signInForceRedirectUrl={returnPath} signUpForceRedirectUrl={returnPath}>{children}</ClerkProvider>;
}

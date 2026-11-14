import { AuthPage } from '../auth/page';
export function meta(){return [{title:'Sign in | Lumen'},{name:'robots',content:'noindex'}];}
export default function SignInPage(){return <AuthPage mode="sign-in"/>;}

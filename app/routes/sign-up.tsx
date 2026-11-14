import { AuthPage } from '../auth/page';
export function meta(){return [{title:'Create account | Lumen'},{name:'robots',content:'noindex'}];}
export default function SignUpPage(){return <AuthPage mode="sign-up"/>;}

'use client';

import { HandleSSOCallback } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { RETURN_KEY } from '@/components/owner/auth/LoginForm';
import { returnPath } from '@/lib/auth-errors';

// Google / GitHub come back here. A known account lands where it was
// going; an unknown one would become a sign-up, which an invite-only
// instance refuses, so it goes back to /login with that said.
export default function SsoCallbackPage() {
    const router = useRouter();
    return (
        <>
            <HandleSSOCallback
                navigateToApp={({ decorateUrl }) => {
                    const back = returnPath(sessionStorage.getItem(RETURN_KEY), window.location.origin);
                    sessionStorage.removeItem(RETURN_KEY);
                    const url = decorateUrl(back);
                    if (url.startsWith('http')) window.location.href = url;
                    else router.push(url);
                }}
                navigateToSignIn={() => router.replace('/login?e=failed')}
                navigateToSignUp={() => router.replace('/login?e=not-invited')}
            />
            {/* A transferred sign-up may need a captcha; Clerk mounts it here. */}
            <div id="clerk-captcha" />
        </>
    );
}

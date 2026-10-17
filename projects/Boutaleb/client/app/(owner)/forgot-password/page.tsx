import type { Metadata } from 'next';
import { AuthFrame } from '@/components/owner/auth/AuthFrame';
import { ForgotForm } from '@/components/owner/auth/ForgotForm';

export const metadata: Metadata = { title: 'Forgot password' };

export default function Page() {
    return (
        <AuthFrame>
            <ForgotForm />
        </AuthFrame>
    );
}

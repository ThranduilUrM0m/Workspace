import type { Metadata } from 'next';
import { AuthFrame } from '@/components/owner/auth/AuthFrame';
import { ResetForm } from '@/components/owner/auth/ResetForm';

export const metadata: Metadata = { title: 'New password' };

export default function Page() {
    return (
        <AuthFrame>
            <ResetForm />
        </AuthFrame>
    );
}

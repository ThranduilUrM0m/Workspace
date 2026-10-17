import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { AuthFrame } from '@/components/owner/auth/AuthFrame';
import { LoginForm } from '@/components/owner/auth/LoginForm';

export const metadata: Metadata = { title: 'Login' };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function LoginPage({ searchParams }: Props) {
    // Already signed in: straight to the dashboard.
    const { userId } = await auth();
    if (userId) redirect('/app');
    const q = await searchParams;
    return (
        <AuthFrame>
            <LoginForm redirectUrl={one(q.redirect_url)} notice={one(q.e)} />
        </AuthFrame>
    );
}

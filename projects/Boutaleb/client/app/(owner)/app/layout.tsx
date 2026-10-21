import type { ReactNode } from 'react';
import { currentUser } from '@clerk/nextjs/server';
import { QueryProvider } from '@/components/owner/data/QueryProvider';
import { Shell } from '@/components/owner/shell/Shell';
import { requireOwnerSession } from '@/lib/owner-auth';
import '@/styles/shell.css';

// Everything under /app: signed in, inside the shell. Each page still
// calls requireOwnerSession itself; a layout does not re-run on every
// navigation, so it is not the gate, only the frame.
export default async function AppLayout({ children }: { children: ReactNode }) {
    await requireOwnerSession();
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress ?? '';
    const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || email.split('@')[0] || 'there';
    return (
        <QueryProvider>
            <Shell user={{ name, email }}>{children}</Shell>
        </QueryProvider>
    );
}

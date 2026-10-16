import type { Metadata } from 'next';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'Dashboard' };

// Stand-in until T6.5 (shell) and T6.6 (Dashboard) replace it.
export default async function DashboardPage() {
    const { userId } = await requireOwnerSession();
    return (
        <main>
            <h1>Dashboard</h1>
            <p>Signed in as {userId}.</p>
        </main>
    );
}

import type { Metadata } from 'next';
import { AppPage } from '@/components/owner/shell/AppPage';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'Dashboard' };

// Stand-in until T6.6 draws the Dashboard (dashboard-v4.html).
export default async function DashboardPage() {
    await requireOwnerSession();
    const today = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Africa/Casablanca' }).format(new Date());
    return (
        <AppPage title="Dashboard" kicker={today}>
            <p>The dashboard arrives with T6.6.</p>
        </AppPage>
    );
}

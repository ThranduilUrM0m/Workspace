import type { Metadata } from 'next';
import { currentUser } from '@clerk/nextjs/server';
import { Dashboard } from '@/components/owner/dashboard/Dashboard';
import { ReviewBar } from '@/components/owner/dashboard/ReviewBar';
import { AppPage } from '@/components/owner/shell/AppPage';
import type { Review } from '@/lib/dashboard/queries';
import { requireOwnerSession } from '@/lib/owner-auth';
import '@/styles/dashboard.css';

export const metadata: Metadata = { title: 'Dashboard' };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const REVIEWS: Review[] = ['ready', 'empty', 'loading', 'error'];

/** "Good morning" by the studio's clock, not the server's. */
function greeting(): string {
    const h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hourCycle: 'h23', timeZone: 'Africa/Casablanca' }).format(new Date()));
    return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default async function DashboardPage({ searchParams }: Props) {
    await requireOwnerSession();
    const user = await currentUser();
    const first = user?.firstName || user?.primaryEmailAddress?.emailAddress.split('@')[0] || '';
    const q = await searchParams;
    const state = REVIEWS.find((r) => r === q.state) ?? 'ready';
    const kpis = q.kpis === 'proposed' ? 'proposed' : 'current';
    return (
        <AppPage title={first ? `${greeting()}, ${first}` : greeting()} kicker="Here’s your studio at a glance">
            <Dashboard key={`${state}-${kpis}`} review={state} kpiSet={kpis} />
            <ReviewBar state={state} kpis={kpis} />
        </AppPage>
    );
}

import type { Metadata } from 'next';
import { DealsList } from '@/components/owner/deals/DealsList';
import { requireOwnerSession } from '@/lib/owner-auth';
import '@/styles/list.css';
import '@/styles/deals.css';

export const metadata: Metadata = { title: 'Deals' };

// The whole funnel: the way back out of a door ("Show the whole funnel").
export default async function DealsPage() {
    await requireOwnerSession();
    return <DealsList />;
}

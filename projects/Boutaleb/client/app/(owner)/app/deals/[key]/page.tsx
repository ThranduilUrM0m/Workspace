import type { Metadata } from 'next';
import { DealRecord } from '@/components/owner/deals/DealRecord';
import { DealsList } from '@/components/owner/deals/DealsList';
import { DOORS, isDoor } from '@/lib/deals/derive';
import { dealTabFrom } from '@/lib/deals/tabs';
import { requireOwnerSession } from '@/lib/owner-auth';
import '@/styles/list.css';
import '@/styles/record.css';
import '@/styles/deals.css';
import '@/styles/deal.css';

type Props = {
    params: Promise<{ key: string }>;
    searchParams: Promise<{ tab?: string | string[] }>;
};

// One segment, two meanings: the nav's three doors (leads, proposals,
// contracts) are the one list narrowed to a stage; anything else is a deal
// id. A deal id is 24 hex characters, so the two can never collide; "new"
// is its own static segment and wins over both.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { key } = await params;
    return { title: isDoor(key) ? DOORS[key].title : 'Deal' };
}

export default async function DealKeyPage({ params, searchParams }: Props) {
    await requireOwnerSession();
    const [{ key }, { tab }] = await Promise.all([params, searchParams]);
    if (isDoor(key)) return <DealsList door={key} />;
    return <DealRecord id={key} tab={dealTabFrom(Array.isArray(tab) ? tab[0] : tab)} />;
}

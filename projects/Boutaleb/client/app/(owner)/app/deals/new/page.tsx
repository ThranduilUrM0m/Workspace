import type { Metadata } from 'next';
import '@repo/ui/form.css';
import '@/styles/record.css';
import '@/styles/project-new.css';
import { DealNew } from '@/components/owner/deals/DealNew';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'Log an enquiry' };

// Log an enquiry: the manual path into Deals (a call, a referral). A public
// enquiry makes its own deal; this is for everything else.
export default async function NewDealPage() {
    await requireOwnerSession();
    return <DealNew />;
}

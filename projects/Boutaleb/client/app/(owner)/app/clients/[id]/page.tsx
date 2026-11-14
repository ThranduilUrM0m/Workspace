import type { Metadata } from 'next';
import { ClientRecord } from '@/components/owner/clients/ClientRecord';
import { clientTabFrom } from '@/lib/clients/tabs';
import { requireOwnerSession } from '@/lib/owner-auth';
import '@repo/ui/form.css';
import '@/styles/list.css';
import '@/styles/record.css';
import '@/styles/client.css';

export const metadata: Metadata = { title: 'Client' };

type Props = {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string | string[] }>;
};

export default async function ClientPage({ params, searchParams }: Props) {
    await requireOwnerSession();
    const [{ id }, { tab }] = await Promise.all([params, searchParams]);
    return <ClientRecord id={id} tab={clientTabFrom(Array.isArray(tab) ? tab[0] : tab)} />;
}

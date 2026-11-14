import type { Metadata } from 'next';
import { ClientsList } from '@/components/owner/clients/ClientsList';
import { requireOwnerSession } from '@/lib/owner-auth';
import '@/styles/list.css';
import '@/styles/clients.css';

export const metadata: Metadata = { title: 'Clients' };

export default async function ClientsPage() {
    await requireOwnerSession();
    return <ClientsList />;
}

import type { Metadata } from 'next';
import '@repo/ui/form.css';
import '@/styles/record.css';
import '@/styles/project-new.css';
import '@/styles/client-new.css';
import { ClientEdit } from '@/components/owner/clients/ClientNew';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'Edit client' };

// Edit client (added, no wireframe): New client's form over an existing
// record. Reached from "Edit details" under the record's Contact card.
type Props = { params: Promise<{ id: string }> };

export default async function EditClientPage({ params }: Props) {
    await requireOwnerSession();
    const { id } = await params;
    return <ClientEdit id={id} />;
}

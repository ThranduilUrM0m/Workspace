import type { Metadata } from 'next';
import '@repo/ui/form.css';
import '@/styles/record.css';
import '@/styles/project-new.css';
import '@/styles/client-new.css';
import { ClientNew } from '@/components/owner/clients/ClientNew';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'New client' };

// The longer door into Clients: someone met, put on the books. New project
// and Log an enquiry create one inline with the same required fields.
export default async function NewClientPage() {
    await requireOwnerSession();
    return <ClientNew />;
}

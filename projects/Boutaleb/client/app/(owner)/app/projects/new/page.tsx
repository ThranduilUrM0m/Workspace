import type { Metadata } from 'next';
import { AppPage } from '@/components/owner/shell/AppPage';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'New project' };

// Holds the address until T7.6 builds the form. Without it, "new" would be
// read as a project id and answer "This project does not exist".
export default async function NewProjectPage() {
    await requireOwnerSession();
    return (
        <AppPage title="New project" kicker="Not built yet">
            <p>This screen comes with a later build ticket.</p>
        </AppPage>
    );
}

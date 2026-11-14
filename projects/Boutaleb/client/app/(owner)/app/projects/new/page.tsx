import type { Metadata } from 'next';
import '@repo/ui/form.css';
import '@/styles/record.css';
import '@/styles/project-new.css';
import { ProjectNew } from '@/components/owner/projects/ProjectNew';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'New project' };

// The one place a project is created (T7.6). A static segment, so "new" is
// never read as a project id.
type Props = { searchParams: Promise<{ client?: string | string[] }> };

export default async function NewProjectPage({ searchParams }: Props) {
    await requireOwnerSession();
    const { client } = await searchParams;
    const id = Array.isArray(client) ? client[0] : client;
    // ?client=<id> from a client's "Start a project": only a real id is passed on.
    return <ProjectNew clientId={id && /^[a-f0-9]{24}$/.test(id) ? id : undefined} />;
}

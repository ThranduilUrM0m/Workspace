import type { Metadata } from 'next';
import '@repo/ui/form.css';
import '@/styles/record.css';
import '@/styles/project-new.css';
import { ProjectNew } from '@/components/owner/projects/ProjectNew';
import { requireOwnerSession } from '@/lib/owner-auth';

export const metadata: Metadata = { title: 'New project' };

// The one place a project is created (T7.6). A static segment, so "new" is
// never read as a project id.
export default async function NewProjectPage() {
    await requireOwnerSession();
    return <ProjectNew />;
}

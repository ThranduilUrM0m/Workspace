import type { Metadata } from 'next';
import { ProjectsList } from '@/components/owner/projects/ProjectsList';
import { requireOwnerSession } from '@/lib/owner-auth';
import '@/styles/list.css';
import '@/styles/projects.css';

export const metadata: Metadata = { title: 'Projects' };

export default async function ProjectsPage() {
    await requireOwnerSession();
    return <ProjectsList />;
}

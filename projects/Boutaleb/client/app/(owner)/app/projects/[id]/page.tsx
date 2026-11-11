import type { Metadata } from 'next';
import { ProjectRecord } from '@/components/owner/projects/ProjectRecord';
import { tabFrom } from '@/lib/projects/tabs';
import { requireOwnerSession } from '@/lib/owner-auth';
import '@/styles/list.css';
import '@/styles/record.css';
import '@/styles/project.css';
import '@/styles/intake.css';
import '@/styles/plan.css';

export const metadata: Metadata = { title: 'Project' };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string | string[] }> };

// The project record. The tab is an address (?tab=), so a tab can be
// shared, reloaded and opened alone; an unknown one falls back to Overview.
export default async function ProjectPage({ params, searchParams }: Props) {
    await requireOwnerSession();
    const [{ id }, { tab }] = await Promise.all([params, searchParams]);
    return <ProjectRecord id={id} tab={tabFrom(Array.isArray(tab) ? tab[0] : tab)} />;
}
